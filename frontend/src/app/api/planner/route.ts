import { NextRequest, NextResponse } from 'next/server'
import { Pool, types } from 'pg'

// Return DATE columns as plain 'YYYY-MM-DD' strings — avoids timezone shifts
types.setTypeParser(1082, (val: string) => val)

const pool = new Pool({
    connectionString: process.env.DATABASE_URL ?? 'postgresql://yarijoo:yarijoo_dev_pass@localhost:5432/yarijoo_v2',
})

function getUserId(req: NextRequest): string | null {
    try {
        const token = (req.headers.get('authorization') ?? '').replace('Bearer ', '')
        if (!token) return null
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString())
        return payload.sub ?? null
    } catch { return null }
}

function pad(n: number) { return String(n).padStart(2, '0') }

export async function GET(req: NextRequest) {
    try {
        const userId = getUserId(req)
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const sp = new URL(req.url).searchParams

        // A Jalali month spans parts of 2 Gregorian months.
        // Frontend sends yearStart/monthStart (first Gregorian month) and yearEnd/monthEnd (last).
        const yearStart  = parseInt(sp.get('yearStart')  ?? sp.get('year')  ?? String(new Date().getFullYear()))
        const monthStart = parseInt(sp.get('monthStart') ?? sp.get('month') ?? String(new Date().getMonth() + 1))
        const yearEnd    = parseInt(sp.get('yearEnd')    ?? String(yearStart))
        const monthEnd   = parseInt(sp.get('monthEnd')   ?? String(monthStart))

        // Start of first month
        const startStr = `${yearStart}-${pad(monthStart)}-01`

        // Start of the month AFTER the last month (exclusive upper bound)
        const nextMonth = monthEnd === 12 ? 1 : monthEnd + 1
        const nextYear  = monthEnd === 12 ? yearEnd + 1 : yearEnd
        const endStr    = `${nextYear}-${pad(nextMonth)}-01`

        const { rows } = await pool.query(
            `SELECT * FROM planner_events
             WHERE user_id   = $1
               AND event_date >= $2::date
               AND event_date <  $3::date
             ORDER BY event_date, event_time NULLS LAST`,
            [userId, startStr, endStr]
        )
        return NextResponse.json({ data: rows })
    } catch (e) {
        console.error('[planner GET]', e)
        return NextResponse.json({ error: 'server error' }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const userId = getUserId(req)
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const body = await req.json()
        const { title, description, event_date, event_time, color, sms_reminder, reminder_minutes } = body

        if (!title || !event_date) return NextResponse.json({ error: 'title and event_date required' }, { status: 400 })

        const { rows } = await pool.query(
            `INSERT INTO planner_events
                (user_id, title, description, event_date, event_time, color, sms_reminder, reminder_minutes)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
            [userId, title, description || null, event_date, event_time || null, color || '#1B4332', !!sms_reminder, reminder_minutes || 60]
        )
        return NextResponse.json({ data: rows[0] })
    } catch (e) {
        console.error('[planner POST]', e)
        return NextResponse.json({ error: 'server error' }, { status: 500 })
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const userId = getUserId(req)
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const id = new URL(req.url).searchParams.get('id')
        if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

        const body = await req.json()
        const { is_done, title, description, color, sms_reminder } = body

        await pool.query(
            `UPDATE planner_events SET
                is_done      = COALESCE($1, is_done),
                title        = COALESCE($2, title),
                description  = COALESCE($3, description),
                color        = COALESCE($4, color),
                sms_reminder = COALESCE($5, sms_reminder),
                updated_at   = NOW()
             WHERE id = $6 AND user_id = $7`,
            [is_done ?? null, title || null, description || null, color || null, sms_reminder ?? null, id, userId]
        )
        return NextResponse.json({ success: true })
    } catch (e) {
        console.error('[planner PATCH]', e)
        return NextResponse.json({ error: 'server error' }, { status: 500 })
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const userId = getUserId(req)
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const id = new URL(req.url).searchParams.get('id')
        if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

        await pool.query('DELETE FROM planner_events WHERE id = $1 AND user_id = $2', [id, userId])
        return NextResponse.json({ success: true })
    } catch (e) {
        console.error('[planner DELETE]', e)
        return NextResponse.json({ error: 'server error' }, { status: 500 })
    }
}
