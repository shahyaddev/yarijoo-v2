/**
 * table-map.ts
 *
 * Maps each legacy MySQL test table name to its unified slug for migration.
 * Derived from: odtjonaf_yarijoo(11).sql
 *
 * Legacy schema pattern:
 *   {slug}_questions  → test question rows
 *   {slug}_results    → user test result rows
 *
 * Users table column mapping:
 *   Legacy: id, phone_number, password, name, family_name, status, role, created_at
 *   New:    id, phone,        password, fullName,             -,     isSuspended, role, createdAt
 *
 * Role mapping (legacy int → new UserRole enum):
 *   1 → USER
 *   2 → ADMIN
 *
 * Encoding note: All legacy tables use utf8mb4_unicode_ci — safe conversion to PostgreSQL UTF-8.
 * Legacy utf8mb3 tables (if any) require explicit charset conversion during migration.
 *
 * Data inconsistencies found:
 *   - Some results rows may have user_id = NULL → skip on migration
 *   - Duplicate phone_number entries possible → keep latest record, skip others
 *   - Some result rows reference deleted users → skip (FK not satisfiable)
 */

export interface TestTableMap {
    /** Legacy table slug — e.g. "bdi" maps to bdi_questions and bdi_results */
    slug: string
    /** Display title for the test (Persian) */
    title: string
    /** Psychological category */
    category: string
    /** Primary score column in results table */
    scoreColumn: string
    /** Additional subscale score columns if present */
    subscaleColumns?: string[]
    /** Scoring type to use */
    scoringType: 'SUM' | 'WEIGHTED' | 'SUBSCALE' | 'CUSTOM'
}

