/**
 * Yarijoo V2 — Database Seed Script
 * Populates: categories, tests+questions+interpretations, courses+lessons,
 *            books+pages, blog posts, stories, psychologist profiles,
 *            products, settings, admin user
 *
 * Run: npx ts-node --project tsconfig.json prisma/seed.ts
 */

import { PrismaClient, ScoringType, ContentStatus, TestStatus, UserRole } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

// ─── helpers ────────────────────────────────────────────────────────────────

function slug(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .slice(0, 60)
}

// ─── CATEGORIES ─────────────────────────────────────────────────────────────

async function seedCategories() {
  console.log('📂 Seeding categories…')

  const cats = [
    // Blog
    { name: 'سلامت روان', slug: 'mental-health', type: 'blog' },
    { name: 'اضطراب و استرس', slug: 'anxiety-stress', type: 'blog' },
    { name: 'افسردگی', slug: 'depression-blog', type: 'blog' },
    { name: 'روابط', slug: 'relationships-blog', type: 'blog' },
    { name: 'رشد فردی', slug: 'personal-growth', type: 'blog' },
    // Books
    { name: 'روانشناسی عمومی', slug: 'general-psychology', type: 'book' },
    { name: 'مدیریت هیجان', slug: 'emotion-management', type: 'book' },
    { name: 'ذهن‌آگاهی', slug: 'mindfulness-book', type: 'book' },
    // Courses
    { name: 'مدیریت اضطراب', slug: 'anxiety-management-course', type: 'course' },
    { name: 'ذهن‌آگاهی', slug: 'mindfulness-course', type: 'course' },
    { name: 'مهارت‌های ارتباطی', slug: 'communication-skills', type: 'course' },
    { name: 'رشد فردی', slug: 'personal-growth-course', type: 'course' },
  ]

  const created: Record<string, string> = {}
  for (const cat of cats) {
    const c = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    })
    created[cat.slug] = c.id
  }
  console.log(`   ✓ ${cats.length} categories`)
  return created
}

// ─── ADMIN USER ──────────────────────────────────────────────────────────────

async function seedAdminUser() {
  console.log('👤 Seeding admin user…')
  const existing = await prisma.user.findFirst({ where: { role: UserRole.SUPER_ADMIN } })
  if (existing) {
    console.log(`   ✓ Admin already exists: ${existing.phone}`)
    return existing
  }

  const admin = await prisma.user.create({
    data: {
      phone: '+989100000000',
      fullName: 'مدیر ارشد یاری‌جو',
      role: UserRole.SUPER_ADMIN,
      isVerified: true,
    },
  })
  console.log(`   ✓ Created admin: ${admin.phone}`)
  return admin
}

// ─── TESTS ───────────────────────────────────────────────────────────────────

