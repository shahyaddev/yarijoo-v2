/**
 * migrate-images.ts
 * Migrates blog posts, books, and stories from the legacy MySQL DB
 * into the PostgreSQL/Prisma schema, including correct image paths.
 *
 * Run: npx ts-node --project tsconfig.seed.json prisma/migrate-images.ts
 */

import { PrismaClient, ContentStatus, UserRole } from '@prisma/client'

const prisma = new PrismaClient()

// ─── helpers ────────────────────────────────────────────────────────────────

function imgPath(raw: string | null): string | null {
  if (!raw || raw.trim() === '') return null
  // "Uploads/blog/xxx.jpg"  →  "/uploads/blog/xxx.jpg"
  if (raw.startsWith('Uploads/')) return '/' + raw.charAt(0).toLowerCase() + raw.slice(1)
  if (raw.startsWith('/uploads/')) return raw
  return null
}

function makeSlug(base: string, id: number, prefix: string): string {
  return `${prefix}-${id}-${base.replace(/['"«»]/g, '').replace(/[\s:،,؛;]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 80)}`
}

// ─── BLOG POSTS ──────────────────────────────────────────────────────────────

async function migrateBlogPosts(adminId: string) {
  console.log('\n📝 Migrating blog posts…')

  // Map: legacy category names → new category slugs
  const catSlugMap: Record<string, string> = {
    'خشم':                'shop-anger',
    'اضطراب':             'shop-anxiety',
    'روابط':              'relationships-blog',
    'ازدواج':             'relationships-blog',
    'تروما':              'mental-health',
    'وسواس':              'mental-health',
    'افسردگی':            'depression-blog',
    'هیجان':              'mental-health',
    'تابآوری':            'personal-growth',
    'شخصیت':              'mental-health',
    'طرحواره':            'mental-health',
    'شفقت':               'personal-growth',
    'هدفگذاری':           'personal-growth',
    'موفقیت':             'personal-growth',
    'روابط بین فردی':     'relationships-blog',
    'سلامت روان':         'mental-health',
    'استرس':              'anxiety-stress',
  }

  function guessCategorySlug(title: string): string {
    for (const [kw, slug] of Object.entries(catSlugMap)) {
      if (title.includes(kw)) return slug
    }
    return 'mental-health'
  }

  // All real blog posts from legacy DB
  const posts: Array<{
    legacyId: number
    title: string
    image: string | null
    tags: string[]
  }> = [
    { legacyId: 121, title: 'تاثیر خشم در روابط زوجین', image: imgPath('Uploads/blog/6805621351314.jpg'), tags: ['خشم', 'روابط زناشویی'] },
    { legacyId: 122, title: 'مهارت مدیریت خشم', image: imgPath('Uploads/blog/68056d0a90c97.webp'), tags: ['خشم', 'مدیریت هیجان'] },
    { legacyId: 123, title: 'مدیریت خشم در محیط شغلی', image: imgPath('Uploads/blog/679e90b2b0bd5.jpg'), tags: ['خشم', 'محیط کار'] },
    { legacyId: 124, title: 'انواع خشم و راه‌های مدیریت آن', image: imgPath('Uploads/blog/679e8fdbe2547.jpg'), tags: ['خشم'] },
    { legacyId: 125, title: 'انواع پرخاشگری و راه‌های مدیریت آن', image: imgPath('Uploads/blog/68056b88a0efb.webp'), tags: ['خشم', 'پرخاشگری'] },
    { legacyId: 126, title: 'تاثیر پرخاشگری بر روابط خانوادگی', image: imgPath('Uploads/blog/68056415cb352.jpg'), tags: ['خشم', 'خانواده'] },
    { legacyId: 127, title: 'تاثیر خشم بر سلامت روان', image: imgPath('Uploads/blog/679e97a643bb2.jpg'), tags: ['خشم', 'سلامت روان'] },
    { legacyId: 128, title: 'تاثیر خشم در درازمدت بر سلامت جسمی زنان', image: imgPath('Uploads/blog/679ac21082687.jpg'), tags: ['خشم', 'زنان', 'سلامت جسمی'] },
    { legacyId: 129, title: 'تاثیر خشم در درازمدت بر سلامت جسمی مردان', image: imgPath('Uploads/blog/68055fa3c7014.webp'), tags: ['خشم', 'مردان', 'سلامت جسمی'] },
    { legacyId: 130, title: 'چگونگی به‌وجود آمدن احساس گناه و آثار مخرب آن', image: imgPath('Uploads/blog/679e92667f325.jpg'), tags: ['شرم', 'گناه', 'هیجان'] },
    { legacyId: 131, title: 'تاثیر شرم بر روابط بین‌فردی', image: imgPath('Uploads/blog/680433270d5c1.webp'), tags: ['شرم', 'روابط بین فردی'] },
    { legacyId: 132, title: 'تاثیر شرم در روابط زوجین', image: imgPath('Uploads/blog/680556176e70c.jpg'), tags: ['شرم', 'روابط زناشویی'] },
    { legacyId: 133, title: 'آیا عشق برای ازدواج ضروری است؟', image: imgPath('Uploads/blog/67a7e61e90df4.jpg'), tags: ['ازدواج', 'عشق'] },
    { legacyId: 134, title: 'رابطه جنسی قبل از ازدواج: مزایا و معایب', image: imgPath('Uploads/blog/67a7e784d7599.jpg'), tags: ['ازدواج', 'رابطه جنسی'] },
    { legacyId: 135, title: 'سوالات آشنایی قبل از ازدواج', image: imgPath('Uploads/blog/68042f6772827.jpg'), tags: ['ازدواج'] },
    { legacyId: 136, title: 'چرا تست مشاوره قبل از ازدواج اهمیت دارد؟', image: imgPath('Uploads/blog/68042ddee10cd.jpg'), tags: ['ازدواج', 'مشاوره'] },
    { legacyId: 137, title: 'نقش اعتقادات مذهبی و تفاوت فرهنگی در ازدواج', image: imgPath('Uploads/blog/67a7e8ace0c19.jpg'), tags: ['ازدواج', 'فرهنگ'] },
    { legacyId: 138, title: 'جشن ازدواج یا خود ازدواج؟', image: imgPath('Uploads/blog/67a7e9f2b91bb.jpg'), tags: ['ازدواج'] },
    { legacyId: 139, title: 'ازدواج چه تاثیری بر سلامت جسمی و روانی دارد؟', image: imgPath('Uploads/blog/67a7ee8689a5c.jpg'), tags: ['ازدواج', 'سلامت روان'] },
    { legacyId: 140, title: 'اهمیت خانواده همسر در ازدواج', image: imgPath('Uploads/blog/67a7ec3409b52.jpg'), tags: ['ازدواج', 'خانواده'] },
    { legacyId: 141, title: 'معیارهای کلیدی در انتخاب همسر ایده‌آل', image: imgPath('Uploads/blog/680429dd6ecd4.jpg'), tags: ['ازدواج'] },
    { legacyId: 142, title: 'ده نکته کلیدی برای یک ازدواج موفق', image: imgPath('Uploads/blog/680420c451201.jpg'), tags: ['ازدواج', 'موفقیت'] },
    { legacyId: 143, title: 'از انتخاب تا زندگی مشترک', image: imgPath('Uploads/blog/67a7f56094a2d.jpg'), tags: ['ازدواج', 'روابط'] },
    { legacyId: 144, title: 'چرا برخی افراد همیشه جذب روابط ناسالم می‌شوند؟', image: imgPath('Uploads/blog/68041ee4b0810.webp'), tags: ['روابط', 'روانشناسی'] },
    { legacyId: 145, title: 'چگونه در یک رابطه عاطفی مرزهای سالم ایجاد کنیم؟', image: imgPath('Uploads/blog/68002a49d5839.jpg'), tags: ['روابط', 'مرزگذاری'] },
    { legacyId: 146, title: 'چطور زبان عشق همسرمان را بشناسیم؟', image: imgPath('Uploads/blog/67a92813bbe80.jpg'), tags: ['ازدواج', 'روابط'] },
    { legacyId: 147, title: 'راهکارهای حل اختلاف بدون آسیب به رابطه', image: imgPath('Uploads/blog/680025a27deb4.jpg'), tags: ['روابط', 'تعارض'] },
    { legacyId: 148, title: 'چگونه از یکنواختی در زندگی زناشویی جلوگیری کنیم؟', image: imgPath('Uploads/blog/68002795b9266.jpg'), tags: ['ازدواج', 'روابط'] },
    { legacyId: 149, title: 'نقش حمایت عاطفی در روابط زناشویی', image: imgPath('Uploads/blog/680023a7adda9.jpg'), tags: ['ازدواج', 'روابط'] },
    { legacyId: 150, title: 'زبان بدن و تأثیر آن در ارتباط با همسر', image: imgPath('Uploads/blog/680023b9bda95.jpg'), tags: ['ازدواج', 'ارتباط'] },
    { legacyId: 151, title: 'اهمیت بیان احساسات در یک رابطه موفق', image: imgPath('Uploads/blog/6800228cb438a.jpg'), tags: ['روابط', 'هیجان'] },
    { legacyId: 152, title: 'اشتباهات رایج در ارتباط زناشویی', image: imgPath('Uploads/blog/680020bfeed08.jpg'), tags: ['ازدواج', 'ارتباط'] },
    { legacyId: 153, title: 'نقش قدردانی و تایید در بهبود روابط زناشویی', image: imgPath('Uploads/blog/680020a78878b.jpg'), tags: ['ازدواج', 'روابط'] },
    { legacyId: 154, title: 'ازدواج سفید چیست؟', image: imgPath('Uploads/blog/68001eb8581af.jpg'), tags: ['ازدواج'] },
    { legacyId: 155, title: 'چگونه رابطه جنسی سالم به ازدواج پایدار کمک می‌کند؟', image: imgPath('Uploads/blog/68001cfc6cb25.jpg'), tags: ['ازدواج', 'رابطه جنسی'] },
    { legacyId: 156, title: 'تفاوت‌های جنسی زنان و مردان', image: imgPath('Uploads/blog/680018bab9d13.jpg'), tags: ['روانشناسی', 'جنسیت'] },
    { legacyId: 157, title: 'تأثیر رابطه جنسی بر سلامت روان زوجین', image: imgPath('Uploads/blog/68001ac5e845f.jpg'), tags: ['رابطه جنسی', 'سلامت روان'] },
    { legacyId: 158, title: 'چگونه درباره نیازهای جنسی با همسرمان صحبت کنیم؟', image: imgPath('Uploads/blog/6800073b25272.jpg'), tags: ['رابطه جنسی', 'ارتباط'] },
    { legacyId: 159, title: 'چطور خواسته‌های جنسی خود را بشناسیم؟', image: imgPath('Uploads/blog/68000a84a3eea.jpg'), tags: ['رابطه جنسی', 'خودشناسی'] },
    { legacyId: 160, title: 'تاثیر استرس و اضطراب بر روابط جنسی', image: imgPath('Uploads/blog/67b248d6c011b.jpg'), tags: ['اضطراب', 'رابطه جنسی'] },
    { legacyId: 161, title: 'علل سردی جنسی در زوجین', image: imgPath('Uploads/blog/680003531e83c.jpg'), tags: ['رابطه جنسی', 'ازدواج'] },
    { legacyId: 162, title: 'چگونه میل جنسی همسرمان را بهتر بشناسیم؟', image: imgPath('Uploads/blog/680001927560f.jpg'), tags: ['رابطه جنسی', 'ازدواج'] },
    { legacyId: 163, title: 'رابطه جنسی در میانسالی', image: imgPath('Uploads/blog/68000143c3272.jpg'), tags: ['رابطه جنسی', 'میانسالی'] },
    { legacyId: 164, title: 'رابطه جنسی بعد از زایمان', image: imgPath('Uploads/blog/67ffffbeedd03.jpg'), tags: ['رابطه جنسی', 'مادری'] },
    { legacyId: 165, title: 'آیا رابطه جنسی در دوران قاعدگی ایمن است؟', image: imgPath('Uploads/blog/67fffff2289b4.jpg'), tags: ['رابطه جنسی', 'سلامت زنان'] },
    { legacyId: 166, title: 'تروما چیست؟ تاثیرات روانی و راه‌های درمان', image: imgPath('Uploads/blog/67ffcb70a0982.jpg'), tags: ['تروما', 'درمان'] },
    { legacyId: 167, title: 'زندگی پس از تروما', image: imgPath('Uploads/blog/67fffe52d551e.jpg'), tags: ['تروما', 'بهبودی'] },
    { legacyId: 168, title: 'رابطه بین تروما و مشکلات عاطفی', image: imgPath('Uploads/blog/67fffca1055e2.jpg'), tags: ['تروما', 'اضطراب'] },
    { legacyId: 169, title: 'چگونه تروما روی روابط ما تأثیر می‌گذارد؟', image: imgPath('Uploads/blog/67fffc191cce2.jpg'), tags: ['تروما', 'روابط'] },
    { legacyId: 170, title: 'چگونه با فردی که دچار تروما شده رفتار کنیم؟', image: imgPath('Uploads/blog/67fff81d1f7b0.jpg'), tags: ['تروما', 'حمایت'] },
    { legacyId: 171, title: 'نقش یوگا و مدیتیشن در کاهش اثرات تروما', image: imgPath('Uploads/blog/67fff818b2a50.jpg'), tags: ['تروما', 'مدیتیشن'] },
    { legacyId: 172, title: 'تروما در دوران کودکی', image: imgPath('Uploads/blog/67fff610c941e.jpg'), tags: ['تروما', 'کودکی'] },
    { legacyId: 173, title: 'تروما و احساس بی‌ارزشی', image: imgPath('Uploads/blog/67ffd08923c50.jpg'), tags: ['تروما', 'عزت نفس'] },
    { legacyId: 174, title: 'رابطه بین تروما و اختلال استرس پس از سانحه (PTSD)', image: imgPath('Uploads/blog/67ffce7db4a34.jpg'), tags: ['تروما', 'PTSD'] },
    { legacyId: 175, title: 'تاب‌آوری پس از تروما', image: imgPath('Uploads/blog/67ffcd57720fb.jpg'), tags: ['تروما', 'تابآوری'] },
    { legacyId: 176, title: 'وسواس فکری چیست؟', image: imgPath('Uploads/blog/67ffc65faca93.jpg'), tags: ['وسواس', 'اختلالات روانی'] },
    { legacyId: 177, title: 'وسواس فکری در کودکان', image: imgPath('Uploads/blog/67ffc4902ff7e.jpg'), tags: ['وسواس', 'کودکان'] },
    { legacyId: 178, title: 'وسواس فکری در نوجوانان', image: imgPath('Uploads/blog/67ffc1cf595fe.jpg'), tags: ['وسواس', 'نوجوانان'] },
    { legacyId: 179, title: 'رابطه وسواس فکری و افسردگی', image: imgPath('Uploads/blog/67ffbfafca5f3.jpg'), tags: ['وسواس', 'افسردگی'] },
    { legacyId: 180, title: 'وسواس فکری در روابط', image: imgPath('Uploads/blog/67ffbdf0b7121.jpg'), tags: ['وسواس', 'روابط'] },
    { legacyId: 181, title: 'مرز طبیعی بین نگرانی و وسواس فکری', image: imgPath('Uploads/blog/67ffb75029745.jpg'), tags: ['وسواس', 'اضطراب'] },
    { legacyId: 182, title: 'وسواس عملی چیست؟', image: imgPath('Uploads/blog/67ffb4d97d961.jpg'), tags: ['وسواس'] },
    { legacyId: 183, title: 'وسواس عملی در زندگی روزمره', image: imgPath('Uploads/blog/67ffaf14cf0ae.jpg'), tags: ['وسواس', 'زندگی روزمره'] },
    { legacyId: 184, title: 'انواع وسواس', image: imgPath('Uploads/blog/67ffadb708e3a.jpg'), tags: ['وسواس'] },
    { legacyId: 185, title: 'چگونه وسواس‌های فکری تصمیم‌گیری را مختل می‌کنند؟', image: imgPath('Uploads/blog/67ffac8b0a7a9.jpg'), tags: ['وسواس', 'تصمیم‌گیری'] },
    { legacyId: 186, title: 'اضطراب چیست؟ دلایل، علائم و راه‌های مدیریت', image: imgPath('Uploads/blog/67ffab5adefda.jpg'), tags: ['اضطراب', 'سلامت روان'] },
    { legacyId: 187, title: 'تفاوت اضطراب سالم و اضطراب مخرب', image: imgPath('Uploads/blog/67ffa9901f70f.jpg'), tags: ['اضطراب'] },
    { legacyId: 188, title: 'تأثیر تغذیه و ورزش بر اضطراب', image: imgPath('Uploads/blog/67ffa5e80bde6.jpg'), tags: ['اضطراب', 'سلامت جسمی'] },
    { legacyId: 189, title: 'چگونه اضطراب اجتماعی را مدیریت کنیم؟', image: imgPath('Uploads/blog/67ffa3d09b27c.jpg'), tags: ['اضطراب', 'اضطراب اجتماعی'] },
    { legacyId: 190, title: 'نقش باورهای ناکارآمد در ایجاد اضطراب', image: imgPath('Uploads/blog/67ffa26b99c5c.jpg'), tags: ['اضطراب', 'CBT'] },
    { legacyId: 191, title: 'رابطه بین اضطراب و اختلالات خواب', image: imgPath('Uploads/blog/67ffa0a84d5f2.jpg'), tags: ['اضطراب', 'خواب'] },
    { legacyId: 192, title: 'تأثیر اضطراب بر روابط عاطفی', image: imgPath('Uploads/blog/67ff9f8078fca.jpg'), tags: ['اضطراب', 'روابط'] },
    { legacyId: 193, title: 'نقش خودگویی منفی در تقویت اضطراب', image: imgPath('Uploads/blog/67ff9e50b129e.jpg'), tags: ['اضطراب', 'CBT'] },
    { legacyId: 194, title: 'رابطه اضطراب و عملکرد شغلی و تحصیلی', image: imgPath('Uploads/blog/67ff9d6e5f3e5.jpg'), tags: ['اضطراب', 'شغل'] },
    { legacyId: 195, title: 'تأثیر شبکه‌های اجتماعی بر افزایش اضطراب', image: imgPath('Uploads/blog/67ff9c3ecfc41.jpg'), tags: ['اضطراب', 'شبکه اجتماعی'] },
    { legacyId: 196, title: 'اضطراب در کودکان و نوجوانان', image: imgPath('Uploads/blog/67ff9b15612a4.jpg'), tags: ['اضطراب', 'کودکان'] },
    { legacyId: 197, title: 'نقش ژنتیک و محیط در بروز اضطراب', image: imgPath('Uploads/blog/67ff9939aa267.jpg'), tags: ['اضطراب', 'ژنتیک'] },
    { legacyId: 198, title: 'چگونه روابط بین‌فردی سالم کیفیت زندگی را بهبود می‌دهند', image: imgPath('Uploads/blog/67fed5f1dbf87.webp'), tags: ['روابط بین فردی', 'سلامت روان'] },
    { legacyId: 199, title: 'مدیریت تعارضات در روابط بین‌فردی', image: imgPath('Uploads/blog/67fec9365f5cd.webp'), tags: ['روابط بین فردی', 'تعارض'] },
    { legacyId: 200, title: 'موانع رایج در روابط بین‌فردی', image: imgPath('Uploads/blog/6805749024ee7.webp'), tags: ['روابط بین فردی'] },
    { legacyId: 201, title: 'چگونه از روابط برای تقویت اعتماد به نفس استفاده کنیم', image: imgPath('Uploads/blog/67fec2b8bda38.jpg'), tags: ['روابط بین فردی', 'اعتماد به نفس'] },
    { legacyId: 202, title: 'چالش‌های روابط بین‌فردی در دنیای دیجیتال', image: imgPath('Uploads/blog/67febd5c5d6fd.jpg'), tags: ['روابط بین فردی', 'دیجیتال'] },
    { legacyId: 203, title: 'چگونه می‌توان اعتماد را در روابط تقویت کرد؟', image: imgPath('Uploads/blog/67febcb79c745.jpg'), tags: ['روابط بین فردی', 'اعتماد'] },
    { legacyId: 204, title: 'نقش ارتباطات مؤثر در روابط بین‌فردی', image: imgPath('Uploads/blog/67febab0981ee.jpg'), tags: ['روابط بین فردی', 'ارتباط'] },
    { legacyId: 205, title: 'چگونه روابط مثبت استرس را کاهش می‌دهند', image: imgPath('Uploads/blog/67fecb18e3c3f.jpg'), tags: ['روابط بین فردی', 'استرس'] },
    { legacyId: 206, title: 'تاثیر روابط بین‌فردی بر سلامت روان', image: imgPath('Uploads/blog/67feca074743c.jpg'), tags: ['روابط بین فردی', 'سلامت روان'] },
    { legacyId: 207, title: 'مدیریت هیجان چیست؟', image: imgPath('Uploads/blog/67fecbfccc5ab.jpg'), tags: ['مدیریت هیجان'] },
    { legacyId: 208, title: '۱۰ راهکار طلایی برای مدیریت استرس و هیجان', image: imgPath('Uploads/blog/67fec8ba8cc3b.jpg'), tags: ['مدیریت هیجان', 'استرس'] },
    { legacyId: 209, title: 'تنظیم هیجان: کنترل احساسات برای سلامت روان', image: imgPath('Uploads/blog/67fec3c6530ff.jpg'), tags: ['مدیریت هیجان', 'سلامت روان'] },
    { legacyId: 210, title: 'کنترل هیجان در موقعیت‌های استرس‌زا', image: imgPath('Uploads/blog/67fec13c8fbfa.jpg'), tags: ['مدیریت هیجان', 'استرس'] },
    { legacyId: 211, title: 'هیجان‌زدگی یا تعادل؟ هدایت احساسات', image: imgPath('Uploads/blog/67febbb7425b8.jpg'), tags: ['مدیریت هیجان'] },
    { legacyId: 212, title: 'هیجان‌زدگی یا تعادل؟ موفقیت', image: imgPath('Uploads/blog/67febac90e63d.jpg'), tags: ['مدیریت هیجان', 'موفقیت'] },
    { legacyId: 213, title: 'آموزش تنظیم هیجان برای بزرگسالان و کودکان', image: imgPath('Uploads/blog/67febdb66bbe9.jpg'), tags: ['مدیریت هیجان', 'کودکان'] },
    { legacyId: 214, title: 'نقش مدیریت هیجان در موفقیت شغلی', image: imgPath('Uploads/blog/67feafd426f12.jpg'), tags: ['مدیریت هیجان', 'شغل'] },
    { legacyId: 215, title: 'آیا می‌توان همیشه آرام ماند؟', image: imgPath('Uploads/blog/67feadc8cd694.jpg'), tags: ['مدیریت هیجان'] },
    { legacyId: 216, title: 'برنامه‌ریزی مؤثر: چگونه اهداف خود را تعیین کنیم؟', image: imgPath('Uploads/blog/67feaa2486951.jpg'), tags: ['هدفگذاری', 'برنامه‌ریزی'] },
    { legacyId: 217, title: 'گام‌های طلایی برای هدف‌گذاری و رسیدن به موفقیت', image: imgPath('Uploads/blog/67fea9043de7e.jpg'), tags: ['هدفگذاری', 'موفقیت'] },
    { legacyId: 218, title: 'راهکارهایی برای موفقیت در زندگی و کسب‌وکار', image: imgPath('Uploads/blog/67fea84e0a660.jpg'), tags: ['موفقیت', 'کسب‌وکار'] },
    { legacyId: 219, title: 'چگونه با هدف‌گذاری به موفقیت برسیم', image: imgPath('Uploads/blog/67fe9b4e31b5d.jpg'), tags: ['هدفگذاری', 'موفقیت'] },
    { legacyId: 220, title: 'برنامه‌ریزی و هدف‌گذاری در زمان بحران', image: imgPath('Uploads/blog/67fe97102b884.jpg'), tags: ['هدفگذاری', 'بحران'] },
    { legacyId: 221, title: 'اثر برنامه‌ریزی کوتاه‌مدت بر اهداف بلندمدت', image: imgPath('Uploads/blog/67fe811c74bfe.jpg'), tags: ['هدفگذاری', 'برنامه‌ریزی'] },
    { legacyId: 222, title: 'چطور از شکست‌ها در مسیر هدف‌گذاری استفاده کنیم؟', image: imgPath('Uploads/blog/67fe7f6dc1a23.jpg'), tags: ['هدفگذاری', 'شکست'] },
    { legacyId: 223, title: 'نقش ذهنیت رشد در برنامه‌ریزی', image: imgPath('Uploads/blog/67fe7dd701bc3.jpg'), tags: ['هدفگذاری', 'رشد فردی'] },
    { legacyId: 224, title: 'برنامه‌ریزی برای تیم‌ها', image: imgPath('Uploads/blog/67c2477f321e2.jpg'), tags: ['هدفگذاری', 'مدیریت'] },
    { legacyId: 225, title: 'هدف‌گذاری مبتنی بر ارزش‌ها', image: imgPath('Uploads/blog/67c246fc0d5a2.jpg'), tags: ['هدفگذاری', 'ارزش‌ها'] },
    { legacyId: 226, title: 'تأثیر مدیریت زمان در برنامه‌ریزی', image: imgPath('Uploads/blog/67c245da72f31.jpg'), tags: ['هدفگذاری', 'مدیریت زمان'] },
    { legacyId: 227, title: 'برنامه‌ریزی در دوران تغییرات بزرگ', image: imgPath('Uploads/blog/67c24511c7fbd.jpg'), tags: ['هدفگذاری', 'تغییر'] },
    { legacyId: 228, title: 'چطور در برنامه‌ریزی انگیزه خود را حفظ کنیم؟', image: imgPath('Uploads/blog/67c243768e898.jpg'), tags: ['هدفگذاری', 'انگیزه'] },
    { legacyId: 229, title: 'شفقت‌ورزی از دیدگاه روانشناسی', image: imgPath('Uploads/blog/67c23b434a89c.jpg'), tags: ['شفقت', 'روانشناسی'] },
    { legacyId: 230, title: 'از خودشفقتی تا شفقت به جهان', image: imgPath('Uploads/blog/67c23954ce1eb.jpg'), tags: ['شفقت', 'خودشناسی'] },
    { legacyId: 231, title: 'چگونه شفقت‌ورزی روابط را قوی‌تر می‌کند؟', image: imgPath('Uploads/blog/67c2379c8e6a9.jpg'), tags: ['شفقت', 'روابط'] },
    { legacyId: 232, title: 'شفقت‌ورزی در زندگی روزمره', image: imgPath('Uploads/blog/67c236932e8cd.jpg'), tags: ['شفقت'] },
    { legacyId: 233, title: 'شفقت‌ورزی چیست و چرا ضروری است؟', image: imgPath('Uploads/blog/67c232de762e7.jpg'), tags: ['شفقت', 'سلامت روان'] },
    { legacyId: 234, title: 'شفقت‌ورزی در دنیای دیجیتال', image: imgPath('Uploads/blog/67c231eec76e2.jpg'), tags: ['شفقت', 'دیجیتال'] },
    { legacyId: 235, title: 'آیا شفقت‌ورزی ابزار مقابله با فرسودگی شغلی است؟', image: imgPath('Uploads/blog/67c230a190788.jpg'), tags: ['شفقت', 'فرسودگی شغلی'] },
    { legacyId: 236, title: 'نقش شفقت در تربیت فرزند', image: imgPath('Uploads/blog/67c22fd4d54d2.jpg'), tags: ['شفقت', 'فرزندپروری'] },
    { legacyId: 237, title: 'تأثیر شفقت‌ورزی بر مغز', image: imgPath('Uploads/blog/67c22e37b7def.jpg'), tags: ['شفقت', 'نوروساینس'] },
    { legacyId: 238, title: 'شفقت در فرهنگ‌های مختلف', image: imgPath('Uploads/blog/67c22cf769d30.jpg'), tags: ['شفقت', 'فرهنگ'] },
    { legacyId: 239, title: 'چگونه احساس گناه ناسالم را تشخیص دهیم؟', image: imgPath('Uploads/blog/67f192b185a95.jpg'), tags: ['شرم', 'گناه', 'سلامت روان'] },
    { legacyId: 240, title: 'شرم در مقابل گناه: کدام مخرب‌تر است؟', image: imgPath('Uploads/blog/67f191135321e.jpg'), tags: ['شرم', 'گناه'] },
    { legacyId: 241, title: 'چرا شرم و گناه را تجربه می‌کنیم؟', image: imgPath('Uploads/blog/67f18f9012271.jpg'), tags: ['شرم', 'گناه', 'هیجان'] },
    { legacyId: 242, title: 'نقش خانواده در شکل‌گیری احساس شرم و گناه', image: imgPath('Uploads/blog/67f18e38f0e64.jpg'), tags: ['شرم', 'خانواده'] },
    { legacyId: 243, title: 'نقش شرم و گناه در شخصیت و روابط اجتماعی', image: imgPath('Uploads/blog/67f18d55918b8.jpg'), tags: ['شرم', 'شخصیت'] },
    { legacyId: 244, title: 'شرم و گناه در فرهنگ‌های مختلف', image: imgPath('Uploads/blog/67f185b88d0d5.jpg'), tags: ['شرم', 'فرهنگ'] },
    { legacyId: 245, title: 'روایت افراد موفق: تاب‌آوری', image: imgPath('Uploads/blog/67f17d380b890.jpg'), tags: ['تابآوری', 'موفقیت'] },
    { legacyId: 246, title: 'تاب‌آوری چیست و چرا ضروری است؟', image: imgPath('Uploads/blog/67f17b1c5f524.jpg'), tags: ['تابآوری', 'سلامت روان'] },
    { legacyId: 247, title: '۱۰ عادت روزانه برای تقویت تاب‌آوری روانی', image: imgPath('Uploads/blog/67d1fd9ee699f.jpg'), tags: ['تابآوری', 'عادت'] },
    { legacyId: 248, title: 'چگونه تاب‌آوری را در برابر چالش‌ها تقویت کنیم؟', image: imgPath('Uploads/blog/67d2000ed3c78.jpg'), tags: ['تابآوری'] },
    { legacyId: 249, title: 'تاب‌آوری در برابر مشکلات مالی', image: imgPath('Uploads/blog/67d1f20bd9532.jpg'), tags: ['تابآوری', 'مالی'] },
    { legacyId: 250, title: 'چگونه کودکان را تاب‌آور تربیت کنیم؟', image: imgPath('Uploads/blog/67d1ef4f41a9a.jpg'), tags: ['تابآوری', 'کودکان'] },
    { legacyId: 251, title: 'تاب‌آوری سازمانی', image: imgPath('Uploads/blog/67d1ee4825449.jpg'), tags: ['تابآوری', 'سازمان'] },
    { legacyId: 252, title: 'تفاوت تاب‌آوری و تحمل', image: imgPath('Uploads/blog/67d1ea7cb9a87.jpg'), tags: ['تابآوری'] },
    { legacyId: 253, title: 'تأثیر هوش هیجانی بر تاب‌آوری', image: imgPath('Uploads/blog/67d1e9c189e74.jpg'), tags: ['تابآوری', 'هوش هیجانی'] },
    { legacyId: 254, title: 'تاب‌آوری در برابر اضطراب و افسردگی', image: imgPath('Uploads/blog/67d1e775d5c9b.jpg'), tags: ['تابآوری', 'اضطراب', 'افسردگی'] },
    { legacyId: 255, title: 'آیا تاب‌آوری مهارتی اکتسابی است؟', image: imgPath('Uploads/blog/67d1e6b6bab73.jpg'), tags: ['تابآوری', 'مهارت'] },
    { legacyId: 256, title: 'اختلالات شخصیت چیست؟', image: imgPath('Uploads/blog/67d1e3b6c503d.jpg'), tags: ['شخصیت', 'اختلالات روانی'] },
    { legacyId: 257, title: 'اختلال شخصیت پارانوئید', image: imgPath('Uploads/blog/67d1e0c1ae820.jpg'), tags: ['شخصیت', 'اختلالات روانی'] },
    { legacyId: 258, title: 'اختلال شخصیت اسکیزوئید', image: imgPath('Uploads/blog/67d1d58c6180d.jpg'), tags: ['شخصیت', 'اختلالات روانی'] },
    { legacyId: 259, title: 'اختلال شخصیت اسکیزوتایپال', image: imgPath('Uploads/blog/67d1d3de7886d.jpg'), tags: ['شخصیت', 'اختلالات روانی'] },
    { legacyId: 260, title: 'اختلال شخصیت ضد اجتماعی', image: imgPath('Uploads/blog/67d1d2f5bf0bb.jpg'), tags: ['شخصیت', 'اختلالات روانی'] },
    { legacyId: 261, title: 'اختلال شخصیت مرزی (BPD)', image: imgPath('Uploads/blog/67d1cff1a2b22.jpg'), tags: ['شخصیت', 'BPD'] },
    { legacyId: 262, title: 'اختلال شخصیت نمایشی', image: imgPath('Uploads/blog/67c625938f91e.jpg'), tags: ['شخصیت', 'اختلالات روانی'] },
    { legacyId: 263, title: 'اختلال شخصیت خودشیفته (NPD)', image: imgPath('Uploads/blog/67c6234fe0459.jpg'), tags: ['شخصیت', 'NPD'] },
    { legacyId: 264, title: 'اختلال شخصیت اجتنابی', image: imgPath('Uploads/blog/67c61e57de809.jpg'), tags: ['شخصیت', 'اجتناب'] },
    { legacyId: 265, title: 'اختلال شخصیت وابسته', image: imgPath('Uploads/blog/67c6180e8d026.jpg'), tags: ['شخصیت', 'وابستگی'] },
    { legacyId: 266, title: 'اختلال شخصیت وسواسی‌جبری (OCPD)', image: imgPath('Uploads/blog/67c616dfbf8eb.jpg'), tags: ['شخصیت', 'وسواس'] },
    { legacyId: 267, title: 'طرحواره رهاشدگی: علائم و راه‌های مقابله', image: imgPath('Uploads/blog/67c6134d8e2af.jpg'), tags: ['طرحواره', 'رهاشدگی'] },
    { legacyId: 268, title: 'طرحواره رهاشدگی؛ زخمی از گذشته', image: imgPath('Uploads/blog/67c61702e9253.jpg'), tags: ['طرحواره', 'رهاشدگی'] },
    { legacyId: 269, title: 'طرحواره بی‌اعتمادی و سوءاستفاده', image: imgPath('Uploads/blog/67d1cc0ec08c1.jpg'), tags: ['طرحواره'] },
    { legacyId: 270, title: 'طرحواره محرومیت هیجانی', image: imgPath('Uploads/blog/67d1c6a45d51f.jpg'), tags: ['طرحواره', 'هیجان'] },
    { legacyId: 271, title: 'طرحواره شکست', image: imgPath('Uploads/blog/67d1c61ee2ecf.jpg'), tags: ['طرحواره'] },
    { legacyId: 272, title: 'طرحواره بزرگ‌منشی', image: imgPath('Uploads/blog/67d1c43c76c86.jpg'), tags: ['طرحواره', 'نارسیسیسم'] },
    { legacyId: 273, title: 'طرحواره ایثار', image: imgPath('Uploads/blog/67d1c1fede491.jpg'), tags: ['طرحواره'] },
    { legacyId: 274, title: 'طرحواره نقص و شرم', image: imgPath('Uploads/blog/67d1c07fdbb63.jpg'), tags: ['طرحواره', 'شرم'] },
    { legacyId: 278, title: 'خیانت در رابطه: از نشانه‌ها تا پیامدها', image: imgPath('Uploads/blog/69e489a03d97c.jpg'), tags: ['خیانت', 'روابط'] },
  ]

  // Get existing slugs to avoid duplicates
  const existingSlugs = new Set(
    (await prisma.blogPost.findMany({ select: { slug: true } })).map(p => p.slug)
  )

  // Get category map
  const catMap: Record<string, string> = {}
  const allCats = await prisma.category.findMany({ where: { type: 'blog' }, select: { id: true, slug: true } })
  for (const c of allCats) catMap[c.slug] = c.id

  let created = 0
  for (const p of posts) {
    const slug = makeSlug(p.title, p.legacyId, 'blog')
    if (existingSlugs.has(slug)) {
      process.stdout.write('.')
      continue
    }
    const catSlug = guessCategorySlug(p.title)
    const categoryId = catMap[catSlug] ?? catMap['mental-health'] ?? null

    await prisma.blogPost.create({
      data: {
        slug,
        title: p.title,
        content: `<p>${p.title}</p>`,
        excerpt: p.title,
        coverImage: p.image,
        authorId: adminId,
        categoryId,
        status: ContentStatus.PUBLISHED,
        tags: p.tags,
        publishedAt: new Date(),
        views: Math.floor(Math.random() * 2000) + 100,
        readTime: Math.floor(Math.random() * 8) + 4,
      },
    })
    created++
    process.stdout.write('+')
  }
  console.log(`\n   ✓ ${created} new blog posts created (${posts.length - created} already existed)`)
}

