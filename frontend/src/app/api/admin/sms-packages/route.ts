import { NextResponse } from 'next/server'
import { Pool } from 'pg'

const pool = new Pool({ connectionString: 'postgresql://yarijoo:yarijoo_dev_pass@localhost:5432/yarijoo_v2' })

export async function GET() {
    try {
        const { rows } = await pool.query(`
      SELECT sp.*,
        COUNT(spm.id)::int as message_count
      FROM sms_packages sp
      LEFT JOIN sms_package_messages spm ON spm.package_id = sp.id
      GROUP BY sp.id
      ORDER BY sp.created_at DESC
    `)
        return NextResponse.json({ success: true, data: rows })
    } catch (e: unknown) {
        return NextResponse.json({ success: false, error: (e as Error).message }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { title, description, price, duration_days, send_hour, messages } = body

        const client = await pool.connect()
        try {
            await client.query('BEGIN')

            const pkgRes = await client.query(
                `INSERT INTO sms_packages (title, description, price, duration_days, send_hour)
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
                [title, description || null, price || 0, duration_days || 30, send_hour ?? 8]
            )
            const pkgId = pkgRes.rows[0].id

            if (messages?.length) {
                for (let i = 0; i < messages.length; i++) {
                    const msg = messages[i]
                    if (msg.message?.trim()) {
                        await client.query(
                            `INSERT INTO sms_package_messages (package_id, day_number, message)
               VALUES ($1, $2, $3)`,
                            [pkgId, msg.day_number ?? i + 1, msg.message.trim()]
                        )
                    }
                }
            }

            await client.query('COMMIT')
            return NextResponse.json({ success: true, data: { id: pkgId } })
        } catch (e) {
            await client.query('ROLLBACK')
            throw e
        } finally {
            client.release()
        }
    } catch (e: unknown) {
        return NextResponse.json({ success: false, error: (e as Error).message }, { status: 500 })
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const id = searchParams.get('id')
        if (!id) return NextResponse.json({ success: false, error: 'id required' }, { status: 400 })
        await pool.query('DELETE FROM sms_packages WHERE id = $1', [id])
        return NextResponse.json({ success: true })
    } catch (e: unknown) {
        return NextResponse.json({ success: false, error: (e as Error).message }, { status: 500 })
    }
}

export async function PATCH(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const id = searchParams.get('id')
        if (!id) return NextResponse.json({ success: false, error: 'id required' }, { status: 400 })
        const body = await req.json()
        await pool.query(
            `UPDATE sms_packages SET is_active = $1, updated_at = NOW() WHERE id = $2`,
            [body.is_active, id]
        )
        return NextResponse.json({ success: true })
    } catch (e: unknown) {
        return NextResponse.json({ success: false, error: (e as Error).message }, { status: 500 })
    }
}