async function seedTests() {
  console.log('🧠 Seeding psychological tests…')

  const tests = [
    // ── GAD-7 (اضطراب) ─────────────────────────────────────────────────────
    {
      slug: 'gad7',
      title: 'مقیاس اضطراب فراگیر GAD-7',
      description: 'مقیاس ۷ سوالی برای سنجش اضطراب فراگیر. این ابزار استاندارد در کلینیک‌های سراسر جهان استفاده می‌شود.',
      category: 'اضطراب',
      scoringType: ScoringType.SUM,
      isPremium: false,
      duration: 5,
      status: TestStatus.PUBLISHED,
      questions: [
        'احساس ناراحتی، اضطراب یا تنش کرده‌اید',
        'نمی‌توانستید نگرانی‌هایتان را کنترل کنید',
        'نگرانی بیش از حد در مورد موضوعات مختلف داشتید',
        'آرام گرفتن برایتان مشکل بود',
        'آنقدر بی‌قرار بودید که نشستن آرام برایتان سخت بود',
        'به‌راحتی آزرده‌خاطر یا تحریک‌پذیر شدید',
        'احساس ترس کردید، انگار اتفاق بدی در راه است',
      ],
      interpretations: [
        { min: 0, max: 4, text: 'اضطراب حداقلی — در محدوده طبیعی قرار دارید', severity: 'low' },
        { min: 5, max: 9, text: 'اضطراب خفیف — توجه به تکنیک‌های آرام‌سازی توصیه می‌شود', severity: 'low' },
        { min: 10, max: 14, text: 'اضطراب متوسط — مشاوره با متخصص سلامت روان توصیه می‌شود', severity: 'medium' },
        { min: 15, max: 21, text: 'اضطراب شدید — نیاز به ارزیابی تخصصی دارید', severity: 'high' },
      ],
    },
    // ── BDI (افسردگی) ───────────────────────────────────────────────────────
    {
      slug: 'bdi',
      title: 'مقیاس افسردگی بک (BDI-II)',
      description: 'یکی از معتبرترین و پرکاربردترین ابزارهای ارزیابی افسردگی. شامل ۲۱ سوال در مورد احساسات و نگرش‌های دو هفته اخیر.',
      category: 'افسردگی',
      scoringType: ScoringType.SUM,
      isPremium: false,
      duration: 10,
      status: TestStatus.PUBLISHED,
      questions: [
        'احساس غم و اندوه می‌کنم',
        'نسبت به آینده ناامید هستم',
        'خودم را شکست‌خورده می‌بینم',
        'لذت زیادی از چیزها نمی‌برم',
        'احساس گناه می‌کنم',
        'احساس می‌کنم مستحق تنبیه هستم',
        'از خودم ناامید هستم',
        'خودم را از دیگران بدتر می‌دانم',
        'افکار خودکشی دارم',
        'بیشتر از حد معمول گریه می‌کنم',
        'تحریک‌پذیر شده‌ام',
        'علاقه‌ام به دیگران کم شده',
        'تصمیم‌گیری برایم سخت‌تر شده',
        'تصویر ذهنی‌ام از خودم بدتر شده',
        'برای انجام کارها انرژی کمتری دارم',
        'خوابم مختل شده',
        'زودتر از حد معمول خسته می‌شوم',
        'اشتهایم کم شده',
        'تمرکزم کاهش یافته',
        'بیشتر از قبل خسته می‌شوم',
        'علاقه‌ام به موضوعات جنسی کاهش یافته',
      ],
      interpretations: [
        { min: 0, max: 13, text: 'حداقلی — وضعیت خلقی شما در محدوده سالم است', severity: 'low' },
        { min: 14, max: 19, text: 'خفیف — نشانه‌هایی از خلق پایین وجود دارد', severity: 'low' },
        { min: 20, max: 28, text: 'متوسط — توصیه می‌شود با روانشناس مشورت کنید', severity: 'medium' },
        { min: 29, max: 63, text: 'شدید — نیاز به کمک حرفه‌ای فوری دارید', severity: 'high' },
      ],
    },
    // ── PSS (استرس) ─────────────────────────────────────────────────────────
    {
      slug: 'pss',
      title: 'مقیاس استرس ادراک‌شده (PSS-10)',
      description: 'آزمون PSS-10 میزان درک شما از موقعیت‌های استرس‌زا در یک ماه گذشته را ارزیابی می‌کند.',
      category: 'استرس',
      scoringType: ScoringType.SUM,
      isPremium: false,
      duration: 8,
      status: TestStatus.PUBLISHED,
      questions: [
        'ناراحت شدید به‌خاطر چیزهایی که به‌طور غیرمنتظره رخ داد',
        'احساس کردید که نمی‌توانید چیزهای مهم را در زندگی‌تان کنترل کنید',
        'احساس عصبانیت و استرس کردید',
        'با موفقیت با مشکلاتتان کنار آمدید',
        'با مشکلاتی که برایتان پیش آمد کنار آمدید',
        'احساس کردید می‌توانید با همه چیزهایی که باید انجام دهید کنار بیایید',
        'توانستید تحریک‌پذیری‌تان را کنترل کنید',
        'احساس کردید همه چیز زیر کنترل شماست',
        'عصبانی شدید به‌خاطر چیزهایی که خارج از کنترلتان بود',
        'احساس کردید مشکلات انقدر زیاد شده‌اند که نمی‌توانید از آن‌ها عبور کنید',
      ],
      interpretations: [
        { min: 0, max: 13, text: 'استرس پایین — سطح خوبی از انعطاف‌پذیری دارید', severity: 'low' },
        { min: 14, max: 26, text: 'استرس متوسط — برخی تکنیک‌های مدیریت استرس مفید خواهند بود', severity: 'medium' },
        { min: 27, max: 40, text: 'استرس بالا — توصیه می‌شود با متخصص مشورت کنید', severity: 'high' },
      ],
    },
    // ── MBTI (شخصیت) ────────────────────────────────────────────────────────
    {
      slug: 'mbti-short',
      title: 'تست شخصیت‌شناسی MBTI (فرم کوتاه)',
      description: 'نسخه کوتاه‌شده Myers-Briggs Type Indicator. تیپ شخصیتی شما را در ۴ بعد اصلی اندازه‌گیری می‌کند.',
      category: 'شخصیت',
      scoringType: ScoringType.SUM,
      isPremium: false,
      duration: 15,
      status: TestStatus.PUBLISHED,
      questions: [
        'ترجیح می‌دهید وقت خود را با گروه‌های بزرگ بگذرانید (برونگرایی)',
        'هنگام تصمیم‌گیری بیشتر به احساسات توجه می‌کنید',
        'دوست دارید برنامه‌های از پیش تعیین‌شده داشته باشید',
        'ترجیح می‌دهید روی جزئیات عملی تمرکز کنید نه ایده‌های انتزاعی',
        'در موقعیت‌های اجتماعی احساس راحتی می‌کنید',
        'تصمیمات خود را بیشتر بر اساس منطق می‌گیرید',
        'انعطاف‌پذیری در برنامه را به نظم دقیق ترجیح می‌دهید',
        'بیشتر به دنیای درون خود توجه دارید تا دنیای بیرون',
        'اطلاعات مشخص را به تفسیر ترجیح می‌دهید',
        'معمولاً برنامه‌ریزی دقیق دارید',
      ],
      interpretations: [
        { min: 0, max: 3, text: 'درونگرا، منطقی، انعطاف‌پذیر — تیپ تحلیل‌گر (INTP/ISTP)', severity: 'low' },
        { min: 4, max: 6, text: 'متعادل — ترکیبی از ویژگی‌های مختلف شخصیتی', severity: 'low' },
        { min: 7, max: 10, text: 'برونگرا، احساسی، برنامه‌ریز — تیپ سازماندهنده (ESFJ/ENFJ)', severity: 'low' },
      ],
    },
    // ── هوش هیجانی ──────────────────────────────────────────────────────────
    {
      slug: 'eq-test',
      title: 'تست هوش هیجانی (EQ)',
      description: 'هوش هیجانی توانایی شناخت، درک و مدیریت احساسات خود و دیگران است. این تست ۵ مولفه اصلی EQ را می‌سنجد.',
      category: 'هوش',
      scoringType: ScoringType.SUM,
      isPremium: false,
      duration: 12,
      status: TestStatus.PUBLISHED,
      questions: [
        'می‌توانم احساسات خودم را به‌خوبی شناسایی کنم',
        'وقتی ناراحت می‌شوم می‌توانم دلیلش را بیابم',
        'می‌توانم احساسات دیگران را درک کنم',
        'در موقعیت‌های دشوار آرامشم را حفظ می‌کنم',
        'می‌توانم تکانه‌های لحظه‌ای را کنترل کنم',
        'حتی وقتی سخت می‌شود، انگیزه‌ام را حفظ می‌کنم',
        'در روابطم به احساسات دیگران توجه می‌کنم',
        'می‌توانم تعارض‌ها را به‌خوبی مدیریت کنم',
        'در مواجهه با شکست، سریع دوباره بلند می‌شوم',
        'می‌توانم احساسات خودم را به‌درستی بیان کنم',
      ],
      interpretations: [
        { min: 0, max: 4, text: 'هوش هیجانی پایین — آموزش مهارت‌های هیجانی بسیار مفید خواهد بود', severity: 'high' },
        { min: 5, max: 7, text: 'هوش هیجانی متوسط — زمینه خوبی دارید و می‌توانید آن را تقویت کنید', severity: 'medium' },
        { min: 8, max: 10, text: 'هوش هیجانی بالا — شما توانایی خوبی در مدیریت احساسات دارید', severity: 'low' },
      ],
    },
    // ── اضطراب اجتماعی ──────────────────────────────────────────────────────
    {
      slug: 'social-anxiety',
      title: 'مقیاس اضطراب اجتماعی لیبوویتز',
      description: 'ارزیابی ترس و اجتناب در موقعیت‌های اجتماعی. این مقیاس ۱۲ سوال اصلی دارد.',
      category: 'اضطراب',
      scoringType: ScoringType.SUM,
      isPremium: false,
      duration: 8,
      status: TestStatus.PUBLISHED,
      questions: [
        'استفاده از تلفن عمومی در حضور دیگران',
        'شرکت در گروه‌های کوچک',
        'خوردن غذا در مکان‌های عمومی',
        'نوشیدن با دیگران در مکان‌های عمومی',
        'صحبت با کسانی که اقتدار دارند',
        'بازی، نمایش یا صحبت در مقابل دیگران',
        'رفتن به یک مهمانی',
        'کار کردن در حالی که دیگران نگاه می‌کنند',
        'نوشتن در حالی که دیگران نگاه می‌کنند',
        'تماس با کسانی که نمی‌شناسید',
        'ورود به اتاقی که دیگران قبلاً نشسته‌اند',
        'بودن در مرکز توجه',
      ],
      interpretations: [
        { min: 0, max: 12, text: 'اضطراب اجتماعی خفیف یا بدون اضطراب', severity: 'low' },
        { min: 13, max: 24, text: 'اضطراب اجتماعی متوسط — برخی موقعیت‌های اجتماعی ناراحت‌کننده است', severity: 'medium' },
        { min: 25, max: 48, text: 'اضطراب اجتماعی شدید — مشاوره با متخصص توصیه می‌شود', severity: 'high' },
      ],
    },
    // ── سازگاری زوجین ───────────────────────────────────────────────────────
    {
      slug: 'relationship-satisfaction',
      title: 'مقیاس رضایت زناشویی',
      description: 'ارزیابی رضایت و کیفیت رابطه زناشویی. مناسب برای زوج‌هایی که می‌خواهند رابطه خود را بهتر بشناسند.',
      category: 'روابط',
      scoringType: ScoringType.SUM,
      isPremium: true,
      duration: 15,
      status: TestStatus.PUBLISHED,
      questions: [
        'از ارتباط عاطفی با همسرم راضی هستم',
        'در مورد مسائل مهم با هم صحبت می‌کنیم',
        'درگیری‌های ما سازنده است',
        'به همدیگر احترام می‌گذاریم',
        'در تصمیم‌گیری‌های مشترک، هر دو سهیم هستیم',
        'از کنار هم بودن لذت می‌بریم',
        'در مواقع سخت از هم حمایت می‌کنیم',
        'در زندگی مشترک هدف مشترک داریم',
        'با شیوه‌های فرزندپروری هم موافق هستیم',
        'از زندگی جنسی‌مان راضی هستیم',
      ],
      interpretations: [
        { min: 0, max: 3, text: 'رضایت پایین — مشاوره زوج‌درمانی می‌تواند کمک زیادی کند', severity: 'high' },
        { min: 4, max: 7, text: 'رضایت متوسط — جای پیشرفت وجود دارد', severity: 'medium' },
        { min: 8, max: 10, text: 'رضایت بالا — رابطه‌ی سالم و پرباری دارید', severity: 'low' },
      ],
    },
    // ── وسواس OCD ───────────────────────────────────────────────────────────
    {
      slug: 'ocd-screen',
      title: 'غربالگری وسواس فکری-عملی (OCI-R)',
      description: 'بررسی علائم وسواس فکری و اجباری. ۱۸ سوال پوشش‌دهنده انواع اصلی وسواس.',
      category: 'وسواس',
      scoringType: ScoringType.SUM,
      isPremium: false,
      duration: 10,
      status: TestStatus.PUBLISHED,
      questions: [
        'تصاویر یا افکار ناخوشایند ذهنم را پر می‌کند',
        'اشیاء را بیش از حد تمیز می‌کنم',
        'به بررسی کارها یا اشیاء می‌پردازم',
        'احساس می‌کنم باید اشیاء را مرتب کنم',
        'از دست دادن چیزهای بی‌ارزش ناراحتم می‌کند',
        'اعداد یا کلمات خاصی ذهنم را درگیر می‌کند',
        'می‌ترسم ناخواسته به کسی آسیب برسانم',
        'بعضی اشیاء احساس آلودگی می‌دهند',
        'چندین بار چیزها را چک می‌کنم',
        'جمع‌آوری اشیاء بی‌ارزش برایم مهم است',
      ],
      interpretations: [
        { min: 0, max: 7, text: 'فاقد نشانه‌های وسواسی قابل توجه', severity: 'low' },
        { min: 8, max: 17, text: 'نشانه‌های خفیف وسواس — ارزیابی بیشتر توصیه می‌شود', severity: 'medium' },
        { min: 18, max: 40, text: 'نشانه‌های قابل توجه وسواس — به کمک متخصص نیاز دارید', severity: 'high' },
      ],
    },
  ]

  for (const testData of tests) {
    const { questions, interpretations, ...testInfo } = testData

    const existing = await prisma.test.findUnique({ where: { slug: testData.slug } })
    let test
    if (existing) {
      test = existing
      console.log(`   ↩ Skipping existing test: ${testData.slug}`)
    } else {
      test = await prisma.test.create({
        data: {
          ...testInfo,
          config: {},
        },
      })

      // Create questions
      const qOpts = [
        { value: '0', label: 'اصلاً', score: 0 },
        { value: '1', label: 'چند روز', score: 1 },
        { value: '2', label: 'بیشتر روزها', score: 2 },
        { value: '3', label: 'تقریباً هر روز', score: 3 },
      ]

      for (let i = 0; i < questions.length; i++) {
        await prisma.testQuestion.create({
          data: {
            testId: test.id,
            text: questions[i],
            order: i + 1,
            options: qOpts,
          },
        })
      }

      // Create interpretations
      for (const interp of interpretations) {
        await prisma.testInterpretation.create({
          data: {
            testId: test.id,
            scoreRangeMin: interp.min,
            scoreRangeMax: interp.max,
            interpretationText: interp.text,
            severity: interp.severity,
            recommendations: [],
          },
        })
      }

      console.log(`   ✓ Created test: ${testData.slug} (${questions.length} questions)`)
    }
  }
}

