import { NextResponse } from 'next/server'
import { Pool } from 'pg'

const pool = new Pool({ connectionString: 'postgresql://yarijoo:yarijoo_dev_pass@localhost:5432/yarijoo_v2' })

const TABLE_MAP: Record<string, string> = {
    book: 'books',
    story: 'stories',
    test: 'tests',
    product: 'products',
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') ?? 'book'
    const q = searchParams.get('q') ?? ''

    const table = TABLE_MAP[type]
    if (!table) return NextResponse.json({ data: [] })

    try {
        let query: string
        if (type === 'story') {
            query = `SELECT id, COALESCE(title, LEFT(content, 60)) as title FROM stories WHERE COALESCE(title, content) ILIKE $1 LIMIT 10`
        } else {
            query = `SELECT id, title FROM ${table} WHERE title ILIKE $1 LIMIT 10`
        }
        const { rows } = await pool.query(query, [`%${q}%`])
        return NextResponse.json({ data: rows })
    } catch (e: unknown) {
        return NextResponse.json({ data: [], error: (e as Error).message })
    }
}
