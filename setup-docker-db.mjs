// Setup tables and data in Docker PostgreSQL
import pg from 'pg'
const { Pool } = pg

const pool = new Pool({
    connectionString: 'postgresql://yarijoo:yarijoo_dev_pass@localhost:5432/yarijoo_v2'
})

async function run() {
    const client = await pool.connect()
    console.log('✅ Connected to Docker PostgreSQL')

    try {
        // Create missing tables
        await client.query(`
            CREATE TABLE IF NOT EXISTS composite_packages (
                id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
                title TEXT NOT NULL,
                description TEXT,
                price INT NOT NULL DEFAULT 0,
                sale_price INT,
                is_active BOOLEAN DEFAULT true,
                cover_image TEXT,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            );
            CREATE TABLE IF NOT EXISTS composite_package_items (
                id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
                package_id TEXT NOT NULL REFERENCES composite_packages(id) ON DELETE CASCADE,
                item_type TEXT NOT NULL,
                item_id TEXT NOT NULL,
                item_title TEXT,
                sort_order INT DEFAULT 0,
                created_at TIMESTAMPTZ DEFAULT NOW()
            );
            CREATE TABLE IF NOT EXISTS sms_packages (
                id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
                title TEXT NOT NULL,
                description TEXT,
                price INT NOT NULL DEFAULT 0,
                duration_days INT NOT NULL DEFAULT 30,
                send_hour INT NOT NULL DEFAULT 8,
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            );
            CREATE TABLE IF NOT EXISTS sms_package_messages (
                id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
                package_id TEXT NOT NULL REFERENCES sms_packages(id) ON DELETE CASCADE,
                day_number INT NOT NULL,
                message TEXT NOT NULL,
                created_at TIMESTAMPTZ DEFAULT NOW()
            );
            CREATE TABLE IF NOT EXISTS user_sms_subscriptions (
                id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
                user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                package_id TEXT NOT NULL REFERENCES sms_packages(id),
                started_at TIMESTAMPTZ DEFAULT NOW(),
                current_day INT DEFAULT 1,
                is_active BOOLEAN DEFAULT true,
                next_send_at TIMESTAMPTZ,
                created_at TIMESTAMPTZ DEFAULT NOW()
            );
            CREATE TABLE IF NOT EXISTS planner_events (
                id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
                user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                title TEXT NOT NULL,
                description TEXT,
                event_date DATE NOT NULL,
                event_time TIME,
                color TEXT DEFAULT '#1B4332',
                sms_reminder BOOLEAN DEFAULT false,
                reminder_minutes INT DEFAULT 60,
                is_done BOOLEAN DEFAULT false,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            );
            CREATE TABLE IF NOT EXISTS book_pages (
                id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
                book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                page_order INT DEFAULT 0,
                created_at TIMESTAMPTZ DEFAULT NOW()
            );
            CREATE INDEX IF NOT EXISTS idx_cp_items_package ON composite_package_items(package_id);
            CREATE INDEX IF NOT EXISTS idx_sms_msgs_package ON sms_package_messages(package_id);
            CREATE INDEX IF NOT EXISTS idx_sms_subs_user ON user_sms_subscriptions(user_id);
            CREATE INDEX IF NOT EXISTS idx_planner_user_date ON planner_events(user_id, event_date);
            CREATE INDEX IF NOT EXISTS idx_book_pages_book_id ON book_pages(book_id);
        `)
        console.log('✅ Tables created')

        // Check psychologist count
        const psyCount = await client.query('SELECT COUNT(*) FROM psychologist_profiles')
        console.log('Psychologists:', psyCount.rows[0].count)

        if (parseInt(psyCount.rows[0].count) === 0) {
            // Add sample psychologists
            await client.query(`
                INSERT INTO users (id, phone, full_name, role, is_verified, created_at, updated_at)
                VALUES 
                    ('psy-uuid-001', '+989121111001', 'دکتر سارا احمدی', 'PSYCHOLOGIST', true, NOW(), NOW()),
                    ('psy-uuid-002', '+989121111002', 'دکتر محمد رضایی', 'PSYCHOLOGIST', true, NOW(), NOW()),
                    ('psy-uuid-003', '+989121111003', 'دکتر فاطمه موسوی', 'PSYCHOLOGIST', true, NOW(), NOW())
                ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name, role = EXCLUDED.role
            `)

            const users = await client.query(`
                SELECT id, phone FROM users 
                WHERE phone IN ('+989121111001', '+989121111002', '+989121111003')
            `)

            for (const u of users.rows) {
                const data = {
                    '+989121111001': { bio: 'متخصص روانشناسی بالینی با بیش از ۱۰ سال تجربه در زمینه اضطراب، افسردگی و روابط زوجین.', specialty: ['اضطراب', 'افسردگی', 'روابط زوجین'], rate: 350000, rating: 4.8, reviews: 124, license: 'PSY-001' },
                    '+989121111002': { bio: 'روانپزشک و روان‌درمانگر با تخصص در اختلالات خلق و رفتاری. دارای گواهینامه CBT.', specialty: ['اختلالات خلق', 'رفتاردرمانی', 'CBT'], rate: 450000, rating: 4.6, reviews: 87, license: 'PSY-002' },
                    '+989121111003': { bio: 'مشاور خانواده و متخصص روانشناسی کودک و نوجوان با ۸ سال تجربه بالینی.', specialty: ['کودک و نوجوان', 'خانواده‌درمانی', 'مشاوره تحصیلی'], rate: 280000, rating: 4.9, reviews: 156, license: 'PSY-003' },
                }
                const d = data[u.phone]
                if (!d) continue
                await client.query(`
                    INSERT INTO psychologist_profiles (id, user_id, bio, specialty, license_no, hourly_rate, is_verified, is_available, rating, review_count, availability)
                    VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, true, true, $6, $7, '{}')
                    ON CONFLICT (user_id) DO NOTHING
                `, [u.id, d.bio, d.specialty, d.license, d.rate, d.rating, d.reviews])
            }
            console.log('✅ Psychologists added')
        } else {
            console.log('✅ Psychologists already exist')
        }

        // Check book_pages
        const bpCount = await client.query('SELECT COUNT(*) FROM book_pages')
        console.log('Book pages in Docker:', bpCount.rows[0].count)

        // Check key data counts
        const counts = await client.query(`
            SELECT 
                (SELECT COUNT(*) FROM books) as books,
                (SELECT COUNT(*) FROM blog_posts) as blog,
                (SELECT COUNT(*) FROM stories) as stories,
                (SELECT COUNT(*) FROM products) as products,
                (SELECT COUNT(*) FROM tests) as tests,
                (SELECT COUNT(*) FROM users) as users
        `)
        console.log('Data counts:', counts.rows[0])

    } finally {
        client.release()
        await pool.end()
    }
}

run().catch(e => { console.error('Error:', e.message); process.exit(1) })