// ─── COURSES ─────────────────────────────────────────────────────────────────

async function seedCourses(admin: { id: string }, categories: Record<string, string>) {
  console.log('🎓 Seeding courses…')

  const courses = [
    {
      slug: 'anxiety-management-cbt',
      title: 'مدیریت اضطراب با روش‌های شناختی-رفتاری',
      description: 'در این دوره جامع، با مبانی علمی اضطراب آشنا می‌شوید و تکنیک‌های اثبات‌شده CBT را برای مدیریت آن در زندگی روزمره فرا می‌گیرید.',
      price: 490000,
      salePrice: 390000,
      categorySlug: 'anxiety-management-course',
      lessons: [
        { title: 'معرفی دوره و اهداف آموزشی', duration: 320, order: 1, isFree: true },
        { title: 'تعریف اضطراب و انواع آن', duration: 765, order: 2, isFree: true },
        { title: 'مدل شناختی-رفتاری اضطراب', duration: 1080, order: 3, isFree: false },
        { title: 'ارزیابی سطح اضطراب شخصی', duration: 630, order: 4, isFree: false },
        { title: 'تنفس دیافراگمی و آرام‌سازی', duration: 915, order: 5, isFree: false },
        { title: 'بازسازی شناختی افکار منفی', duration: 1240, order: 6, isFree: false },
        { title: 'مواجهه تدریجی با محرک‌ها', duration: 1025, order: 7, isFree: false },
        { title: 'تکنیک توقف فکر', duration: 590, order: 8, isFree: false },
        { title: 'برنامه‌ریزی روزانه ضداضطراب', duration: 750, order: 9, isFree: false },
        { title: 'پیشگیری از بازگشت', duration: 870, order: 10, isFree: false },
      ],
    },
    {
      slug: 'mindfulness-basics',
      title: 'مبانی ذهن‌آگاهی و مدیتیشن',
      description: 'آموزش علمی و عملی ذهن‌آگاهی برای کاهش استرس، بهبود تمرکز و افزایش کیفیت زندگی. مناسب برای مبتدیان.',
      price: 350000,
      salePrice: null,
      categorySlug: 'mindfulness-course',
      lessons: [
        { title: 'ذهن‌آگاهی چیست؟', duration: 480, order: 1, isFree: true },
        { title: 'تاریخچه و مبانی علمی', duration: 640, order: 2, isFree: true },
        { title: 'تمرین نفس‌آگاهی', duration: 920, order: 3, isFree: false },
        { title: 'اسکن بدن (Body Scan)', duration: 1100, order: 4, isFree: false },
        { title: 'مدیتیشن نشسته', duration: 1200, order: 5, isFree: false },
        { title: 'ذهن‌آگاهی در فعالیت‌های روزانه', duration: 760, order: 6, isFree: false },
        { title: 'مواجهه ذهن‌آگاهانه با افکار دشوار', duration: 890, order: 7, isFree: false },
        { title: 'ایجاد عادت روزانه', duration: 650, order: 8, isFree: false },
      ],
    },
    {
      slug: 'communication-skills',
      title: 'مهارت‌های ارتباطی در روابط سالم',
      description: 'یادگیری تکنیک‌های ارتباط موثر، حل تعارض، و ایجاد روابط عمیق‌تر با اطرافیان.',
      price: 590000,
      salePrice: null,
      categorySlug: 'communication-skills',
      lessons: [
        { title: 'اصول ارتباط موثر', duration: 720, order: 1, isFree: true },
        { title: 'گوش دادن فعال', duration: 850, order: 2, isFree: true },
        { title: 'ارتباط غیرکلامی', duration: 940, order: 3, isFree: false },
        { title: 'ابراز احساسات بدون سرزنش', duration: 1050, order: 4, isFree: false },
        { title: 'مرزهای سالم', duration: 870, order: 5, isFree: false },
        { title: 'حل تعارض سازنده', duration: 1120, order: 6, isFree: false },
        { title: 'همدلی و پذیرش', duration: 780, order: 7, isFree: false },
      ],
    },
    {
      slug: 'self-esteem-growth',
      title: 'تقویت اعتماد به نفس و رشد فردی',
      description: 'مسیری عملی برای ساختن باور قوی‌تر به خود، غلبه بر خودانتقادی، و دستیابی به اهدافتان.',
      price: 420000,
      salePrice: 320000,
      categorySlug: 'personal-growth-course',
      lessons: [
        { title: 'ریشه‌های عزت نفس پایین', duration: 660, order: 1, isFree: true },
        { title: 'خودشناسی و باورهای محدودکننده', duration: 800, order: 2, isFree: false },
        { title: 'تکنیک تأیید مثبت (Affirmation)', duration: 590, order: 3, isFree: false },
        { title: 'مواجهه با صدای انتقادگر درون', duration: 920, order: 4, isFree: false },
        { title: 'هدف‌گذاری و اقدام کوچک', duration: 750, order: 5, isFree: false },
        { title: 'مدیریت شکست', duration: 680, order: 6, isFree: false },
      ],
    },
  ]

  for (const courseData of courses) {
    const { lessons, categorySlug, ...courseInfo } = courseData
    const existing = await prisma.course.findUnique({ where: { slug: courseData.slug } })

    if (existing) {
      console.log(`   ↩ Skipping existing course: ${courseData.slug}`)
      continue
    }

    const course = await prisma.course.create({
      data: {
        ...courseInfo,
        instructorId: admin.id,
        categoryId: categories[categorySlug],
        status: ContentStatus.PUBLISHED,
        totalLessons: lessons.length,
        duration: lessons.reduce((s, l) => s + l.duration, 0),
        rating: 4.5 + Math.random() * 0.4,
        enrolledCount: Math.floor(Math.random() * 500) + 100,
      },
    })

    for (const lesson of lessons) {
      await prisma.courseLesson.create({
        data: { ...lesson, courseId: course.id },
      })
    }

    console.log(`   ✓ Created course: ${courseData.slug} (${lessons.length} lessons)`)
  }
}