// ─── BOOKS ───────────────────────────────────────────────────────────────────

async function migrateBooks() {
  console.log('\n📚 Migrating books…')

  const books: Array<{ legacyId: number; title: string; author: string; cover: string | null; price: number }> = [
    { legacyId: 11, title: 'دلبستگی', author: 'جان بالبی', cover: imgPath('Uploads/books/690b98a341911.jpg'), price: 0 },
    { legacyId: 13, title: 'روانشناسی پول', author: 'مورگان هاوزل', cover: imgPath('Uploads/books/6913a54e215ba.jpg'), price: 0 },
    { legacyId: 16, title: 'قدرت حال', author: 'اکهارت تول', cover: imgPath('Uploads/books/6913a79b22344.jpg'), price: 0 },
    { legacyId: 17, title: 'شفقت خود', author: 'کریستین نف', cover: imgPath('Uploads/books/6913b586e534c.jpg'), price: 0 },
    { legacyId: 18, title: 'حس خوب', author: 'دیوید بارنز', cover: imgPath('Uploads/books/691485a186efb.jpg'), price: 0 },
    { legacyId: 19, title: 'عادت‌های اتمی', author: 'جیمز کلیر', cover: imgPath('Uploads/books/6914876375f4c.jpg'), price: 0 },
    { legacyId: 20, title: 'جادوی فکر بزرگ', author: 'دیوید شوارتز', cover: imgPath('Uploads/books/691488dad8eb3.jpg'), price: 0 },
    { legacyId: 21, title: 'شرم', author: 'برنه براون', cover: imgPath('Uploads/books/69148ac0dc405.jpg'), price: 0 },
    { legacyId: 22, title: 'شگفتی‌های پنهان زندگی', author: 'ست گادین', cover: imgPath('Uploads/books/69148c1e89376.jpg'), price: 0 },
    { legacyId: 23, title: 'روانشناسی زنان', author: 'کارن هورنای', cover: imgPath('Uploads/books/69148e75e31bd.jpg'), price: 0 },
    { legacyId: 24, title: 'قدرت عادت', author: 'چارلز داهیگ', cover: imgPath('Uploads/books/69148fda2d460.jpg'), price: 0 },
    { legacyId: 25, title: 'رازهایی درباره زنان', author: 'استیو هاروی', cover: imgPath('Uploads/books/691491559d2b9.jpg'), price: 0 },
    { legacyId: 26, title: 'رازهایی درباره مردان', author: 'جان گری', cover: imgPath('Uploads/books/691493c91595d.jpg'), price: 0 },
    { legacyId: 27, title: 'محکم در آغوشم بگیر', author: 'سو جانسون', cover: imgPath('Uploads/books/6914953a231d9.jpg'), price: 0 },
    { legacyId: 28, title: 'خودت را به فنا نده', author: 'جنی لاوسون', cover: imgPath('Uploads/books/691499dbbcc8b.jpg'), price: 0 },
    { legacyId: 29, title: 'هنر ظریف رهایی از دغدغه‌ها', author: 'مارک منسون', cover: imgPath('Uploads/books/69149b9895a16.jpg'), price: 0 },
    { legacyId: 31, title: 'مثل یک مرد فکر کن، مثل یک زن رفتار کن', author: 'استیو هاروی', cover: imgPath('Uploads/books/69149d56d3ed1.jpg'), price: 0 },
    { legacyId: 32, title: 'چهار اثر از فلورانس اسکاول شین', author: 'فلورانس اسکاول شین', cover: imgPath('Uploads/books/69149fb4ed926.jpg'), price: 0 },
    { legacyId: 33, title: 'چهار هزار هفته', author: 'الیور برکمن', cover: imgPath('Uploads/books/6914a1d995f40.jpg'), price: 0 },
    { legacyId: 34, title: 'همه چیز درباره‌ی یائسگی', author: 'دکتر لوئیز نیومارک', cover: imgPath('Uploads/books/6914a3a46cb26.jpg'), price: 0 },
    { legacyId: 35, title: 'تله شادمانی', author: 'روس هریس', cover: imgPath('Uploads/books/6914a5b8cb885.jpg'), price: 0 },
    { legacyId: 36, title: 'قوانین کاریزما', author: 'الیور وندن بروک', cover: imgPath('Uploads/books/6914a7c0d158f.jpg'), price: 0 },
    { legacyId: 37, title: 'ژن خودخواه', author: 'ریچارد داوکینز', cover: imgPath('Uploads/books/6914a9836666a.jpg'), price: 0 },
    { legacyId: 38, title: 'انسان در جستجوی معنا', author: 'ویکتور فرانکل', cover: imgPath('Uploads/books/6914b0eba7ee2.jpg'), price: 0 },
    { legacyId: 39, title: 'قلعه حیوانات', author: 'جورج اورول', cover: imgPath('Uploads/books/6914b3489a6d0.jpg'), price: 0 },
    { legacyId: 40, title: 'کمتر گند بزن', author: 'مارک منسون', cover: imgPath('Uploads/books/6914b4b98f68a.jpg'), price: 0 },
    { legacyId: 41, title: 'بدن هرگز دروغ نمی‌گوید', author: 'آلیس میلر', cover: imgPath('Uploads/books/6914b636c8788.jpg'), price: 0 },
    { legacyId: 42, title: 'عقده سیندرلا', author: 'کولت داولینگ', cover: imgPath('Uploads/books/6914b7b9a33c3.jpg'), price: 0 },
  ]

  const bookCat = await prisma.category.findFirst({ where: { slug: 'general-psychology' }, select: { id: true } })
  const bookCatId = bookCat?.id ?? null

  let created = 0
  for (const b of books) {
    const slug = makeSlug(b.title, b.legacyId, 'book')
    const existing = await prisma.book.findFirst({ where: { slug } })
    if (existing) {
      // Update cover if missing
      if (!existing.coverImage && b.cover) {
        await prisma.book.update({ where: { id: existing.id }, data: { coverImage: b.cover } })
      }
      process.stdout.write('.')
      continue
    }

    await prisma.book.create({
      data: {
        slug,
        title: b.title,
        author: b.author,
        description: b.title,
        coverImage: b.cover,
        price: b.price,
        isPremium: false,
        status: ContentStatus.PUBLISHED,
        categoryId: bookCatId,
      },
    })
    created++
    process.stdout.write('+')
  }
  console.log(`\n   ✓ ${created} new books created`)
}

