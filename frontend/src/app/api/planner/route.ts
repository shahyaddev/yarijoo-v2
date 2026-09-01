import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

const pool = new Pool({ connectionString: 'postgresql://yarijoo:yarijoo_dev_pass@localhost:5432/yarijoo_v2' })

function getUserId(req: NextRequest): string | null {
    try {
        const token = (req.headers.get('authorization') ?? '').replace('Bearer ', '')
        if (!token) return null
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString())
        return payload.sub ?? null
    } catch { return null }
}

export async function GET(req: NextRequest) {
    const userId = getUserId(req)
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const year = searchParams.get('year') ?? new Date().getFullYear()
    const month = searchParams.get('month') ?? (new Date().getMonth() + 1)

    const { rows } = await pool.query(
        `SELECT * FROM planner_events
         WHERE user_id = $1
           AND EXTRACT(YEAR FROM event_date) = $2
           AND EXTRACT(MONTH FROM event_date) = $3
         ORDER BY event_date, event_time`,
        [userId, year, month]
    )
    return NextResponse.json({ data: rows })
}

export async function POST(req: NextRequest) {
    const userId = getUserId(req)
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { title, description, event_date, event_time, color, sms_reminder, reminder_minutes } = body

    if (!title || !event_date) return NextResponse.json({ error: 'title and event_date required' }, { status: 400 })

    const { rows } = await pool.query(
        `INSERT INTO planner_events (user_id, title, description, event_date, event_time, color, sms_reminder, reminder_minutes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [userId, title, description || null, event_date, event_time || null, color || '#1B4332', !!sms_reminder, reminder_minutes || 60]
    )
    return NextResponse.json({ data: rows[0] })
}

export async function PATCH(req: NextRequest) {
    const userId = getUserId(req)
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const body = await req.json()
    const { is_done, title, description, color, sms_reminder } = body

    await pool.query(
        `UPDATE planner_events SET
            is_done = COALESCE($1, is_done),
            title = COALESCE($2, title),
            description = COALESCE($3, description),
            color = COALESCE($4, color),
            sms_reminder = COALESCE($5, sms_reminder),
            updated_at = NOW()
         WHERE id = $6 AND user_id = $7`,
        [is_done, title || null, description || null, color || null, sms_reminder, id, userId]
    )
    return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest) {
    const userId = getUserId(req)
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    await pool.query('DELETE FROM planner_events WHERE id = $1 AND user_id = $2', [id, userId])
    return NextResponse.json({ success: true })
}