// ─── BOOKS ────────────────────────────────────────────────────────────────────

async function seedBooks(categories: Record<string, string>) {
  console.log('📚 Seeding books…')

  const books = [
    {
      slug: 'man-search-for-meaning',
      title: 'انسان در جستجوی معنا',
      author: 'ویکتور فرانکل',
      description: 'روایت فرانکل از تجربه هولناک اردوگاه‌های نازی و نظریه لوگوتراپی — معنادرمانی. یکی از تاثیرگذارترین کتاب‌های روانشناسی معاصر.',
      price: 0,
      isPremium: false,
      totalPages: 128,
      categorySlug: 'general-psychology',
      pages: [
        { title: 'زندگی در اردوگاه — بخش اول', content: '<p>زمانی که ما در اردوگاه بودیم، معنای هستی را در هر لحظه جستجو می‌کردیم. آنچه باقی می‌ماند، آزادی درونی ماست...</p><p>فرانکل می‌نویسد: «هر کس چرا زیستن داشته باشد، تقریباً هر چگونه‌ای را تحمل خواهد کرد.»</p>' },
        { title: 'آزادی آخرین انسان', content: '<p>در بدترین شرایط، انسان می‌تواند انتخاب کند که چگونه واکنش نشان دهد. این آزادی، آخرین آزادی انسانی است...</p>' },
        { title: 'معنا در رنج', content: '<p>رنج — اگر اجتناب‌ناپذیر باشد — فرصتی برای رشد انسانی می‌شود. اما باید از رنج بیهوده اجتناب کرد...</p>' },
      ],
    },
    {
      slug: 'power-of-now',
      title: 'قدرت حال',
      author: 'اکهارت تول',
      description: 'راهنمای روشنگری روحانی. تول می‌آموزد که چگونه با زندگی در لحظه حال، از رنج‌های ذهنی رها شوید.',
      price: 85000,
      isPremium: false,
      totalPages: 200,
      categorySlug: 'mindfulness-book',
      pages: [
        { title: 'شما ذهنتان نیستید', content: '<p>بزرگترین مانع روشنگری، شناسایی با ذهن است که ذهن به‌عنوان ابزار به‌جای ارباب شما می‌شود...</p>' },
        { title: 'وارد لحظه حال شوید', content: '<p>لحظه حال همیشه آن‌گونه است که هست. تا زمانی که می‌توانید با آن کنار بیایید، آرامش درونی شما باقی می‌ماند...</p>' },
        { title: 'ذهن رنجور و ناخودآگاهی', content: '<p>اکثر رنج‌های بشری از اتوماتیک‌بودن ذهن ناشی می‌شود — تکرار الگوهای فکری که خوشبختی را دور می‌کنند...</p>' },
      ],
    },
    {
      slug: 'emotional-intelligence',
      title: 'هوش هیجانی',
      author: 'دانیل گلمن',
      description: 'چرا IQ تنها نشانگر موفقیت نیست؟ گلمن نشان می‌دهد که هوش هیجانی — شناخت و مدیریت احساسات — نقش حیاتی‌تری دارد.',
      price: 120000,
      isPremium: false,
      totalPages: 352,
      categorySlug: 'emotion-management',
      pages: [
        { title: 'چرا هوش هیجانی مهم است؟', content: '<p>پژوهش‌های دانیل گلمن نشان می‌دهد که موفقیت در کار و زندگی تا ۸۰ درصد به EQ بستگی دارد، نه IQ...</p>' },
        { title: 'مولفه‌های هوش هیجانی', content: '<p>۵ مولفه: خودآگاهی، خودتنظیمی، انگیزش، همدلی، مهارت‌های اجتماعی — هر کدام قابل یادگیری و تقویت هستند...</p>' },
        { title: 'مغز هیجانی', content: '<p>آمیگدال — مرکز هیجانی مغز — می‌تواند کنترل رفتار را در موقعیت‌های تهدیدآمیز به دست بگیرد. اما می‌توانیم این را مدیریت کنیم...</p>' },
      ],
    },
    {
      slug: 'cognitive-behavioral-therapy',
      title: 'درمان شناختی-رفتاری برای خودیاری',
      author: 'دکتر رضا احمدی',
      description: 'راهنمای عملی CBT برای مدیریت اضطراب، افسردگی و استرس بدون نیاز به درمانگر. با تمرین‌های عملی کاربردی.',
      price: 95000,
      isPremium: true,
      totalPages: 280,
      categorySlug: 'general-psychology',
      pages: [
        { title: 'اصول CBT', content: '<p>درمان شناختی-رفتاری بر این اساس است که افکار ما تعیین‌کننده احساسات و رفتارهای ما هستند. با تغییر الگوهای فکری، می‌توانیم احساسات را تغییر دهیم...</p>' },
        { title: 'شناسایی افکار خودکار', content: '<p>افکار خودکار، افکار فوری و اغلب منفی هستند که بدون تامل وارد ذهن می‌شوند. یادگیری شناسایی آن‌ها اولین گام CBT است...</p>' },
        { title: 'چالش با افکار تحریف‌شده', content: '<p>وقتی افکار را شناسایی کردیم، می‌توانیم آن‌ها را به چالش بکشیم: "آیا این فکر واقعی است؟ چه شواهدی له یا علیه آن وجود دارد؟"...</p>' },
      ],
    },
  ]

  for (const bookData of books) {
    const { pages, categorySlug, ...bookInfo } = bookData
    const existing = await prisma.book.findUnique({ where: { slug: bookData.slug } })

    if (existing) {
      console.log(`   ↩ Skipping existing book: ${bookData.slug}`)
      continue
    }

    const book = await prisma.book.create({
      data: {
        ...bookInfo,
        categoryId: categories[categorySlug],
        status: ContentStatus.PUBLISHED,
      },
    })

    for (let i = 0; i < pages.length; i++) {
      await prisma.bookPage.create({
        data: {
          bookId: book.id,
          title: pages[i].title,
          content: pages[i].content,
          pageOrder: i + 1,
        },
      })
    }

    console.log(`   ✓ Created book: ${bookData.slug} (${pages.length} pages)`)
  }
}

