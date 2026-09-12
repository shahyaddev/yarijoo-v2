'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import api from '@/lib/api'
import { useAuthStore } from '@/stores/auth.store'

// ─── Types ───────────────────────────────────────────────────────────────────

interface Interpretation {
    interpretationText: string
    severity: string | null
    scoreRangeMin: number
    scoreRangeMax: number
    recommendations?: string[]
}

interface Score { total: number; subscales?: Record<string, number> }

interface Attempt {
    id: string
    status: string
    score: Score
    aiRecommendations: AiResult | null
    aiGeneratedCount: number
    completedAt: string | null
    test: { id: string; slug: string; title: string; category: string; description: string | null; duration: number | null }
}

interface AiResult {
    summary?: string
    strengths?: string[]
    concerns?: string[]
    recommendations?: string[]
    generatedAt?: string
}

// ─── Severity config ──────────────────────────────────────────────────────────

const SEV: Record<string, { label: string; color: string; bg: string; ring: string; dot: string; barColor: string }> = {
    low:      { label: 'وضعیت طبیعی',   color: '#065F46', bg: '#ECFDF5', ring: '#6EE7B7', dot: '#059669', barColor: '#059669' },
    medium:   { label: 'نیاز به توجه',  color: '#854D0E', bg: '#FEF9C3', ring: '#FDE047', dot: '#CA8A04', barColor: '#CA8A04' },
    high:     { label: 'نگران‌کننده',   color: '#991B1B', bg: '#FEE2E2', ring: '#FCA5A5', dot: '#DC2626', barColor: '#DC2626' },
    critical: { label: 'فوری',          color: '#7F1D1D', bg: '#FEE2E2', ring: '#EF4444', dot: '#B91C1C', barColor: '#B91C1C' },
}
function sev(severity: string | null | undefined) {
    return SEV[severity ?? ''] ?? { label: '—', color: '#1B4332', bg: '#E8F5E9', ring: '#6EE7B7', dot: '#059669', barColor: '#059669' }
}

// ─── Clinical max scores ──────────────────────────────────────────────────────

const CLINICAL_MAX: Record<string, number> = {
    'اضطراب':  21,
    'افسردگی': 63,
    'استرس':   30,
    'شخصیت':  30,
    'هوش':     30,
    'روابط':   30,
    'وسواس':   30,
}

// ─── Static analysis data ─────────────────────────────────────────────────────
// Shown automatically — no button needed