export const TEST_TABLE_MAP: TestTableMap[] = [
    { slug: 'abs', title: 'مقیاس عاطفه مثبت و منفی (ABS)', category: 'هیجان', scoreColumn: 'total_score', subscaleColumns: ['positive_affect', 'negative_affect'], scoringType: 'SUBSCALE' },
    { slug: 'acs', title: 'مقیاس سبک‌های مقابله با استرس (ACS)', category: 'استرس', scoreColumn: 'total_score', scoringType: 'SUM' },
    { slug: 'aggression', title: 'پرسشنامه پرخاشگری', category: 'رفتار', scoreColumn: 'total_score', scoringType: 'SUM' },
    { slug: 'ahs', title: 'مقیاس امید اشنایدر (AHS)', category: 'رشد فردی', scoreColumn: 'total_score', scoringType: 'SUM' },
    { slug: 'appq', title: 'پرسشنامه ترس از پانیک (APPQ)', category: 'اضطراب', scoreColumn: 'total_score', scoringType: 'SUM' },
    { slug: 'aq', title: 'پرسشنامه پرسش‌گری (AQ)', category: 'شناختی', scoreColumn: 'total_score', scoringType: 'SUM' },
    { slug: 'atq', title: 'پرسشنامه افکار خودکار (ATQ)', category: 'شناختی', scoreColumn: 'total_score', scoringType: 'SUM' },
    { slug: 'bai', title: 'پرسشنامه اضطراب بک (BAI)', category: 'اضطراب', scoreColumn: 'total_score', scoringType: 'SUM' },
    { slug: 'bdi', title: 'مقیاس افسردگی بک (BDI)', category: 'افسردگی', scoreColumn: 'total_score', scoringType: 'SUM' },
    { slug: 'beck_hopelessness', title: 'مقیاس ناامیدی بک (BHS)', category: 'افسردگی', scoreColumn: 'total_score', scoringType: 'SUM' },
    { slug: 'bell', title: 'پرسشنامه تطابق بل (Bell)', category: 'شخصیت', scoreColumn: 'total_score', scoringType: 'SUBSCALE' },
    { slug: 'berzonsky_identity', title: 'مقیاس سبک هویت برزونسکی (ISI)', category: 'شخصیت', scoreColumn: 'total_score', subscaleColumns: ['informational', 'normative', 'diffuse_avoidant'], scoringType: 'SUBSCALE' },
    { slug: 'capt', title: 'پرسشنامه رویکردهای یادگیری (CAPT)', category: 'شناختی', scoreColumn: 'total_score', scoringType: 'SUBSCALE' },
    { slug: 'caq', title: 'پرسشنامه اضطراب کودکان (CAQ)', category: 'اضطراب', scoreColumn: 'total_score', scoringType: 'SUM' },
    { slug: 'cdrisc', title: 'مقیاس تاب‌آوری کانر-دیویدسون (CD-RISC)', category: 'رشد فردی', scoreColumn: 'total_score', scoringType: 'SUM' },
    { slug: 'ciss', title: 'پرسشنامه مقابله با موقعیت‌های استرس‌زا (CISS)', category: 'استرس', scoreColumn: 'total_score', subscaleColumns: ['task', 'emotion', 'avoidance'], scoringType: 'SUBSCALE' },
    { slug: 'crowne_marlowe_social_desirability', title: 'مقیاس مطلوبیت اجتماعی کراون-مارلو', category: 'شخصیت', scoreColumn: 'total_score', scoringType: 'SUM' },
    { slug: 'das', title: 'مقیاس نگرش‌های ناکارآمد (DAS)', category: 'افسردگی', scoreColumn: 'total_score', scoringType: 'SUM' },
    { slug: 'emotional_balance_spindiner', title: 'مقیاس تعادل عاطفی اسپیندینر', category: 'هیجان', scoreColumn: 'total_score', scoringType: 'SUM' },
    { slug: 'emotional_divorce', title: 'پرسشنامه طلاق عاطفی', category: 'روابط', scoreColumn: 'total_score', scoringType: 'SUM' },
    { slug: 'emss', title: 'مقیاس تجربه‌های معنادار عاطفی (EMSS)', category: 'هیجان', scoreColumn: 'total_score', scoringType: 'SUM' },
    { slug: 'enrich', title: 'پرسشنامه رضایت زناشویی اینریچ (ENRICH)', category: 'روابط', scoreColumn: 'total_score', scoringType: 'SUBSCALE' },
    { slug: 'eqi', title: 'پرسشنامه هوش هیجانی (EQ-i)', category: 'هیجان', scoreColumn: 'total_score', scoringType: 'SUBSCALE' },
    { slug: 'faces_iii', title: 'مقیاس انعطاف‌پذیری و انسجام خانواده (FACES III)', category: 'روابط', scoreColumn: 'total_score', subscaleColumns: ['cohesion', 'adaptability'], scoringType: 'SUBSCALE' },
    { slug: 'fad', title: 'ابزار ارزیابی خانواده (FAD)', category: 'روابط', scoreColumn: 'total_score', scoringType: 'SUBSCALE' },
    { slug: 'fmi_sf', title: 'فرم کوتاه پرسشنامه ذهن‌آگاهی فرایبورگ (FMI-SF)', category: 'ذهن‌آگاهی', scoreColumn: 'total_score', scoringType: 'SUM' },
    { slug: 'gdms', title: 'مقیاس سبک‌های تصمیم‌گیری عمومی (GDMS)', category: 'شناختی', scoreColumn: 'total_score', scoringType: 'SUBSCALE' },
    { slug: 'gds', title: 'مقیاس افسردگی سالمندان (GDS)', category: 'افسردگی', scoreColumn: 'total_score', scoringType: 'SUM' },
    { slug: 'geas', title: 'مقیاس نگرش به پیری گلد (GEAS)', category: 'رشد فردی', scoreColumn: 'total_score', scoringType: 'SUM' },
    { slug: 'geriatric_depression', title: 'مقیاس افسردگی جریاتریک', category: 'افسردگی', scoreColumn: 'total_score', scoringType: 'SUM' },
    { slug: 'glasser_needs', title: 'پرسشنامه نیازهای گلاسر', category: 'شخصیت', scoreColumn: 'total_score', scoringType: 'SUBSCALE' },
    { slug: 'hama', title: 'مقیاس اضطراب هامیلتون (HAMA)', category: 'اضطراب', scoreColumn: 'total_score', scoringType: 'SUM' },
    { slug: 'hamilton_anxiety', title: 'پرسشنامه اضطراب هامیلتون', category: 'اضطراب', scoreColumn: 'total_score', scoringType: 'SUM' },
    { slug: 'hisd', title: 'پرسشنامه افسردگی بر اساس DSM (HISD)', category: 'افسردگی', scoreColumn: 'total_score', scoringType: 'SUM' },
    { slug: 'hpi', title: 'پرسشنامه شخصیت هوگان (HPI)', category: 'شخصیت', scoreColumn: 'total_score', scoringType: 'SUBSCALE' },
    { slug: 'iat', title: 'آزمون اعتیاد به اینترنت (IAT)', category: 'رفتار', scoreColumn: 'total_score', scoringType: 'SUM' },
    { slug: 'ibt', title: 'پرسشنامه باورهای غیرمنطقی (IBT)', category: 'شناختی', scoreColumn: 'total_score', scoringType: 'SUM' },
    { slug: 'idi', title: 'پرسشنامه وضعیت هویت (IDI)', category: 'شخصیت', scoreColumn: 'total_score', scoringType: 'SUBSCALE' },
    { slug: 'kims', title: 'پرسشنامه مهارت‌های ذهن‌آگاهی کنتاکی (KIMS)', category: 'ذهن‌آگاهی', scoreColumn: 'total_score', scoringType: 'SUBSCALE' },
    { slug: 'marital', title: 'پرسشنامه رضایت زناشویی', category: 'روابط', scoreColumn: 'total_score', scoringType: 'SUM' },
    { slug: 'markham_stress', title: 'پرسشنامه استرس مارکهام', category: 'استرس', scoreColumn: 'total_score', scoringType: 'SUM' },
    { slug: 'mhs', title: 'مقیاس سلامت ذهنی (MHS)', category: 'سلامت روان', scoreColumn: 'total_score', scoringType: 'SUM' },
    { slug: 'mis', title: 'شاخص بلوغ بین‌فردی (MIS)', category: 'روابط', scoreColumn: 'total_score', scoringType: 'SUM' },
    { slug: 'mofs', title: 'مقیاس ترس از شکست (MOFS)', category: 'رشد فردی', scoreColumn: 'total_score', scoringType: 'SUM' },
    { slug: 'oxh', title: 'پرسشنامه شادی آکسفورد (OHQ)', category: 'رشد فردی', scoreColumn: 'total_score', scoringType: 'SUM' },
    { slug: 'paq', title: 'پرسشنامه اضطراب اجتماعی (PAQ)', category: 'اضطراب', scoreColumn: 'total_score', scoringType: 'SUM' },
    { slug: 'penn_state_worry', title: 'پرسشنامه نگرانی پنسیلوانیا (PSWQ)', category: 'اضطراب', scoreColumn: 'total_score', scoringType: 'SUM' },
    { slug: 'pope_self_esteem', title: 'مقیاس عزت نفس پوپ', category: 'رشد فردی', scoreColumn: 'total_score', scoringType: 'SUM' },
    { slug: 'raas', title: 'مقیاس ارزیابی دلبستگی رابطه‌ای (RAAS)', category: 'روابط', scoreColumn: 'total_score', subscaleColumns: ['close', 'depend', 'anxiety'], scoringType: 'SUBSCALE' },
    { slug: 'ras', title: 'مقیاس ارزیابی رابطه (RAS)', category: 'روابط', scoreColumn: 'total_score', scoringType: 'SUM' },
    { slug: 'rotter', title: 'مقیاس کنترل درونی-بیرونی راتر', category: 'شخصیت', scoreColumn: 'total_score', scoringType: 'SUM' },
    { slug: 'rses', title: 'مقیاس عزت نفس روزنبرگ (RSES)', category: 'رشد فردی', scoreColumn: 'total_score', scoringType: 'SUM' },
    { slug: 'scl', title: 'چک‌لیست نشانه‌های روانشناختی (SCL-90)', category: 'سلامت روان', scoreColumn: 'total_score', scoringType: 'SUBSCALE' },
    { slug: 'scs_lf', title: 'مقیاس شفقت به خود - فرم بلند (SCS-LF)', category: 'رشد فردی', scoreColumn: 'total_score', scoringType: 'SUBSCALE' },
    { slug: 'scs_sf', title: 'مقیاس شفقت به خود - فرم کوتاه (SCS-SF)', category: 'رشد فردی', scoreColumn: 'total_score', scoringType: 'SUBSCALE' },
    { slug: 'selsa', title: 'مقیاس تنهایی اجتماعی و هیجانی (SELSA)', category: 'روابط', scoreColumn: 'total_score', scoringType: 'SUBSCALE' },
    { slug: 'shq', title: 'پرسشنامه سلامت عمومی (SHQ)', category: 'سلامت روان', scoreColumn: 'total_score', scoringType: 'SUM' },
    { slug: 'spas', title: 'مقیاس اضطراب اجتماعی عملکرد (SPAS)', category: 'اضطراب', scoreColumn: 'total_score', scoringType: 'SUM' },
    { slug: 'spi', title: 'شاخص حساسیت مجازات (SPI)', category: 'شخصیت', scoreColumn: 'total_score', scoringType: 'SUM' },
    { slug: 'stai', title: 'پرسشنامه اضطراب حالت-صفت اسپیلبرگر (STAI)', category: 'اضطراب', scoreColumn: 'total_score', subscaleColumns: ['state', 'trait'], scoringType: 'SUBSCALE' },
    { slug: 'steinmetz', title: 'پرسشنامه استرس شغلی اشتاینمتز', category: 'استرس', scoreColumn: 'total_score', scoringType: 'SUM' },
    { slug: 'steinmetz_job_stress', title: 'مقیاس استرس شغلی اشتاینمتز (نسخه ۲)', category: 'استرس', scoreColumn: 'total_score', scoringType: 'SUM' },
    { slug: 'swls', title: 'مقیاس رضایت از زندگی (SWLS)', category: 'رشد فردی', scoreColumn: 'total_score', scoringType: 'SUM' },
    { slug: 'ticket', title: 'پرسشنامه تیکت (Ticket)', category: 'سلامت روان', scoreColumn: 'total_score', scoringType: 'SUM' },
    { slug: 'trust', title: 'پرسشنامه اعتماد', category: 'روابط', scoreColumn: 'total_score', scoringType: 'SUM' },
    { slug: 'ttct', title: 'آزمون تفکر خلاق تورنس (TTCT)', category: 'شناختی', scoreColumn: 'total_score', scoringType: 'SUM' },
    { slug: 'tyl', title: 'پرسشنامه سبک یادگیری تانن‌بام (TYL)', category: 'شناختی', scoreColumn: 'total_score', scoringType: 'SUBSCALE' },
    { slug: 'ybocs', title: 'مقیاس وسواس فکری-عملی ییل-براون (Y-BOCS)', category: 'اضطراب', scoreColumn: 'total_score', subscaleColumns: ['obsessions', 'compulsions'], scoringType: 'SUBSCALE' },
]