// ─── BLOG POSTS ──────────────────────────────────────────────────────────────

async function seedBlogPosts(admin: { id: string }, categories: Record<string, string>) {
  console.log('📝 Seeding blog posts…')

  const posts = [
    {
      slug: 'what-is-anxiety-and-how-to-manage',
      title: 'اضطراب چیست و چطور آن را مدیریت کنیم؟',
      excerpt: 'اضطراب یکی از شایع‌ترین مشکلات سلامت روان است. در این مقاله با انواع، علل و روش‌های علمی مدیریت اضطراب آشنا می‌شوید.',
      content: `<h2>اضطراب چیست؟</h2><p>اضطراب یک پاسخ طبیعی بدن به تهدید است. اما وقتی این پاسخ بیش از حد یا در موقعیت‌های غیرتهدیدآمیز رخ دهد، اختلال اضطرابی شکل می‌گیرد.</p><h2>علائم اضطراب</h2><ul><li>تپش قلب و تنگی نفس</li><li>عرق کردن</li><li>لرزش</li><li>احساس ترس یا وحشت</li><li>مشکل تمرکز</li></ul><h2>روش‌های مدیریت</h2><p>تکنیک‌های شناخته‌شده شامل تنفس عمیق، مدیتیشن، CBT و در موارد شدید، دارودرمانی هستند.</p>`,
      categorySlug: 'anxiety-stress',
      isPremium: false,
      readTime: 7,
      tags: ['اضطراب', 'سلامت روان', 'CBT'],
    },
    {
      slug: 'depression-signs-and-treatment',
      title: 'نشانه‌های افسردگی که نباید نادیده بگیرید',
      excerpt: 'افسردگی چیزی بیش از غم معمولی است. یادگیری تشخیص علائم آن، اولین قدم برای کمک‌گرفتن است.',
      content: `<h2>افسردگی و غم معمولی</h2><p>غم یک احساس طبیعی است که با گذشت زمان کاهش می‌یابد. اما افسردگی حالتی مداوم است که بر تمام جنبه‌های زندگی تاثیر می‌گذارد.</p><h2>علائم اصلی</h2><ul><li>احساس غم، پوچی یا ناامیدی برای اکثر روزها</li><li>از دست دادن علاقه به فعالیت‌های لذت‌بخش</li><li>تغییر در اشتها یا وزن</li><li>اختلال خواب</li><li>خستگی مزمن</li></ul><h2>چه زمانی کمک بگیرید؟</h2><p>اگر این علائم بیش از دو هفته ادامه داشتند، حتماً با روانپزشک یا روانشناس مشورت کنید.</p>`,
      categorySlug: 'depression-blog',
      isPremium: false,
      readTime: 8,
      tags: ['افسردگی', 'سلامت روان', 'درمان'],
    },
    {
      slug: 'mindfulness-for-beginners',
      title: 'ذهن‌آگاهی برای مبتدیان — راهنمای عملی',
      excerpt: 'یاد بگیرید چطور با ۵ دقیقه تمرین روزانه، حضور ذهن خود را افزایش دهید و استرس را کاهش دهید.',
      content: `<h2>ذهن‌آگاهی چیست؟</h2><p>ذهن‌آگاهی یعنی توجه کامل به لحظه حال، بدون قضاوت. این مهارت یادگرفتنی است و مغز را به معنای واقعی تغییر می‌دهد.</p><h2>تمرین ۵ دقیقه‌ای</h2><ol><li>در موقعیت راحت بنشینید</li><li>چشم‌هایتان را ببندید</li><li>روی نفس‌هایتان تمرکز کنید</li><li>وقتی ذهنتان رفت، آرام برگردید</li><li>بدون قضاوت ادامه دهید</li></ol><h2>مزایای علمی</h2><p>پژوهش‌ها نشان می‌دهند ذهن‌آگاهی منظم اضطراب را کاهش، تمرکز را افزایش و کیفیت خواب را بهتر می‌کند.</p>`,
      categorySlug: 'mental-health',
      isPremium: false,
      readTime: 6,
      tags: ['ذهن‌آگاهی', 'مدیتیشن', 'استرس'],
    },
    {
      slug: 'healthy-boundaries-in-relationships',
      title: 'چطور مرزهای سالم در روابط ایجاد کنیم؟',
      excerpt: 'مرزگذاری سالم یکی از مهارت‌های اساسی سلامت روانی است. یاد بگیرید چطور نه بگویید بدون احساس گناه.',
      content: `<h2>مرز چیست؟</h2><p>مرزها خطوطی هستند که نشان می‌دهند تا کجا پذیرا هستید و چه رفتارهایی برایتان قابل قبول نیست.</p><h2>چرا مرزگذاری مشکل است؟</h2><p>ترس از طرد شدن، احساس گناه، و نگرانی از آسیب رساندن به رابطه، مرزگذاری را دشوار می‌کند.</p><h2>تکنیک‌های عملی</h2><ul><li>از «من» به‌جای «تو» استفاده کنید</li><li>مستقیم و صادقانه بیان کنید</li><li>ثابت‌قدم باشید</li><li>از عذرخواهی بی‌دلیل خودداری کنید</li></ul>`,
      categorySlug: 'relationships-blog',
      isPremium: false,
      readTime: 9,
      tags: ['روابط', 'مرزگذاری', 'مهارت اجتماعی'],
    },
    {
      slug: 'cognitive-distortions',
      title: 'تحریفات شناختی — وقتی ذهن دروغ می‌گوید',
      excerpt: 'ذهن ما گاهی الگوهای فکری اشتباهی دارد که زندگی را سخت می‌کند. آشنایی با آن‌ها اولین قدم رهایی است.',
      content: `<h2>تحریفات شناختی چیست؟</h2><p>الگوهای فکری اشتباهی که واقعیت را تغییر می‌دهند. درمان شناختی-رفتاری (CBT) مستقیماً با این تحریفات کار می‌کند.</p><h2>رایج‌ترین تحریفات</h2><ul><li><strong>همه-یا-هیچ:</strong> «اگر عالی نباشم، شکست خورده‌ام»</li><li><strong>فاجعه‌پردازی:</strong> «حتماً بدترین اتفاق می‌افتد»</li><li><strong>ذهن‌خوانی:</strong> «می‌دانم که چه فکری می‌کنند»</li><li><strong>تعمیم افراطی:</strong> «همیشه اشتباه می‌کنم»</li></ul>`,
      categorySlug: 'mental-health',
      isPremium: true,
      readTime: 11,
      tags: ['CBT', 'تفکر منطقی', 'روانشناسی'],
    },
    {
      slug: 'sleep-and-mental-health',
      title: 'ارتباط خواب و سلامت روان — چرا خواب کافی حیاتی است',
      excerpt: 'کمبود خواب نه‌تنها خستگی بلکه اضطراب، تحریک‌پذیری و حتی افسردگی ایجاد می‌کند.',
      content: `<h2>خواب و مغز</h2><p>در طول خواب، مغز اطلاعات را تثبیت، سموم را پاک و انرژی را ذخیره می‌کند. اختلال خواب این فرایندها را مختل می‌کند.</p><h2>علائم بی‌خوابی مزمن</h2><ul><li>تحریک‌پذیری</li><li>اضطراب</li><li>کاهش تمرکز</li><li>افسردگی خفیف تا متوسط</li></ul><h2>بهداشت خواب</h2><p>وقت خوابیدن منظم، اجتناب از صفحه‌نمایش ۱ ساعت قبل از خواب، و محیط آرام و تاریک از مهم‌ترین اصول هستند.</p>`,
      categorySlug: 'mental-health',
      isPremium: false,
      readTime: 7,
      tags: ['خواب', 'سلامت روان', 'بهداشت خواب'],
    },
  ]

  for (const postData of posts) {
    const { categorySlug, tags, ...postInfo } = postData
    const existing = await prisma.blogPost.findUnique({ where: { slug: postData.slug } })

    if (existing) {
      console.log(`   ↩ Skipping existing post: ${postData.slug}`)
      continue
    }

    await prisma.blogPost.create({
      data: {
        ...postInfo,
        authorId: admin.id,
        categoryId: categories[categorySlug],
        status: ContentStatus.PUBLISHED,
        tags: tags,
        publishedAt: new Date(Date.now() - Math.random() * 30 * 24 * 3600000),
        views: Math.floor(Math.random() * 3000) + 200,
      },
    })

    console.log(`   ✓ Created blog post: ${postData.slug}`)
  }
}