const STATIC_ANALYSIS: Record<string, {
    what: string       // چه چیزی می‌سنجد
    low:  { strengths: string[]; concerns: string[]; recommendations: string[] }
    medium: { strengths: string[]; concerns: string[]; recommendations: string[] }
    high:   { strengths: string[]; concerns: string[]; recommendations: string[] }
}> = {
    'اضطراب': {
        what: 'این تست میزان اضطراب فراگیر شما را در دو هفته اخیر ارزیابی می‌کند — شامل نگرانی مداوم، بی‌قراری، تحریک‌پذیری و مشکل در آرام گرفتن.',
        low: {
            strengths: ['سطح اضطراب شما در محدوده طبیعی قرار دارد', 'توانایی خوبی در مدیریت نگرانی‌ها دارید', 'پاسخ‌دهی متناسب با موقعیت‌های استرس‌زا'],
            concerns: [],
            recommendations: ['تکنیک‌های تنفس عمیق ۴-۷-۸ را به عنوان پیشگیری تمرین کنید', 'فعالیت بدنی منظم (۳۰ دقیقه روزانه) را ادامه دهید', 'کیفیت خواب را اولویت قرار دهید'],
        },
        medium: {
            strengths: ['آگاهی از وضعیت خود — اولین قدم مهم است', 'پذیرش نیاز به تغییر نشانه بلوغ هیجانی است'],
            concerns: ['نگرانی‌های مکرر که کنترل آن دشوار است', 'احتمال تداخل اضطراب در خواب و تمرکز'],
            recommendations: ['تکنیک آرام‌سازی پیشرونده عضلات (PMR) را روزانه تمرین کنید', 'ذهن‌آگاهی (Mindfulness) ۱۰ دقیقه‌ای هر صبح را امتحان کنید', 'کافئین و شکر تصفیه‌شده را محدود کنید', 'با یک روان‌شناس برای جلسات CBT مشورت کنید'],
        },
        high: {
            strengths: ['جسارت در پذیرش و بررسی وضعیت خود', 'اقدام به ارزیابی — قدم مهمی است'],
            concerns: ['علائم اضطراب شدید که نیاز به توجه دارد', 'خطر تداخل با عملکرد روزانه، کار و روابط', 'بدون درمان، اضطراب مزمن می‌شود'],
            recommendations: ['مراجعه به روان‌پزشک یا روان‌شناس متخصص را در اولویت قرار دهید', 'درمان CBT برای اضطراب فراگیر بسیار موثر است', 'از تنها ماندن در دوره‌های اضطرابی پرهیز کنید', 'شبکه حمایتی (خانواده، دوستان) خود را تقویت کنید'],
        },
    },
    'افسردگی': {
        what: 'این تست علائم افسردگی شما را بر اساس معیارهای DSM ارزیابی می‌کند — شامل خلق پایین، از دست دادن علاقه، تغییرات خواب، اشتها و انرژی.',
        low: {
            strengths: ['وضعیت خلقی شما در محدوده سالم است', 'انرژی و انگیزه مناسبی برای زندگی روزانه دارید'],
            concerns: [],
            recommendations: ['فعالیت‌های لذت‌بخش را در برنامه روزانه حفظ کنید', 'تعاملات اجتماعی منظم را ادامه دهید', 'تمرین قدردانی روزانه (Gratitude Journal) را امتحان کنید'],
        },
        medium: {
            strengths: ['آگاهی از تغییرات خلقی خود', 'جستجوی کمک نشانه قدرت است نه ضعف'],
            concerns: ['برخی علائم خلقی که ممکن است شدت بگیرند', 'کاهش نسبی انرژی یا لذت از فعالیت‌ها'],
            recommendations: ['فعال‌سازی رفتاری — حتی بدون انگیزه، فعالیت‌های کوچک انجام دهید', 'با یک روان‌شناس برای CBT یا IPT مشورت کنید', 'روابط اجتماعی حمایتگر را تقویت کنید', 'از الکل که افسردگی را تشدید می‌کند دوری کنید'],
        },
        high: {
            strengths: ['اقدام به ارزیابی وضعیت — قدم مهمی است'],
            concerns: ['علائم افسردگی قابل توجه', 'خطر تاثیر بر عملکرد شغلی و روابط', 'نیاز به ارزیابی برای افکار منفی شدید'],
            recommendations: ['مراجعه فوری به روان‌پزشک یا روان‌شناس ضروری است', 'از تنها ماندن در دوره‌های سخت پرهیز کنید', 'درمان ترکیبی (دارو + روان‌درمانی) موثرترین رویکرد است', 'اورژانس اجتماعی ۱۲۳ را در دسترس داشته باشید'],
        },
    },
    'استرس': {
        what: 'این تست میزان ادراک شما از غیر قابل کنترل و غیر قابل پیش‌بینی بودن زندگی را در یک ماه گذشته ارزیابی می‌کند.',
        low: {
            strengths: ['سطح استرس ادراک‌شده شما در محدوده خوبی است', 'توانایی خوبی در مدیریت تقاضاهای محیطی دارید', 'انعطاف‌پذیری روانی مناسب'],
            concerns: [],
            recommendations: ['مهارت‌های مدیریت زمان را تقویت کنید', 'تعادل کار-زندگی را آگاهانه مدیریت کنید', 'تفریح و سرگرمی را در هفته جدی بگیرید'],
        },
        medium: {
            strengths: ['آگاهی از منابع استرس خود', 'تمایل به یافتن راه‌حل'],
            concerns: ['سطح استرس بالاتر از میانگین جمعیتی', 'خطر فرسودگی در صورت تداوم'],
            recommendations: ['منابع اصلی استرس را شناسایی و اولویت‌بندی کنید', 'مرزهای سالم در روابط و کار تعیین کنید', 'ورزش منظم یکی از موثرترین راه‌های کاهش استرس است', 'از شبکه حمایتی اجتماعی بیشتر استفاده کنید'],
        },
        high: {
            strengths: ['درک اینکه وضعیت نیاز به تغییر دارد'],
            concerns: ['استرس مزمن بر سلامت جسمی (قلب، سیستم ایمنی) اثر دارد', 'خطر بالای فرسودگی شغلی و اختلالات خواب'],
            recommendations: ['مشاوره با روان‌شناس برای مهارت‌های مقابله‌ای ضروری است', 'ارزیابی پزشکی برای بررسی اثرات جسمی توصیه می‌شود', 'مدیتیشن یا یوگا را به صورت منظم شروع کنید', 'بازنگری در مسئولیت‌ها و بار کاری فعلی ضروری است'],
        },
    },
    'شخصیت': {
        what: 'این تست تیپ شخصیتی شما را در چهار بعد اصلی Myers-Briggs ارزیابی می‌کند. هیچ تیپی بهتر یا بدتر نیست — هر تیپ قوت‌های منحصر به فردی دارد.',
        low: {
            strengths: ['تفکر عمیق و تحلیلی یکی از قوت‌های اصلی شماست', 'استقلال در کار و تصمیم‌گیری', 'توانایی بالا در مسائل انتزاعی و پیچیده'],
            concerns: [],
            recommendations: ['محیط‌های آرام و کارهای تحلیلی با شما سازگار است', 'در تعاملات اجتماعی از قوت‌های درون‌گرای خود استفاده کنید', 'برای شارژ انرژی به خودت فضای کافی بده'],
        },
        medium: {
            strengths: ['تعادل بین ویژگی‌های مختلف شخصیتی', 'انعطاف‌پذیری در موقعیت‌های متنوع', 'توانایی سازگاری با افراد مختلف'],
            concerns: [],
            recommendations: ['از هر دو سبک تفکری (منطق و احساس) بهره بگیرید', 'نقش‌های میانجی و هماهنگ‌کننده با شما سازگار است', 'نقاط قوت منحصر تیپ خود را کشف کنید'],
        },
        high: {
            strengths: ['انرژی اجتماعی بالا و توانایی ارتباط موثر', 'برنامه‌ریزی دقیق و سازمان‌دهی قوی', 'رهبری و مدیریت تیم از قوت‌های طبیعی شماست'],
            concerns: [],
            recommendations: ['به نیاز دیگران برای فضا و زمان بیشتر توجه داشته باشید', 'از قوت‌های رهبری و سازمان‌دهی خود در محیط کار استفاده کنید', 'برنامه‌ریزی دقیق را همراه با انعطاف‌پذیری ترکیب کنید'],
        },
    },
    'هوش': {
        what: 'این تست پنج مولفه اصلی هوش هیجانی را ارزیابی می‌کند: خودآگاهی، خودتنظیمی، انگیزه، همدلی و مهارت‌های اجتماعی.',
        low: {
            strengths: ['مهارت‌های هوش هیجانی قابل یادگیری و تقویت هستند', 'آگاهی از نقاط ضعف — اولین قدم رشد است'],
            concerns: ['مشکل در مدیریت احساسات در موقعیت‌های پرتنش', 'احتمال تداخل در روابط بین‌فردی'],
            recommendations: ['هر روز احساسات خود را نام‌گذاری کنید (Emotional Labeling)', 'کتاب «هوش هیجانی» دانیل گلمن را مطالعه کنید', 'در کارگاه‌های مهارت‌های اجتماعی شرکت کنید', 'گوش دادن فعال بدون قضاوت را تمرین کنید'],
        },
        medium: {
            strengths: ['زمینه خوبی در شناخت احساسات خود دارید', 'توانایی همدلی نسبی با دیگران'],
            concerns: ['جای رشد در مدیریت تعارض و تنظیم هیجانی'],
            recommendations: ['مکث ۶ ثانیه‌ای قبل از پاسخ‌دهی در موقعیت‌های هیجانی', 'یادداشت‌نویسی احساسات روزانه را شروع کنید', 'همدلی را از طریق گوش دادن بدون قضاوت تقویت کنید'],
        },
        high: {
            strengths: ['توانایی بالا در شناخت و مدیریت احساسات', 'همدلی قوی با دیگران', 'مهارت اجتماعی — مزیت رقابتی در روابط و کار'],
            concerns: [],
            recommendations: ['از این توانایی در نقش‌های رهبری و مشاوره استفاده کنید', 'به انتقال این مهارت‌ها به اطرافیان فکر کنید', 'مرزهای سالم هیجانی را هم حفظ کنید'],
        },
    },
    'روابط': {
        what: 'این تست کیفیت رابطه زناشویی را در ابعاد مختلف ارزیابی می‌کند — ارتباط کلامی، رضایت عاطفی، حمایت متقابل و اهداف مشترک.',
        low: {
            strengths: ['آگاهی از چالش‌های رابطه — اولین قدم تغییر است'],
            concerns: ['سطح رضایت پایین می‌تواند بر سلامت روان هر دو طرف تاثیر بگذارد', 'الگوهای ارتباطی ناکارآمد نیاز به بررسی دارد'],
            recommendations: ['زوج‌درمانی می‌تواند بسیار موثر باشد — همین حالا قدم بردارید', 'ارتباط صادقانه و گوش دادن فعال را تمرین کنید', 'اقدامات کوچک روزانه قدردانی تاثیر بزرگی دارند'],
        },
        medium: {
            strengths: ['پایه‌های نسبتاً خوب در رابطه وجود دارد', 'تمایل به بهبود رابطه'],
            concerns: ['برخی حوزه‌های رابطه نیاز به توجه دارد'],
            recommendations: ['زبان عشق یکدیگر را شناسایی کنید', 'وقت کیفی هفتگی بدون مشغله اختصاص دهید', 'مهارت‌های ارتباطی موثر را با هم تمرین کنید'],
        },
        high: {
            strengths: ['رابطه سالم و پایداری دارید', 'ارتباط و حمایت متقابل خوبی وجود دارد', 'اهداف مشترک واضحی دارید'],
            concerns: [],
            recommendations: ['رابطه را با تلاش مستمر حفظ کنید', 'برای رشد فردی هر نفر هم فضا بگذارید', 'مشاوره پیشگیرانه گاهی برای رشد رابطه مفید است'],
        },
    },
    'وسواس': {
        what: 'این تست علائم وسواس فکری-عملی را در شش حوزه ارزیابی می‌کند: شستشو، بررسی، تردید، ترتیب، افکار وسواسی و انباشت.',
        low: {
            strengths: ['علائم وسواسی قابل توجهی ندارید', 'انعطاف‌پذیری رفتاری مناسب'],
            concerns: [],
            recommendations: ['افکار وسواسی را به عنوان «فکر» نه «واقعیت» شناسایی کنید', 'تمرین «فاصله شناختی» با افکار تکراری'],
        },
        medium: {
            strengths: ['آگاهی از وجود افکار تکراری'],
            concerns: ['علائم وسواسی در صورت درمان نشدن ممکن است تشدید شوند'],
            recommendations: ['درمان ERP (Exposure and Response Prevention) موثرترین روش است', 'با یک روان‌شناس متخصص CBT مشورت کنید', 'افکار وسواسی را ثبت کنید تا الگوها را شناسایی کنید'],
        },
        high: {
            strengths: ['پذیرش وضعیت و جستجوی کمک'],
            concerns: ['علائم شدید OCD بر کیفیت زندگی تاثیر جدی دارد', 'بدون درمان تخصصی بهبود خودبخودی بعید است'],
            recommendations: ['مراجعه فوری به روان‌پزشک یا روان‌شناس متخصص OCD', 'درمان ترکیبی ERP + دارو (SSRI) برای OCD شدید توصیه می‌شود', 'علائم را از اطرافیان پنهان نکنید — OCD با درمان بهبود می‌یابد'],
        },
    },
}