/**
 * Quick lookup: slug → TestTableMap entry
 */
export const TEST_TABLE_MAP_BY_SLUG = Object.fromEntries(
    TEST_TABLE_MAP.map((t) => [t.slug, t])
)

/**
 * Legacy users column mapping
 *
 * Legacy column       → New column
 * ─────────────────────────────────
 * id                  → id (preserve as reference; new UUID assigned in migration)
 * phone_number        → phone (+98 prefix normalised)
 * password            → password (bcrypt hash preserved)
 * name + family_name  → fullName (concatenated)
 * status              → isSuspended (status=0 → suspended=true, status=1 → suspended=false)
 * role                → role (1=USER, 2=ADMIN)
 * created_at          → createdAt
 * updated_at          → updatedAt
 */
export const USER_COLUMN_MAP = {
    id: 'legacyId',
    phone_number: 'phone',
    password: 'password',
    name: 'firstName',
    family_name: 'lastName',
    status: 'isSuspended',
    role: 'role',
    created_at: 'createdAt',
    updated_at: 'updatedAt',
} as const

/**
 * Legacy role int → new UserRole enum
 */
export const ROLE_MAP: Record<number, string> = {
    1: 'USER',
    2: 'ADMIN',
}

/**
 * All non-test legacy tables that need migration
 */
export const ECOMMERCE_TABLE_MAP = {
    users: 'users',
    orders: 'orders',
    blog_posts: 'blog_posts',
    books: 'books',
    products: 'products',
    categories: 'categories',
    addresses: 'addresses',
} as const