// ─── STORIES ─────────────────────────────────────────────────────────────────

async function seedStories(admin: { id: string }) {
  console.log('📖 Seeding stories…')

  const stories = [
    {
      title: 'لحظه‌ای که همه چیز تغییر کرد',
      content: `<p>مهران ۳۲ ساله بود که برای اولین بار متوجه شد همیشه نگران بوده. نه فقط گاهی — بلکه تمام عمرش.</p>
      <p>آن روز در دفتر روانشناس نشسته بود و برای اولین بار کلمه «اضطراب» را شنید که درباره او استفاده شد. ناگهان همه چیز معنا پیدا کرد: خستگی مزمن، مشکل خواب، آن احساس دائمی که «باید بیشتر تلاش کنی»...</p>
      <p>«پس این طبیعی نیست؟» با صدای لرزان پرسید. روانشناس لبخند مهربانی زد: «نه، طبیعی نیست. اما درمان‌شدنی است.»</p>`,
    },
    {
      title: 'وقتی «نه» گفتن یاد گرفتم',
      content: `<p>شیرین همیشه می‌گفت بله. به همکارها، به خانواده، به همه. و همیشه خسته بود.</p>
      <p>روزی یک روانشناس از او پرسید: «آخرین باری که «نه» گفتی کی بود؟» نتوانست جواب بدهد.</p>
      <p>«مرزگذاری احترام‌نگذاشتن نیست،» روانشناس گفت. «مراقبت از خودت است.»</p>
      <p>اولین «نه» سخت بود. اما وقتی گفت، دنیا فرو نریخت. فقط یک آرامش عجیب احساس کرد.</p>`,
    },
    {
      title: 'سفر به عمق اندوه',
      content: `<p>بعد از جدایی، رضا فکر می‌کرد باید «قوی» باشد. اشک نریزد. زود «جبران» کند.</p>
      <p>اما هیچ‌چیز کار نمی‌کرد. تا وقتی که یک دوست گفت: «شاید اشک‌ریختن قدرت است، نه ضعف.»</p>
      <p>آن شب رضا برای اولین بار اجازه داد اندوهش را احساس کند. و عجیب بود — وقتی اجازه داد احساسات بیایند، کم‌کم رفتند.</p>`,
    },
    {
      title: 'معجزه ۵ دقیقه',
      content: `<p>دکتر سارا به بیمارانش یک توصیه ساده می‌داد: «روزی ۵ دقیقه با خودتان باشید. بدون موبایل، بدون صدا.»</p>
      <p>بیمار جدیدش خندید: «همین؟» بله، همین.</p>
      <p>یک ماه بعد برگشت: «نمی‌دانستم چقدر از خودم فاصله گرفته‌ام.» آن ۵ دقیقه دریچه‌ای بود به درون — جایی که مدت‌ها نرفته بود.</p>`,
    },
    {
      title: 'روز آرامش',
      content: `<p>نیلوفر تصمیم گرفت یک روز کامل «لاغرتر» کند — نه از نظر غذا، از نظر اطلاعات. هیچ خبری، هیچ شبکه اجتماعی.</p>
      <p>اوایل نگران بود که چیزی را از دست بدهد. بعد متوجه شد که عجیب آرام است.</p>
      <p>«ذهن هم مثل بدن نیاز به استراحت دارد،» روانشناسش بعداً گفت. «و جامعه‌ای که ما می‌سازیم، استراحت را فراموش کرده.»</p>`,
    },
    {
      title: 'شیفت ذهنی',
      content: `<p>کاوه از همه چیز می‌ترسید که اشتباه کند. جلسه مهم، تصمیم بزرگ، حتی انتخاب رستوران.</p>
      <p>در جلسه درمانی، روانشناس یک سوال پرسید: «اگر اشتباه کنی، بدترین اتفاقی که می‌تواند بیفتد چیست؟»</p>
      <p>کاوه فکر کرد. فکر کرد. و ناگهان خندید. «هیچی خیلی مهمی نیست.»</p>`,
    },
    {
      title: 'کودک درونی',
      content: `<p>در اولین جلسه، درمانگر از فریده پرسید: «اگر می‌توانستی با کودک ۸ ساله‌ات صحبت کنی، چه می‌گفتی؟»</p>
      <p>فریده گریه کرد. برای اولین بار فهمید که انتقاد مداومی که در ذهنش بود، صدای والدینش بود — نه صدای خودش.</p>
      <p>«کودک درونت مستحق مهربانی است،» درمانگر گفت. «همان‌قدر که هر کودک دیگری.»</p>`,
    },
    {
      title: 'قدرت کوچک‌ترین قدم',
      content: `<p>محمد ماه‌ها تصمیم داشت ورزش کند. اما هر بار با «فردا» به تعویق می‌انداخت.</p>
      <p>روانشناسش گفت: «فردا یعنی هرگز. قدم کوچک‌ترین چیزی است که الان می‌توانی انجام دهی.»</p>
      <p>محمد فقط کفش‌هایش را پوشید و تا در ورودی رفت. همین کافی بود. فردا یک قدم کوچک دیگر.</p>`,
    },
  ]

  for (const storyData of stories) {
    const existCount = await prisma.story.count({ where: { title: storyData.title } })
    if (existCount > 0) {
      console.log(`   ↩ Skipping existing story: ${storyData.title}`)
      continue
    }

    await prisma.story.create({
      data: {
        ...storyData,
        authorId: admin.id,
        status: ContentStatus.PUBLISHED,
      },
    })
    console.log(`   ✓ Created story: ${storyData.title}`)
  }
}