function getStaticAnalysis(category: string, severity: string | null | undefined) {
    const data = STATIC_ANALYSIS[category]
    if (!data) return null
    const key = severity === 'low' ? 'low' : severity === 'medium' ? 'medium' : 'high'
    return { what: data.what, ...data[key] }
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function IcoBrain({ size = 22, color = 'currentColor' }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/></svg>
}
function IcoSparkle({ size = 16, color = 'currentColor' }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/></svg>
}
function IcoCheck({ size = 13, color = 'currentColor' }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
}
function IcoAlert({ size = 13, color = 'currentColor' }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
}
function IcoArrow({ size = 11, color = 'currentColor' }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
}
function IcoCalendar({ size = 13, color = 'currentColor' }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
}

// ─── Score ring ───────────────────────────────────────────────────────────────

function ScoreRing({ score, maxScore, s }: { score: number; maxScore: number; s: ReturnType<typeof sev> }) {
    const pct = Math.min(100, Math.round((score / maxScore) * 100))
    const r = 52; const circ = 2 * Math.PI * r
    const offset = circ - (pct / 100) * circ
    return (
        <div className="relative flex items-center justify-center">
            <svg width={130} height={130} viewBox="0 0 130 130">
                <circle cx={65} cy={65} r={r} fill="none" stroke="#F3EDE3" strokeWidth={10} />
                <circle cx={65} cy={65} r={r} fill="none" stroke={s.barColor} strokeWidth={10}
                    strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
                    transform="rotate(-90 65 65)" style={{ transition: 'stroke-dashoffset 1s ease' }} />
            </svg>
            <div className="absolute text-center">
                <div className="text-3xl font-black" style={{ color: s.color }}>{score.toLocaleString('fa-IR')}</div>
                <div className="text-xs mt-0.5" style={{ color: '#8C8C8E' }}>از {maxScore.toLocaleString('fa-IR')}</div>
            </div>
        </div>
    )
}

// ─── Static Analysis Card ─────────────────────────────────────────────────────

function StaticAnalysisCard({ category, severity }: { category: string; severity: string | null | undefined }) {
    const data = getStaticAnalysis(category, severity)
    if (!data) return null

    return (
        <div className="rounded-2xl overflow-hidden" style={{ background: 'white', border: '1px solid #EDE6D6' }}>
            <div className="px-5 py-4" style={{ borderBottom: '1px solid #F3EDE3', background: '#FDFBF8' }}>
                <h3 className="font-black text-sm" style={{ color: '#1C1C1E' }}>تحلیل نتیجه</h3>
                <p className="text-xs mt-0.5" style={{ color: '#8C8C8E' }}>بر اساس استانداردهای بالینی</p>
            </div>

            <div className="p-5 space-y-5">
                {/* What this test measures */}
                <p className="text-sm leading-7" style={{ color: '#5C5C5E' }}>{data.what}</p>

                {/* Strengths */}
                {data.strengths.length > 0 && (
                    <div>
                        <div className="flex items-center gap-2 mb-2.5">
                            <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: '#D1FAE5' }}>
                                <IcoCheck size={11} color="#065F46" />
                            </div>
                            <p className="text-xs font-black" style={{ color: '#065F46' }}>نقاط قوت</p>
                        </div>
                        <div className="space-y-2">
                            {data.strengths.map((s, i) => (
                                <div key={i} className="flex items-start gap-2.5 px-3 py-2 rounded-xl text-sm"
                                    style={{ background: '#F0FDF4', color: '#1C1C1E' }}>
                                    <span className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5" style={{ background: '#059669' }} />
                                    {s}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Concerns */}
                {data.concerns.length > 0 && (
                    <div>
                        <div className="flex items-center gap-2 mb-2.5">
                            <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: '#FEF9C3' }}>
                                <IcoAlert size={11} color="#CA8A04" />
                            </div>
                            <p className="text-xs font-black" style={{ color: '#854D0E' }}>موارد قابل توجه</p>
                        </div>
                        <div className="space-y-2">
                            {data.concerns.map((c, i) => (
                                <div key={i} className="flex items-start gap-2.5 px-3 py-2 rounded-xl text-sm"
                                    style={{ background: '#FFFBEB', color: '#1C1C1E' }}>
                                    <span className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5" style={{ background: '#CA8A04' }} />
                                    {c}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Recommendations */}
                {data.recommendations.length > 0 && (
                    <div>
                        <div className="flex items-center gap-2 mb-2.5">
                            <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: '#E8F5E9' }}>
                                <IcoArrow size={11} color="#1B4332" />
                            </div>
                            <p className="text-xs font-black" style={{ color: '#1B4332' }}>توصیه‌های عملی</p>
                        </div>
                        <div className="space-y-2">
                            {data.recommendations.map((r, i) => (
                                <div key={i} className="flex items-start gap-2.5 px-3 py-2 rounded-xl text-sm"
                                    style={{ background: '#F9F6F1', color: '#1C1C1E', borderRight: '2px solid #1B4332' }}>
                                    <span className="font-black text-xs shrink-0 mt-0.5" style={{ color: '#1B4332' }}>
                                        {(i + 1).toLocaleString('fa-IR')}
                                    </span>
                                    {r}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

// ─── OpenAI Panel (button only) ───────────────────────────────────────────────

function AiPanel({ attemptId, initial }: { attemptId: string; initial: AiResult | null }) {
    const [ai, setAi] = useState<AiResult | null>(initial)
    const [loading, setLoading] = useState(false)
    const [err, setErr] = useState('')

    const generate = async () => {
        setLoading(true); setErr('')
        try {
            const res = await api.post<{ data: AiResult }>(`/tests/attempts/${attemptId}/ai-insight`)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const data = (res.data as any)?.data ?? res.data as unknown as AiResult
            setAi(data)
        } catch (e: unknown) {
            setErr((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'خطا در تولید تحلیل')
        } finally { setLoading(false) }
    }

    if (ai?.summary) {
        return (
            <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #A7F3D0', background: '#F0FDF4' }}>
                <div className="flex items-center justify-between gap-2.5 px-5 py-4"
                    style={{ borderBottom: '1px solid #D1FAE5', background: '#ECFDF5' }}>
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#D1FAE5' }}>
                            <IcoSparkle size={16} color="#065F46" />
                        </div>
                        <div>
                            <h3 className="font-black text-sm" style={{ color: '#065F46' }}>تحلیل هوش مصنوعی</h3>
                            {ai.generatedAt && (
                                <p className="text-[11px]" style={{ color: '#6EE7B7' }}>
                                    {new Date(ai.generatedAt).toLocaleDateString('fa-IR')}
                                </p>
                            )}
                        </div>
                    </div>
                    <button onClick={generate} disabled={loading}
                        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg disabled:opacity-50"
                        style={{ background: '#D1FAE5', color: '#065F46' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>
                        {loading ? 'در حال بازسازی...' : 'بازسازی'}
                    </button>
                </div>
                <div className="p-5 space-y-4">
                    <p className="text-sm leading-8" style={{ color: '#1B4332' }}>{ai.summary}</p>
                    {ai.strengths && ai.strengths.length > 0 && (
                        <div>
                            <p className="text-xs font-bold mb-2" style={{ color: '#065F46' }}>نقاط قوت</p>
                            <div className="space-y-1.5">
                                {ai.strengths.map((s, i) => (
                                    <div key={i} className="flex items-start gap-2 text-xs" style={{ color: '#1B4332' }}>
                                        <span className="w-4 h-4 rounded flex items-center justify-center shrink-0 mt-0.5" style={{ background: '#D1FAE5' }}><IcoCheck size={10} color="#065F46" /></span>{s}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {ai.concerns && ai.concerns.length > 0 && (
                        <div>
                            <p className="text-xs font-bold mb-2" style={{ color: '#854D0E' }}>موارد نگران‌کننده</p>
                            <div className="space-y-1.5">
                                {ai.concerns.map((c, i) => (
                                    <div key={i} className="flex items-start gap-2 text-xs" style={{ color: '#5C5C5E' }}>
                                        <span className="w-4 h-4 rounded flex items-center justify-center shrink-0 mt-0.5" style={{ background: '#FEF9C3' }}><IcoAlert size={10} color="#CA8A04" /></span>{c}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {ai.recommendations && ai.recommendations.length > 0 && (
                        <div>
                            <p className="text-xs font-bold mb-2" style={{ color: '#065F46' }}>توصیه‌ها</p>
                            <div className="space-y-1.5">
                                {ai.recommendations.map((r, i) => (
                                    <div key={i} className="flex items-start gap-2 text-xs" style={{ color: '#5C5C5E' }}>
                                        <span className="mt-0.5 shrink-0"><IcoArrow size={11} color="#1B4332" /></span>{r}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="rounded-2xl p-5 flex items-center justify-between gap-4"
            style={{ background: 'white', border: '1px solid #EDE6D6' }}>
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#E8F5E9' }}>
                    <IcoSparkle size={18} color="#1B4332" />
                </div>
                <div>
                    <p className="font-bold text-sm" style={{ color: '#1C1C1E' }}>تحلیل هوش مصنوعی</p>
                    <p className="text-xs mt-0.5" style={{ color: '#8C8C8E' }}>تحلیل عمیق‌تر با OpenAI</p>
                </div>
            </div>
            <div className="text-left">
                <button onClick={generate} disabled={loading}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-60 shrink-0 hover:opacity-90 transition-opacity"
                    style={{ background: '#1B4332' }}>
                    {loading
                        ? <><span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> تحلیل...</>
                        : <><IcoSparkle size={14} color="white" /> دریافت تحلیل</>}
                </button>
                {err && <p className="text-[11px] mt-1.5 text-center" style={{ color: '#C62828' }}>{err}</p>}
            </div>
        </div>
    )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TestResultPage() {
    const params = useParams<{ slug: string; attemptId: string }>()
    const { attemptId } = params
    const { isAuthenticated } = useAuthStore()

    const [attempt,        setAttempt]        = useState<Attempt | null>(null)
    const [interpretation, setInterpretation] = useState<Interpretation | null>(null)
    const [loading,        setLoading]         = useState(true)
    const [error,          setError]           = useState('')

    useEffect(() => {
        api.get(`/tests/attempts/${attemptId}`)
            .then(r => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const d = (r.data as any)?.data
                setAttempt(d?.attempt ?? null)
                setInterpretation(d?.interpretation ?? null)
            })
            .catch(() => setError('نتیجه تست یافت نشد'))
            .finally(() => setLoading(false))
    }, [attemptId])

    if (loading) return (
        <div style={{ background: '#FAF7F2', minHeight: '100vh' }} className="flex items-center justify-center">
            <div className="w-10 h-10 border-4 rounded-full animate-spin" style={{ borderColor: '#1B4332', borderTopColor: 'transparent' }} />
        </div>
    )

    if (error || !attempt) return (
        <div style={{ background: '#FAF7F2', minHeight: '100vh' }} className="flex flex-col items-center justify-center gap-4 px-5">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: '#FEE2E2' }}>
                <IcoAlert size={28} color="#DC2626" />
            </div>
            <p style={{ color: '#5C5C5E' }}>{error || 'نتیجه تست یافت نشد'}</p>
            <Link href="/tests" className="px-6 py-2.5 rounded-xl text-white font-bold" style={{ background: '#1B4332' }}>بازگشت به تست‌ها</Link>
        </div>
    )

    const score    = attempt.score?.total ?? 0
    const sub      = attempt.score?.subscales
    const s        = sev(interpretation?.severity)
    const maxScore = CLINICAL_MAX[attempt.test.category] ?? (interpretation ? Math.ceil(interpretation.scoreRangeMax) : 30)

    return (
        <div style={{ background: '#FAF7F2', minHeight: '100vh' }}>
            <div className="max-w-2xl mx-auto px-5 py-10 space-y-5">

                {/* Header */}
                <div>
                    <Link href="/tests" className="inline-flex items-center gap-1.5 text-sm font-semibold mb-6 hover:opacity-70 transition-opacity" style={{ color: '#1B4332' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                        بازگشت
                    </Link>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: s.bg }}>
                            <IcoBrain size={20} color={s.color} />
                        </div>
                        <div>
                            <h1 className="font-black text-xl" style={{ color: '#1C1C1E' }}>نتیجه تست</h1>
                            <p className="text-sm" style={{ color: '#8C8C8E' }}>{attempt.test.title}</p>
                        </div>
                    </div>
                </div>

                {/* Score card */}
                <div className="rounded-2xl overflow-hidden"
                    style={{ background: 'white', border: `1px solid ${s.ring}`, boxShadow: `0 4px 24px ${s.barColor}18` }}>
                    <div className="h-1.5 w-full" style={{ background: s.barColor }} />
                    <div className="p-6">
                        <div className="flex flex-col sm:flex-row items-center gap-8">
                            <ScoreRing score={score} maxScore={maxScore} s={s} />
                            <div className="flex-1 text-center sm:text-right">
                                <span className="inline-flex items-center gap-1.5 text-sm font-bold px-3 py-1.5 rounded-full mb-3"
                                    style={{ background: s.bg, color: s.color }}>
                                    <span className="w-2 h-2 rounded-full" style={{ background: s.dot }} />
                                    {s.label}
                                </span>
                                <h2 className="text-lg font-black mb-1" style={{ color: '#1C1C1E' }}>{attempt.test.category}</h2>
                                {attempt.completedAt && (
                                    <div className="flex items-center gap-1.5 text-xs justify-center sm:justify-start" style={{ color: '#8C8C8E' }}>
                                        <IcoCalendar size={12} color="#C4B8A8" />
                                        {new Date(attempt.completedAt).toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { label: 'نمره شما', value: `${score.toLocaleString('fa-IR')} / ${maxScore.toLocaleString('fa-IR')}`, sub: `${Math.min(100, Math.round((score / maxScore) * 100)).toLocaleString('fa-IR')}٪`, bg: s.bg, color: s.color },
                        { label: 'وضعیت', value: s.label, sub: attempt.test.category, bg: '#E8F5E9', color: '#1B4332' },
                        { label: 'تاریخ', value: attempt.completedAt ? new Date(attempt.completedAt).toLocaleDateString('fa-IR', { month: 'short', day: 'numeric' }) : '—', sub: attempt.completedAt ? new Date(attempt.completedAt).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }) : '', bg: '#F3EDE3', color: '#5C5C5E' },
                    ].map(item => (
                        <div key={item.label} className="rounded-2xl p-4 text-center" style={{ background: item.bg }}>
                            <p className="text-[11px] mb-1" style={{ color: '#8C8C8E' }}>{item.label}</p>
                            <p className="font-black text-sm" style={{ color: item.color }}>{item.value}</p>
                            {item.sub && <p className="text-[11px] mt-0.5" style={{ color: '#8C8C8E' }}>{item.sub}</p>}
                        </div>
                    ))}
                </div>

                {/* Interpretation */}
                {interpretation && (
                    <div className="rounded-2xl overflow-hidden" style={{ border: `1.5px solid ${s.ring}` }}>
                        <div className="flex items-center justify-between px-5 py-4" style={{ background: s.bg, borderBottom: `1px solid ${s.ring}` }}>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ background: s.dot }} />
                                <h3 className="font-black text-sm" style={{ color: s.color }}>تفسیر نتیجه</h3>
                            </div>
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                                style={{ background: 'rgba(0,0,0,0.07)', color: s.color }}>
                                بازه {interpretation.scoreRangeMin.toLocaleString('fa-IR')}–{interpretation.scoreRangeMax.toLocaleString('fa-IR')}
                            </span>
                        </div>
                        <div className="p-5 space-y-4" style={{ background: 'white' }}>
                            <p className="text-sm leading-8" style={{ color: '#1C1C1E' }}>{interpretation.interpretationText}</p>
                            {/* Score bar */}
                            <div>
                                <div className="flex justify-between text-xs mb-1.5" style={{ color: '#8C8C8E' }}>
                                    <span>صفر</span>
                                    <span className="font-semibold" style={{ color: s.color }}>نمره شما: {score.toLocaleString('fa-IR')}</span>
                                    <span>{maxScore.toLocaleString('fa-IR')}</span>
                                </div>
                                <div className="relative h-3 rounded-full overflow-hidden" style={{ background: '#F3EDE3' }}>
                                    <div className="h-full rounded-full" style={{ width: `${Math.min(100, (score / maxScore) * 100)}%`, background: `linear-gradient(90deg, ${s.barColor}88, ${s.barColor})` }} />
                                </div>
                                <div className="flex justify-between text-[10px] mt-1" style={{ color: '#C4B8A8' }}>
                                    <span>طبیعی</span><span>متوسط</span><span>شدید</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Subscales */}
                {sub && Object.keys(sub).length > 0 && (
                    <div className="rounded-2xl p-5" style={{ background: 'white', border: '1px solid #EDE6D6' }}>
                        <h3 className="font-black text-sm mb-4" style={{ color: '#1C1C1E' }}>خرده‌مقیاس‌ها</h3>
                        <div className="space-y-3">
                            {Object.entries(sub).map(([key, val]) => {
                                const pct = Math.min(100, Math.round((val / (maxScore || 1)) * 100))
                                return (
                                    <div key={key}>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span style={{ color: '#5C5C5E' }}>{key}</span>
                                            <span className="font-black" style={{ color: '#1B4332' }}>{Number(val).toLocaleString('fa-IR')}</span>
                                        </div>
                                        <div className="h-2 rounded-full overflow-hidden" style={{ background: '#F3EDE3' }}>
                                            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: '#1B4332' }} />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* Static analysis — always shown */}
                <StaticAnalysisCard category={attempt.test.category} severity={interpretation?.severity} />

                {/* OpenAI panel — button to get extra AI analysis */}
                {isAuthenticated && (
                    <AiPanel attemptId={attemptId} initial={attempt.aiRecommendations} />
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <Link href="/dashboard/my-tests"
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold text-white hover:opacity-90 transition-opacity"
                        style={{ background: 'linear-gradient(135deg,#1B4332,#2D6A4F)' }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><polyline points="9 11 11 13 15 9"/></svg>
                        تاریخچه تست‌ها
                    </Link>
                    <Link href="/tests"
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold border-2 hover:bg-[#E8F5E9] transition-colors"
                        style={{ borderColor: '#1B4332', color: '#1B4332' }}>
                        <IcoBrain size={15} color="#1B4332" />
                        تست‌های دیگر
                    </Link>
                    <Link href="/psychologists"
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold border hover:bg-[#F3EDE3] transition-colors"
                        style={{ borderColor: '#EDE6D6', color: '#5C5C5E' }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        مشاوره با متخصص
                    </Link>
                </div>

            </div>
        </div>
    )
}
