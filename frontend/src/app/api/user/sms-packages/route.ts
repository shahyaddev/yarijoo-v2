import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

const pool = new Pool({ connectionString: 'postgresql://yarijoo:yarijoo_dev_pass@localhost:5432/yarijoo_v2' })

/** Decode the user id from a simple JWT (no verification needed here — we trust the backend issued it) */
function getUserIdFromToken(token: string): string | null {
    try {
        const parts = token.split('.')
        if (parts.length !== 3) return null
        const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'))
        return payload.sub ?? payload.userId ?? payload.id ?? null
    } catch {
        return null
    }
}

export async function GET(req: NextRequest) {
    try {
        const authHeader = req.headers.get('authorization') ?? ''
        const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
        if (!token) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const userId = getUserIdFromToken(token)
        if (!userId) {
            return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 })
        }

        // Get user's active subscriptions with package info
        const { rows: subs } = await pool.query(
            `SELECT
        uss.*,
        sp.title as package_title,
        sp.description as package_description,
        sp.duration_days,
        sp.send_hour
       FROM user_sms_subscriptions uss
       JOIN sms_packages sp ON sp.id = uss.package_id
       WHERE uss.user_id = $1 AND uss.is_active = true
       ORDER BY uss.created_at DESC`,
            [userId]
        )

        // For each subscription, get past messages (day 1 to current_day)
        const enriched = await Promise.all(
            subs.map(async (sub) => {
                const { rows: messages } = await pool.query(
                    `SELECT day_number, message FROM sms_package_messages
           WHERE package_id = $1 AND day_number <= $2
           ORDER BY day_number ASC`,
                    [sub.package_id, sub.current_day]
                )
                return { ...sub, past_messages: messages }
            })
        )

        return NextResponse.json({ success: true, data: enriched })
    } catch (e: unknown) {
        return NextResponse.json({ success: false, error: (e as Error).message }, { status: 500 })
    }
}