// ─── PSYCHOLOGISTS ───────────────────────────────────────────────────────────

async function seedPsychologists() {
  console.log('👩‍⚕️ Seeding psychologist profiles…')

  const psychologists = [
    {
      phone: '+989121000001',
      fullName: 'دکتر سارا احمدی',
      bio: 'روانشناس بالینی با بیش از ۱۰ سال تجربه در درمان اضطراب و افسردگی. رویکرد اصلی: درمان شناختی-رفتاری (CBT) و ذهن‌آگاهی.',
      specialty: ['اضطراب', 'افسردگی', 'وسواس', 'ذهن‌آگاهی'],
      licenseNo: 'PSY-۱۲۳۴۵',
      hourlyRate: 250000,
      rating: 4.9,
      reviewCount: 187,
      isVerified: true,
      isAvailable: true,
    },
    {
      phone: '+989121000002',
      fullName: 'دکتر علی رضایی',
      bio: 'متخصص روانشناسی مثبت و رشد فردی. کمک به افراد برای کشف نقاط قوت و دستیابی به اهداف زندگی.',
      specialty: ['رشد فردی', 'خودشناسی', 'هدف‌گذاری', 'انگیزش'],
      licenseNo: 'PSY-۶۷۸۹۰',
      hourlyRate: 200000,
      rating: 4.7,
      reviewCount: 134,
      isVerified: true,
      isAvailable: true,
    },
    {
      phone: '+989121000003',
      fullName: 'دکتر نیلوفر محمدی',
      bio: 'متخصص زوج‌درمانی و خانواده‌درمانی. بیش از ۸ سال تجربه در کار با زوج‌ها و خانواده‌ها.',
      specialty: ['زوج‌درمانی', 'روابط', 'خانواده‌درمانی', 'مهارت‌های ارتباطی'],
      licenseNo: 'PSY-۱۱۲۳۴',
      hourlyRate: 300000,
      rating: 4.8,
      reviewCount: 256,
      isVerified: true,
      isAvailable: false,
    },
    {
      phone: '+989121000004',
      fullName: 'دکتر مهدی کریمی',
      bio: 'روانشناس متخصص در حوزه اعتیاد و بازگشت به زندگی. رویکرد انسان‌گرایانه با تمرکز بر انگیزه تغییر.',
      specialty: ['اعتیاد', 'بهبودی', 'انگیزش', 'مهارت‌های مقابله‌ای'],
      licenseNo: 'PSY-۵۵۶۷۸',
      hourlyRate: 220000,
      rating: 4.6,
      reviewCount: 98,
      isVerified: true,
      isAvailable: true,
    },
    {
      phone: '+989121000005',
      fullName: 'دکتر فاطمه حسینی',
      bio: 'روانشناس کودک و نوجوان. تخصص در اختلالات یادگیری، ADHD و مشاوره خانوادگی.',
      specialty: ['روانشناسی کودک', 'نوجوان', 'ADHD', 'اختلالات یادگیری'],
      licenseNo: 'PSY-۷۷۸۹۰',
      hourlyRate: 280000,
      rating: 4.8,
      reviewCount: 312,
      isVerified: true,
      isAvailable: true,
    },
    {
      phone: '+989121000006',
      fullName: 'دکتر امیر صادقی',
      bio: 'روان‌درمانگر وجودی با تمرکز بر معنا، مرگ‌آگاهی و هویت. برای کسانی که سوالات عمیق زندگی دارند.',
      specialty: ['روان‌درمانی وجودی', 'بحران هویت', 'معناجویی', 'افسردگی وجودی'],
      licenseNo: 'PSY-۹۹۰۱۲',
      hourlyRate: 350000,
      rating: 4.9,
      reviewCount: 67,
      isVerified: true,
      isAvailable: true,
    },
  ]

  const weekSchedule = {
    saturday: { slots: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'] },
    sunday: { slots: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'] },
    monday: { slots: ['10:00', '11:00', '14:00', '15:00', '16:00', '17:00'] },
    tuesday: { slots: ['09:00', '10:00', '11:00', '14:00', '15:00'] },
    wednesday: { slots: ['09:00', '10:00', '14:00', '15:00', '16:00'] },
  }

  for (const psyData of psychologists) {
    const existing = await prisma.user.findUnique({ where: { phone: psyData.phone } })
    if (existing) {
      console.log(`   ↩ Skipping existing psychologist: ${psyData.fullName}`)
      continue
    }

    const user = await prisma.user.create({
      data: {
        phone: psyData.phone,
        fullName: psyData.fullName,
        role: UserRole.PSYCHOLOGIST,
        isVerified: true,
      },
    })

    await prisma.psychologistProfile.create({
      data: {
        userId: user.id,
        bio: psyData.bio,
        specialty: psyData.specialty,
        licenseNo: psyData.licenseNo,
        hourlyRate: psyData.hourlyRate,
        rating: psyData.rating,
        reviewCount: psyData.reviewCount,
        isVerified: psyData.isVerified,
        isAvailable: psyData.isAvailable,
        availability: weekSchedule,
      },
    })

    console.log(`   ✓ Created psychologist: ${psyData.fullName}`)
  }
}

// ─── PRODUCTS ────────────────────────────────────────────────────────────────

async function seedProducts() {
  console.log('🛍️ Seeding products…')

  const products = [
    {
      slug: 'stress-relief-kit',
      title: 'پکیج مقابله با استرس',
      description: 'شامل: ۳۰ روز برنامه ذهن‌آگاهی + ۵ صوت مراقبه + کتاب راهنما. همه در قالب دیجیتال.',
      price: 185000,
      salePrice: 145000,
      stock: 999,
      type: 'digital',
    },
    {
      slug: 'sleep-improvement-program',
      title: 'برنامه بهبود خواب (۴ هفته)',
      description: 'یک برنامه گام‌به‌گام علمی برای بازگرداندن خواب سالم. شامل تکنیک‌های CBT-I و پروتکل ذهن‌آگاهی.',
      price: 220000,
      salePrice: null,
      stock: 999,
      type: 'digital',
    },
    {
      slug: 'mindfulness-journal',
      title: 'دفترچه تمرین ذهن‌آگاهی (فیزیکی)',
      description: '۱۲۰ صفحه با تمرین‌های روزانه ذهن‌آگاهی، فضای نوشتاری، و راهنمای هفتگی. چاپ باکیفیت.',
      price: 95000,
      salePrice: null,
      stock: 50,
      type: 'physical',
    },
    {
      slug: 'anxiety-workbook',
      title: 'کارنامه کار با اضطراب',
      description: 'تمرین‌های عملی CBT برای مقابله با اضطراب. ۸۰ تمرین ساختارمند بر اساس پروتکل‌های بالینی.',
      price: 150000,
      salePrice: 120000,
      stock: 999,
      type: 'digital',
    },
    {
      slug: 'couple-communication-cards',
      title: 'کارت‌های گفتگوی زوجین',
      description: '۵۰ کارت با سوال‌های عمیق و تمرین‌های گفتگو برای تقویت ارتباط زوجین.',
      price: 75000,
      salePrice: null,
      stock: 80,
      type: 'physical',
    },
    {
      slug: 'depression-recovery-guide',
      title: 'راهنمای بهبودی از افسردگی',
      description: 'راهنمای جامع شامل ارزیابی، تکنیک‌های خودیاری، زمان مراجعه به متخصص، و منابع مفید.',
      price: 0,
      salePrice: null,
      stock: 999,
      type: 'digital',
    },
  ]

  for (const productData of products) {
    const existing = await prisma.product.findUnique({ where: { slug: productData.slug } })
    if (existing) {
      console.log(`   ↩ Skipping existing product: ${productData.slug}`)
      continue
    }

    await prisma.product.create({ data: { ...productData, isActive: true } })
    console.log(`   ✓ Created product: ${productData.slug}`)
  }
}

// ─── SETTINGS ────────────────────────────────────────────────────────────────

async function seedSettings() {
  console.log('⚙️ Seeding settings…')

  const settings = [
    { key: 'site_name', value: 'یاری‌جو' },
    { key: 'site_description', value: 'پلتفرم روان‌شناسی و خودشناسی' },
    { key: 'support_email', value: 'support@yarijoo.ir' },
    { key: 'support_phone', value: '021-88888888' },
    { key: 'office_address', value: 'تهران، خیابان ولیعصر' },
    { key: 'maintenance_mode', value: 'false' },
    { key: 'user_registration', value: 'true' },
    { key: 'show_free_tests', value: 'true' },
    { key: 'zarinpal_gateway', value: 'true' },
    { key: 'zarinpal_sandbox', value: 'true' },
    { key: 'sms_otp_enabled', value: 'true' },
    { key: 'sms_payment_notification', value: 'true' },
    { key: 'sms_appointment_reminder', value: 'true' },
    { key: 'meta_title', value: 'یاری‌جو — پلتفرم روان‌شناسی و خودشناسی' },
    { key: 'meta_description', value: 'بهترین پلتفرم برای تست‌های روان‌شناسی، مشاوره آنلاین و رشد فردی در ایران' },
    { key: 'meta_keywords', value: 'تست روانشناسی، مشاوره آنلاین، اضطراب، افسردگی، ذهن‌آگاهی' },
    { key: 'og_title', value: 'یاری‌جو' },
    { key: 'og_image', value: 'https://yarijoo.ir/og-image.jpg' },
    { key: 'sitemap_enabled', value: 'true' },
    { key: 'robots_indexing', value: 'true' },
  ]

  for (const s of settings) {
    await prisma.settings.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    })
  }
  console.log(`   ✓ ${settings.length} settings`)
}

// ─── CATEGORIES FOR ADMIN ────────────────────────────────────────────────────

async function seedDiscountCodes() {
  console.log('🏷️ Seeding discount codes…')
  const codes = [
    { code: 'WELCOME20', type: 'percentage', amount: 20, usageLimit: 1000 },
    { code: 'HEALTH50', type: 'amount', amount: 50000, usageLimit: 500 },
    { code: 'MINDFUL10', type: 'percentage', amount: 10, usageLimit: null },
  ]
  for (const code of codes) {
    await prisma.discountCode.upsert({
      where: { code: code.code },
      update: {},
      create: { ...code, isActive: true },
    })
  }
  console.log(`   ✓ ${codes.length} discount codes`)
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🌱 Starting Yarijoo V2 seed...\n')

  const categories = await seedCategories()
  const admin = await seedAdminUser()
  await seedTests()
  await seedCourses(admin, categories)
  await seedBooks(categories)
  await seedBlogPosts(admin, categories)
  await seedStories(admin)
  await seedPsychologists()
  await seedProducts()
  await seedSettings()
  await seedDiscountCodes()

  console.log('\n✅ Seed complete!\n')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