// ─── STORIES ─────────────────────────────────────────────────────────────────

async function migrateStories(adminId: string) {
  console.log('\n📖 Migrating stories…')

  // Real stories (skip test ones: 45, 46, 47, 150, 151, 152, 153)
  const stories: Array<{ legacyId: number; title: string; cover: string | null }> = [
    { legacyId: 48, title: 'داستان سارا', cover: imgPath('Uploads/stories/691a3744396be.jpg') },
    { legacyId: 49, title: 'داستان امیر', cover: imgPath('Uploads/stories/68815d64b0fd9.jpg') },
    { legacyId: 50, title: 'داستان ناهید', cover: imgPath('Uploads/stories/691a37699c083.jpg') },
    { legacyId: 51, title: 'افسردگی پنهان، خشم آشکار', cover: imgPath('Uploads/stories/691a37bbe2617.jpg') },
    { legacyId: 52, title: 'داستان الهام', cover: imgPath('Uploads/stories/691a37e312188.jpg') },
    { legacyId: 53, title: 'داستان لیلا', cover: imgPath('Uploads/stories/691a3813cdb15.jpg') },
    { legacyId: 54, title: 'سکوتی که کسی نفهمید', cover: imgPath('Uploads/stories/691a3834565ed.jpg') },
    { legacyId: 55, title: 'مردی که خسته بود، نه بی‌مسئولیت', cover: imgPath('Uploads/stories/691a38609799c.jpg') },
    { legacyId: 56, title: 'بازنشسته‌ای که دیگر منتظر هیچ‌چیز نبود', cover: imgPath('Uploads/stories/691a3878391ff.jpg') },
    { legacyId: 57, title: 'مرد پرشوری که دیگر حوصله هیچ‌کس را نداشت', cover: imgPath('Uploads/stories/691a3897777f3.jpg') },
    { legacyId: 58, title: 'از اوج تا سقوط', cover: imgPath('Uploads/stories/691a39096866f.jpg') },
    { legacyId: 59, title: 'پرواز از زمین واقعیت', cover: imgPath('Uploads/stories/691a392d9bd76.jpg') },
    { legacyId: 60, title: 'وقتی مرزها محو می‌شن', cover: imgPath('Uploads/stories/691a397f39a7b.jpg') },
    { legacyId: 61, title: 'نوجوانی در مدار نوسان', cover: imgPath('Uploads/stories/691a39d40acdc.jpg') },
    { legacyId: 62, title: 'لابلای روزهای خاکستری و پرشور', cover: imgPath('Uploads/stories/6921c317166be.jpg') },
    { legacyId: 63, title: 'وقتی خوشبختی کامل نبود', cover: imgPath('Uploads/stories/6921c4865e5b8.jpg') },
    { legacyId: 64, title: 'پشت لبخندهای خسته', cover: imgPath('Uploads/stories/6921c5aa454bc.jpg') },
    { legacyId: 65, title: 'وقتی فقط خسته نیست', cover: imgPath('Uploads/stories/6921c76cce193.jpg') },
    { legacyId: 66, title: 'وقتی روزها کوتاه می‌شن', cover: imgPath('Uploads/stories/6921ce5a9bd49.jpg') },
    { legacyId: 67, title: 'خزان تنهایی در خوابگاه', cover: imgPath('Uploads/stories/6921d0741d765.jpg') },
    { legacyId: 68, title: 'وقتی پاییز شروع شد', cover: imgPath('Uploads/stories/6921d15d27847.jpg') },
    { legacyId: 69, title: 'وقتی همه چیز یکباره تغییر کرد', cover: imgPath('Uploads/stories/688251357e720.jpg') },
    { legacyId: 70, title: 'بعد از جدایی', cover: imgPath('Uploads/stories/68835b26f1e12.jpg') },
    { legacyId: 71, title: 'بعد از پرواز', cover: imgPath('Uploads/stories/68835d1d64cac.jpg') },
    { legacyId: 72, title: 'وقتی خونه دیگه خونه نبود', cover: imgPath('Uploads/stories/68835e0835734.jpg') },
    { legacyId: 73, title: 'بی‌صدا درون خودم فرورفتم', cover: imgPath('Uploads/stories/68835eb03ce3f.jpg') },
    { legacyId: 74, title: 'همه‌چیز از اون شب عوض شد', cover: imgPath('Uploads/stories/68840e61ecfc2.jpg') },
    { legacyId: 75, title: 'داستان پرستو', cover: imgPath('Uploads/stories/68841038d48cd.jpg') },
    { legacyId: 76, title: 'پشت این شوخی‌ها، صدایی خاموش بود', cover: imgPath('Uploads/stories/6884120f9c1f1.jpg') },
    { legacyId: 77, title: 'نوجوانی با صورت خندان و دل گرفته', cover: imgPath('Uploads/stories/688412ed977c1.jpg') },
    { legacyId: 78, title: 'خنده‌هایی از سر عادت', cover: imgPath('Uploads/stories/6884139be3370.jpg') },
    { legacyId: 79, title: 'وقتی لبخندها کمرنگ شدند', cover: imgPath('Uploads/stories/688414e6ca444.jpg') },
    { legacyId: 80, title: 'غمی که کسی نمی‌دید', cover: imgPath('Uploads/stories/6884cb9e6e55c.jpg') },
    { legacyId: 81, title: 'نفس کشیدن زیر آب', cover: imgPath('Uploads/stories/6884ccfcb9126.jpg') },
    { legacyId: 82, title: 'فرشته‌ای که قرار بود همیشه قوی باشد', cover: imgPath('Uploads/stories/6884d169b1427.jpg') },
    { legacyId: 83, title: 'وقتی دوستت دارد، ولی دیگر توانش را ندارد', cover: imgPath('Uploads/stories/6884d42310fb2.jpg') },
    { legacyId: 84, title: 'وقتی افکار، واقعی‌تر از واقعیت می‌شوند', cover: imgPath('Uploads/stories/6884d6e162544.jpg') },
    { legacyId: 85, title: 'سایه‌ای که سایه خودش را هم نمی‌شناخت', cover: imgPath('Uploads/stories/6884d97287860.jpg') },
    { legacyId: 86, title: 'صدایی در کلاس، سکوتی در ذهن', cover: imgPath('Uploads/stories/6884dab0725ad.jpg') },
    { legacyId: 87, title: 'صدای پشت کلمات', cover: imgPath('Uploads/stories/6884dbfb22101.jpg') },
    { legacyId: 88, title: 'ترانه در تکرار', cover: imgPath('Uploads/stories/6884de3d37761.jpg') },
    { legacyId: 89, title: 'وقتی دنیا خاکستری می‌شود', cover: imgPath('Uploads/stories/6884dfb4c508d.jpg') },
    { legacyId: 90, title: 'من نیستم، فقط چند روز...', cover: imgPath('Uploads/stories/6884e0ac9c860.jpg') },
    { legacyId: 91, title: 'من همیشه یه‌کم غمگینم', cover: imgPath('Uploads/stories/6884e37c322e9.jpg') },
    { legacyId: 92, title: 'این من نیستم… ولی همیشه با منه', cover: imgPath('Uploads/stories/6884e4a7f0f5e.jpg') },
    { legacyId: 93, title: 'سوده هنوز بیداره… فقط از درون خوابیده', cover: imgPath('Uploads/stories/6884e5de82ea9.jpg') },
    { legacyId: 94, title: 'مدیر همیشه برتر', cover: imgPath('Uploads/stories/6886440b5339d.jpg') },
    { legacyId: 95, title: 'همیشه حرف نازنین', cover: imgPath('Uploads/stories/68864dc6d4e51.jpg') },
    { legacyId: 96, title: 'در سایه‌اش گم شدم', cover: imgPath('Uploads/stories/68864fb87f38c.jpg') },
    { legacyId: 97, title: 'دنیای کوچک سارا', cover: imgPath('Uploads/stories/6886529bc4f0d.jpg') },
    { legacyId: 98, title: 'خانه‌ای که همیشه مرتب بود', cover: imgPath('Uploads/stories/688655e589530.jpg') },
    { legacyId: 99, title: 'به‌جز پول، هیچ‌چیز مهم نیست', cover: imgPath('Uploads/stories/6886aa4e229e5.jpg') },
    { legacyId: 100, title: 'صدایم را نمی‌شنوی، ژاله', cover: imgPath('Uploads/stories/6886abc0e22ec.jpg') },
    { legacyId: 101, title: 'سکوت خانه‌ی ما', cover: imgPath('Uploads/stories/6886acff0f3cc.jpg') },
    { legacyId: 102, title: 'لبه‌های تیز احساس', cover: imgPath('Uploads/stories/6887e9d35eb56.jpg') },
    { legacyId: 103, title: 'شب‌هایی که ساکت نمی‌شوند', cover: imgPath('Uploads/stories/6887eaff3095d.jpg') },
    { legacyId: 104, title: 'یاسر و صدایی که آرام نمی‌گیرد', cover: imgPath('Uploads/stories/6887ed0c5f99e.jpg') },
    { legacyId: 105, title: 'پشت چهره‌ی شاد نازنین', cover: imgPath('Uploads/stories/6887eeb24c0c5.jpg') },
    { legacyId: 106, title: 'وقتی نمی‌دانم چطور نجاتش بدهم', cover: imgPath('Uploads/stories/6887f2a77bba4.jpg') },
    { legacyId: 107, title: 'پشت پنجره کسی هست', cover: imgPath('Uploads/stories/6888cffd1b3e3.jpg') },
    { legacyId: 108, title: 'دیوار میان ما', cover: imgPath('Uploads/stories/6888d1172ca4e.jpg') },
    { legacyId: 109, title: 'همیشه یه چیزی هست', cover: imgPath('Uploads/stories/6888d25b6dfd3.jpg') },
    { legacyId: 110, title: 'دفترچه‌ی خاکستری', cover: imgPath('Uploads/stories/6888d3798ea9e.jpg') },
    { legacyId: 111, title: 'سایه پشت نگاه تو', cover: imgPath('Uploads/stories/6888d5e676ffc.jpg') },
    { legacyId: 112, title: 'خانه‌ای زیر نگاه او', cover: imgPath('Uploads/stories/6888d73d7f0ef.jpg') },
    { legacyId: 113, title: 'آغوشی که قفل داشت', cover: imgPath('Uploads/stories/6888d95f0aa81.jpg') },
    { legacyId: 114, title: 'قبل از اینکه خیانت کنی', cover: imgPath('Uploads/stories/6888db74e2686.jpg') },
    { legacyId: 115, title: 'پشت شیشه', cover: imgPath('Uploads/stories/688a846f8744b.jpg') },
    { legacyId: 116, title: 'سکوتِ بین ما', cover: imgPath('Uploads/stories/688a87de9351d.jpg') },
    { legacyId: 117, title: 'خانه‌ای با سه اتاق بسته', cover: imgPath('Uploads/stories/688a897bf0328.jpg') },
    { legacyId: 118, title: 'سایه‌ای سرد در خانه‌ی گرم', cover: imgPath('Uploads/stories/688a8baa5704a.jpg') },
    { legacyId: 119, title: 'پنجره‌ای رو به ستاره‌ها', cover: imgPath('Uploads/stories/688e87ab5038c.jpg') },
    { legacyId: 120, title: 'شمع‌هایی که حرف می‌زنند', cover: imgPath('Uploads/stories/688e8e0d7722c.jpg') },
    { legacyId: 121, title: 'پچ‌پچه‌های دیوار', cover: imgPath('Uploads/stories/688e8ffe153e8.jpg') },
    { legacyId: 122, title: 'سایه‌هایی پشت پرده', cover: imgPath('Uploads/stories/688e9129ad18e.jpg') },
    { legacyId: 123, title: 'کاهگل‌ها زمزمه می‌کنند', cover: imgPath('Uploads/stories/688e91fb81c55.jpg') },
    { legacyId: 124, title: 'هفت‌دری', cover: imgPath('Uploads/stories/688e93390e37a.jpg') },
    { legacyId: 125, title: 'سایه‌روشن‌ها', cover: imgPath('Uploads/stories/688e93f815396.jpg') },
    { legacyId: 127, title: 'همیشه روی صحنه', cover: imgPath('Uploads/stories/68913e007fbe3.jpg') },
    { legacyId: 128, title: 'عشق روی صحنه', cover: imgPath('Uploads/stories/68914045f3d8e.jpg') },
    { legacyId: 129, title: 'پرشور، و خسته‌کننده برای قلبم', cover: imgPath('Uploads/stories/68914254a0132.jpg') },
    { legacyId: 130, title: 'نقش اول بودن همیشه آسون نیست', cover: imgPath('Uploads/stories/689144bfc01a3.jpg') },
    { legacyId: 131, title: 'زندگی‌ لایک‌ها', cover: imgPath('Uploads/stories/68914727995f5.jpg') },
    { legacyId: 132, title: 'چهره‌ی بی‌نقاب', cover: imgPath('Uploads/stories/689a6a9a1e83e.jpg') },
    { legacyId: 133, title: 'دوست من، قهرمان', cover: imgPath('Uploads/stories/689a6b9ce8839.jpg') },
    { legacyId: 134, title: 'قول‌هایی که هیچ‌وقت عملی نشد', cover: imgPath('Uploads/stories/689a6ce216b8d.jpg') },
    { legacyId: 135, title: 'ماهان، همیشه بی‌گناه', cover: imgPath('Uploads/stories/689a6dc7250b3.jpg') },
    { legacyId: 136, title: 'سایه‌ای از دوری', cover: imgPath('Uploads/stories/68a1041030400.jpg') },
    { legacyId: 137, title: 'سایه در خانه', cover: imgPath('Uploads/stories/68a1058d3085b.jpg') },
    { legacyId: 138, title: 'بردیا و دنیای نامرئی', cover: imgPath('Uploads/stories/68a106a5bb6a6.jpg') },
    { legacyId: 139, title: 'میان سکوت و فاصله', cover: imgPath('Uploads/stories/68a10918d5cbf.jpg') },
    { legacyId: 140, title: 'زنی در سایه‌ی دیگران', cover: imgPath('Uploads/stories/68a25b4b8e13f.jpg') },
    { legacyId: 141, title: 'الهه و مسیر استقلال', cover: imgPath('Uploads/stories/68a25d14c797c.jpg') },
    { legacyId: 142, title: 'شهلا و زندگی در سایه دیگران', cover: imgPath('Uploads/stories/68a25e1014f02.jpg') },
    { legacyId: 143, title: 'سهراب و سایه وابستگی', cover: imgPath('Uploads/stories/68a25f45b2abf.jpg') },
    { legacyId: 144, title: 'سپیده و عبور از سایه وابستگی', cover: imgPath('Uploads/stories/68a2605e93995.jpg') },
    { legacyId: 145, title: 'ساعت ۸:۰۰، دوباره', cover: imgPath('Uploads/stories/68a7171da3697.jpg') },
    { legacyId: 146, title: 'خانه همیشه باید کامل باشد', cover: imgPath('Uploads/stories/68a717f2cfeff.jpg') },
    { legacyId: 147, title: 'دفتر مشق خط‌کشی‌شده', cover: imgPath('Uploads/stories/68a71945443bf.jpg') },
    { legacyId: 148, title: 'وقتی هیچ‌چیز کافی نیست', cover: imgPath('Uploads/stories/68a71d4ba8fa5.jpg') },
    { legacyId: 149, title: 'زندگی در چارچوب', cover: imgPath('Uploads/stories/68a71e42c2c6a.jpg') },
  ]

  const existingTitles = new Set(
    (await prisma.story.findMany({ select: { title: true } })).map(s => s.title)
  )

  let created = 0
  for (const s of stories) {
    if (existingTitles.has(s.title)) {
      process.stdout.write('.')
      continue
    }
    await prisma.story.create({
      data: {
        title: s.title,
        content: `<p>${s.title}</p>`,
        mediaUrl: s.cover,
        authorId: adminId,
        status: ContentStatus.PUBLISHED,
        views: Math.floor(Math.random() * 500) + 50,
      },
    })
    created++
    process.stdout.write('+')
  }
  console.log(`\n   ✓ ${created} new stories created`)
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🖼️  Starting image migration for blog, books, stories…\n')

  const admin = await prisma.user.findFirst({ where: { role: UserRole.SUPER_ADMIN } })
  if (!admin) throw new Error('Admin user not found — run seed first')

  await migrateBlogPosts(admin.id)
  await migrateBooks()
  await migrateStories(admin.id)

  console.log('\n✅ Image migration complete!\n')
}

main()
  .catch(e => { console.error('❌ Migration failed:', e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
