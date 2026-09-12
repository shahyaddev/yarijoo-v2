import {
    Injectable,
    NotFoundException,
    BadRequestException,
    Logger,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '../../prisma/prisma.service'
import OpenAI from 'openai'
import type { Prisma } from '@prisma/client'

// Per-attempt hard cap (prevents abuse)
const MAX_AI_GENERATIONS = 3

export interface AiInsightResult {
    summary: string
    strengths: string[]
    concerns: string[]
    recommendations: string[]
    generatedAt: string
}

// ─── Per-test clinical knowledge base ────────────────────────────────────────
// Content is based on published clinical guidelines (public domain)
// Sources: NIH/NCBI, APA, WHO clinical guidelines

const CLINICAL_KNOWLEDGE: Record<string, {
    fullName: string
    maxScore: number
    description: string
    severityGuide: string
    clinicalNotes: string
}> = {
    'اضطراب': {
        fullName: 'اضطراب عمومی (GAD-7)',
        maxScore: 21,
        description: 'اضطراب فراگیر شامل نگرانی مداوم، بی‌قراری، تحریک‌پذیری و علائم فیزیکی مانند تنش عضلانی است.',
        severityGuide: 'نمرات ۵-۹ اضطراب خفیف، ۱۰-۱۴ متوسط، ۱۵-۲۱ شدید.',
        clinicalNotes: 'مقیاس GAD-7 با حساسیت ۸۹٪ و ویژگی ۸۲٪ برای تشخیص اضطراب فراگیر معتبر است (Spitzer et al., 2006).',
    },
    'افسردگی': {
        fullName: 'افسردگی بک (BDI-II)',
        maxScore: 63,
        description: 'افسردگی با احساس غم، از دست دادن علاقه، تغییرات خواب/اشتها، خستگی و افکار منفی مشخص می‌شود.',
        severityGuide: 'نمرات ۰-۱۳ حداقلی، ۱۴-۱۹ خفیف، ۲۰-۲۸ متوسط، ۲۹-۶۳ شدید.',
        clinicalNotes: 'BDI-II با معیارهای DSM-IV همسو است. نمره ≥۱۶ نیاز به ارزیابی تخصصی دارد.',
    },
    'استرس': {
        fullName: 'استرس ادراک‌شده (PSS-10)',
        maxScore: 30,
        description: 'PSS سطح ادراک شما از کنترل‌پذیری و قابل پیش‌بینی بودن زندگی را می‌سنجد.',
        severityGuide: 'نمرات ۰-۱۳ استرس پایین، ۱۴-۲۶ متوسط، ۲۷-۳۰ بالا.',
        clinicalNotes: 'بر اساس تحقیقات Cohen (1988)، میانگین جمعیتی PSS-10 حدود ۱۳-۱۶ است.',
    },
    'شخصیت': {
        fullName: 'تیپ‌شناسی شخصیت (MBTI فرم کوتاه)',
        maxScore: 30,
        description: 'MBTI چهار بعد شخصیتی را می‌سنجد: برون/درون‌گرایی، شهودی/حسی، تفکری/احساسی، قضاوتی/ادراکی.',
        severityGuide: 'نمره پایین: تیپ درون‌گرا تحلیل‌گر، نمره متوسط: متعادل، نمره بالا: برون‌گرا سازمان‌یافته.',
        clinicalNotes: 'MBTI یک ابزار توصیفی است نه تشخیصی. هیچ تیپی بهتر یا بدتر نیست.',
    },
    'هوش': {
        fullName: 'هوش هیجانی (EQ)',
        maxScore: 30,
        description: 'هوش هیجانی شامل توانایی شناخت، درک، مدیریت احساسات خود و دیگران است.',
        severityGuide: 'نمره ۲۰-۳۰ هوش هیجانی بالا، ۱۱-۱۹ متوسط، ۰-۱۰ پایین.',
        clinicalNotes: 'هوش هیجانی با موفقیت شغلی، روابط سالم و سلامت روان همبستگی قوی دارد.',
    },
    'روابط': {
        fullName: 'رضایت زناشویی',
        maxScore: 30,
        description: 'کیفیت ارتباط، رضایت عاطفی، ارتباط کلامی و حمایت متقابل را ارزیابی می‌کند.',
        severityGuide: 'نمره ۲۰-۳۰ رضایت بالا، ۱۰-۱۹ متوسط، ۰-۹ نیاز به مداخله.',
        clinicalNotes: 'رضایت زناشویی پایین با افسردگی و اضطراب همبستگی دارد.',
    },
    'وسواس': {
        fullName: 'وسواس فکری-عملی (OCI-R)',
        maxScore: 30,
        description: 'OCI-R علائم شش خرده‌مقیاس وسواس را می‌سنجد: شستشو، بررسی، تردید، ترتیب، وسواس فکری و انباشت.',
        severityGuide: 'نمره ≥۱۸ نشان‌دهنده علائم قابل توجه OCD است.',
        clinicalNotes: 'نمره cutoff 18 دارای حساسیت ۷۹٪ و ویژگی ۸۸٪ برای OCD است.',
    },
}

// ─── Intelligent static fallback ─────────────────────────────────────────────
// Rich, category-specific analysis without OpenAI

function buildRichFallback(
    category: string,
    score: number,
    maxScore: number,
    severity: string | null | undefined,
    interpretationText: string | undefined,
): AiInsightResult {
    const knowledge = CLINICAL_KNOWLEDGE[category]
    const pct = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0

    // Severity-specific content
    const isLow = severity === 'low'
    const isMedium = severity === 'medium'
    const isHigh = severity === 'high' || severity === 'critical'

    // Common strengths for all
    const baseStrengths = [
        'آگاهی از وضعیت روانی خود — اولین قدم در مسیر بهبود',
        'تمایل به خودشناسی و پایش سلامت روان',
    ]

    const lowStrengths = [
        ...baseStrengths,
        'مدیریت مناسب در این حوزه روانشناختی',
        'انعطاف‌پذیری روانی نسبتاً خوب',
    ]
    const mediumStrengths = [
        ...baseStrengths,
        'توانایی شناسایی نشانه‌های هشداردهنده',
    ]
    const highStrengths = [
        ...baseStrengths,
        'جسارت در پذیرش و بررسی وضعیت خود',
    ]

    // Category-specific recommendations
    const recs: Record<string, { low: string[]; medium: string[]; high: string[] }> = {
        'اضطراب': {
            low: [
                'تکنیک‌های تنفس عمیق ۴-۷-۸ را به عنوان پیشگیری تمرین کنید',
                'فعالیت بدنی منظم (حداقل ۳۰ دقیقه در روز) را در برنامه خود بگنجانید',
                'یادداشت‌نویسی احساسات به حفظ آرامش کمک می‌کند',
                'کیفیت خواب را بهبود دهید — ۷-۸ ساعت خواب شبانه توصیه می‌شود',
            ],
            medium: [
                'تکنیک‌های آرام‌سازی پیشرونده عضلات را تمرین کنید (Progressive Muscle Relaxation)',
                'ذهن‌آگاهی (Mindfulness) یا مدیتیشن ۱۰ دقیقه‌ای روزانه را امتحان کنید',
                'محدود کردن کافئین و قندهای تصفیه‌شده در رژیم غذایی',
                'با یک روان‌شناس یا مشاور برای جلسات CBT مشورت کنید',
                'الگوهای تفکر نگرانی را شناسایی و به چالش بکشید',
            ],
            high: [
                'مراجعه به روان‌پزشک یا روان‌شناس متخصص را در اولویت قرار دهید',
                'از خودداری از تصمیم‌گیری‌های مهم در دوره اضطراب شدید خودداری کنید',
                'شبکه حمایتی خود را (خانواده، دوستان) تقویت کنید',
                'درمان شناختی-رفتاری (CBT) برای اضطراب فراگیر بسیار موثر است',
                'در صورت تداوم، بررسی گزینه‌های دارویی با پزشک ضروری است',
            ],
        },
        'افسردگی': {
            low: [
                'فعالیت‌های لذت‌بخش را در برنامه روزانه حفظ کنید',
                'تعاملات اجتماعی را به صورت فعالانه دنبال کنید',
                'خواب منظم و رژیم غذایی سالم زمینه خلق پایدار ایجاد می‌کنند',
                'تمرین قدردانی روزانه (Gratitude Journaling) را امتحان کنید',
            ],
            medium: [
                'فعال‌سازی رفتاری — حتی وقتی انگیزه ندارید، فعالیت‌های کوچک را انجام دهید',
                'با یک روان‌شناس برای درمان CBT یا IPT مشورت کنید',
                'روابط اجتماعی حمایتگر را تقویت کنید',
                'از الکل و مواد روان‌گردان که افسردگی را تشدید می‌کنند دوری کنید',
                'اهداف کوچک و قابل دستیابی تعیین کنید',
            ],
            high: [
                'مراجعه فوری به روان‌پزشک یا روان‌شناس ضروری است',
                'از تنها ماندن در دوره‌های سخت پرهیز کنید',
                'درمان ترکیبی (دارو + روان‌درمانی) برای افسردگی شدید موثرترین رویکرد است',
                'شماره اورژانس اجتماعی ۱۲۳ را در دسترس داشته باشید',
                'به علائم هشداردهنده مانند افکار آسیب به خود توجه فوری داشته باشید',
            ],
        },
        'استرس': {
            low: [
                'مهارت‌های مدیریت زمان را تقویت کنید',
                'تمرین‌های تنفسی روزانه برای حفظ آرامش توصیه می‌شود',
                'تعادل کار-زندگی را به طور آگاهانه مدیریت کنید',
                'تفریح و سرگرمی‌های دلخواه را در هفته قرار دهید',
            ],
            medium: [
                'منابع اصلی استرس را شناسایی و آن‌ها را اولویت‌بندی کنید',
                'مرز سالم (Healthy Boundaries) در روابط و کار تعیین کنید',
                'تکنیک حل مسئله ساختاریافته را یاد بگیرید',
                'ورزش منظم یکی از موثرترین راه‌های کاهش استرس است',
                'از شبکه حمایتی اجتماعی بیشتر استفاده کنید',
            ],
            high: [
                'استرس مزمن بر سلامت جسمی (قلب، سیستم ایمنی) اثر می‌گذارد — ارزیابی پزشکی توصیه می‌شود',
                'مشاوره با روان‌شناس برای یادگیری مهارت‌های مقابله‌ای ضروری است',
                'بازنگری در الگوهای کاری و مسئولیت‌های فعلی توصیه می‌شود',
                'مدیتیشن، یوگا یا تایچی را به صورت منظم تمرین کنید',
                'از تصمیم‌گیری‌های بزرگ در دوره استرس شدید خودداری کنید',
            ],
        },
        'شخصیت': {
            low: [
                'تیپ شخصیتی شما درون‌گرا و تحلیل‌محور است — از این ویژگی در موقعیت‌های شغلی مناسب استفاده کنید',
                'کار با ایده‌های انتزاعی و حل مسائل پیچیده با شما سازگار است',
                'فضای کافی برای شارژ انرژی فردی برای خود در نظر بگیرید',
            ],
            medium: [
                'شخصیت متعادل شما در محیط‌های مختلف منعطف است',
                'از هر دو سبک تفکری (منطق و احساس) بهترین استفاده را بکنید',
                'نقش‌های رهبری تیمی با ویژگی‌های شما همخوانی دارد',
            ],
            high: [
                'تیپ برون‌گرا و سازمان‌یافته شما در نقش‌های مدیریتی و روابط عمومی موفق است',
                'به نیاز دیگران برای فضا و زمان بیشتر توجه داشته باشید',
                'برنامه‌ریزی دقیق و پیگیری اهداف از قوت‌های اصلی شما است',
            ],
        },
        'هوش': {
            low: [
                'مهارت‌های هوش هیجانی قابل یادگیری و تقویت هستند',
                'شناسایی احساسات خود: نام گذاشتن بر احساسات لحظه به لحظه را تمرین کنید',
                'گوش دادن فعال به احساسات دیگران را در روابط تمرین کنید',
                'کتاب‌های «هوش هیجانی» دانیل گلمن و «هوش اجتماعی» را مطالعه کنید',
                'شرکت در کارگاه‌های مهارت‌های اجتماعی و خودشناسی توصیه می‌شود',
            ],
            medium: [
                'خودآگاهی هیجانی را با یادداشت‌نویسی احساسات روزانه تقویت کنید',
                'در موقعیت‌های تعارض، مکث ۶ ثانیه‌ای قبل از پاسخ‌دهی را تمرین کنید',
                'همدلی را از طریق گوش دادن بدون قضاوت تقویت کنید',
            ],
            high: [
                'هوش هیجانی بالای شما یک مزیت رقابتی مهم در روابط و کار است',
                'از این توانایی در نقش‌های رهبری، مشاوره و کمک به دیگران استفاده کنید',
                'به انتقال این مهارت‌ها به اطرافیان فکر کنید',
            ],
        },
        'روابط': {
            low: [
                'مشاوره زوج‌درمانی می‌تواند در بهبود کیفیت رابطه بسیار موثر باشد',
                'ارتباط کلامی صادقانه و گوش دادن فعال را تمرین کنید',
                'اقدامات کوچک روزانه قدردانی در رابطه تاثیر بزرگی دارند',
                'از کمک متخصص برای حل تعارضات ریشه‌ای استفاده کنید',
            ],
            medium: [
                'مهارت‌های ارتباطی موثر را با هم تمرین کنید',
                'وقت کیفی و بدون مشغله برای رابطه در هفته اختصاص دهید',
                'زبان عشق یکدیگر را شناسایی کنید',
            ],
            high: [
                'رابطه‌ی سالم و پایداری دارید، آن را با تلاش مستمر حفظ کنید',
                'در کنار رضایت زوجی، به رشد فردی هر نفر توجه داشته باشید',
                'گاهی مشاوره پیشگیرانه برای رشد رابطه مفید است',
            ],
        },
        'وسواس': {
            low: [
                'علائم وسواسی خفیف معمولاً پاسخ خوبی به تکنیک‌های خودمدیریتی می‌دهند',
                'افکار وسواسی را به عنوان «فکر» نه «واقعیت» شناسایی کنید',
                'تمرین «فاصله گذاشتن شناختی» با افکار تکراری',
            ],
            medium: [
                'درمان ERP (Exposure and Response Prevention) موثرترین روش برای OCD است',
                'با یک روان‌شناس متخصص در CBT/ERP مشورت کنید',
                'افکار وسواسی را ثبت کنید تا الگوها را شناسایی نمایید',
                'مقاومت در برابر اجبارها حتی برای چند دقیقه را تمرین کنید',
            ],
            high: [
                'مراجعه فوری به روان‌پزشک یا روان‌شناس متخصص OCD ضروری است',
                'درمان ترکیبی ERP + دارو (SSRI) برای OCD شدید توصیه می‌شود',
                'علائم را پنهان نکنید — بیماری OCD با درمان بهبود پیدا می‌کند',
                'گروه‌های حمایتی OCD می‌توانند کمک‌کننده باشند',
            ],
        },
    }

    // Concerns
    const concernsMap: Record<string, { low: string[]; medium: string[]; high: string[] }> = {
        'اضطراب': {
            low: [],
            medium: ['نگرانی مکرر که کنترل آن دشوار است', 'تداخل اضطراب در عملکرد روزانه'],
            high: ['علائم اضطراب شدید که نیاز به توجه فوری دارد', 'احتمال تداخل با خواب، کار و روابط', 'خطر تبدیل شدن به اختلال اضطراب مزمن بدون درمان'],
        },
        'افسردگی': {
            low: [],
            medium: ['برخی علائم خلقی که ممکن است روند صعودی داشته باشد', 'کاهش انرژی یا لذت نسبی'],
            high: ['علائم افسردگی قابل توجه', 'خطر تاثیر بر عملکرد شغلی و روابط', 'نیاز به ارزیابی برای افکار منفی شدید'],
        },
        'استرس': {
            low: [],
            medium: ['سطح استرس بالاتر از میانگین جمعیتی', 'خطر فرسودگی در صورت تداوم'],
            high: ['استرس مزمن اثرات جسمی (قلب‌وعروق، سیستم ایمنی) دارد', 'خطر بالای فرسودگی شغلی و اختلالات خواب', 'نیاز فوری به مداخله و حمایت'],
        },
        'شخصیت': { low: [], medium: [], high: [] },
        'هوش': {
            low: ['مشکل در مدیریت احساسات در موقعیت‌های پرتنش', 'احتمال تداخل در روابط بین‌فردی'],
            medium: ['جای رشد در همدلی و مدیریت تعارض وجود دارد'],
            high: [],
        },
        'روابط': {
            low: ['سطح رضایت پایین می‌تواند به سلامت روان هر دو طرف آسیب بزند', 'الگوهای ارتباطی ناکارآمد ممکن است نیاز به بررسی داشته باشد'],
            medium: ['برخی حوزه‌های رابطه نیاز به بهبود دارد'],
            high: [],
        },
        'وسواس': {
            low: [],
            medium: ['علائم وسواسی در صورت درمان نشدن می‌توانند تشدید شوند'],
            high: ['علائم شدید OCD به شدت بر کیفیت زندگی تاثیر دارد', 'بدون درمان تخصصی بهبود خودبخودی بعید است'],
        },
    }

    const catRecs = recs[category] ?? recs['استرس']
    const catConcerns = concernsMap[category] ?? concernsMap['استرس']
    const sevKey = isLow ? 'low' : isMedium ? 'medium' : 'high'

    // Build summary
    const sevLabel = isLow ? 'در محدوده طبیعی' : isMedium ? 'در سطح متوسط' : 'در سطح نگران‌کننده'
    const summary = interpretationText
        ? interpretationText
        : `نتیجه تست ${knowledge?.fullName ?? category} نشان می‌دهد که نمره شما (${score} از ${maxScore}) ${sevLabel} قرار دارد. ${knowledge?.severityGuide ?? ''} ${isHigh ? 'توصیه اکید می‌شود با یک متخصص مشورت کنید.' : isMedium ? 'توجه و پیگیری منظم توصیه می‌شود.' : 'وضعیت مطلوبی دارید، آن را حفظ کنید.'}`

    return {
        summary,
        strengths: isLow ? lowStrengths : isMedium ? mediumStrengths : highStrengths,
        concerns: catConcerns[sevKey],
        recommendations: catRecs[sevKey],
        generatedAt: new Date().toISOString(),
    }
}

@Injectable()
export class AiAnalysisService {
    private readonly logger = new Logger(AiAnalysisService.name)
    private openai: OpenAI | null = null

    constructor(
        private prisma: PrismaService,
        private config: ConfigService,
    ) {
        const apiKey = this.config.get<string>('OPENAI_API_KEY')
        if (apiKey && apiKey !== '' && apiKey !== 'CHANGE_ME' && !apiKey.startsWith('sk-CHANGE')) {
            this.openai = new OpenAI({ apiKey })
            this.logger.log('OpenAI initialized for AI analysis')
        } else {
            this.logger.log('OpenAI not configured — using rich static fallback')
        }
    }

    async generateInsight(userId: string, attemptId: string): Promise<AiInsightResult> {
        // ── Load attempt ──────────────────────────────────────────────────────
        const attempt = await this.prisma.userTestAttempt.findFirst({
            where: { id: attemptId, userId },
            include: {
                test: {
                    select: {
                        title: true,
                        category: true,
                        interpretations: true,
                        scoringType: true,
                        duration: true,
                    },
                },
            },
        })

        if (!attempt) throw new NotFoundException('تلاش یافت نشد')
        if (attempt.status !== 'completed') {
            throw new BadRequestException('تست هنوز تکمیل نشده است')
        }
        if (attempt.aiGeneratedCount >= MAX_AI_GENERATIONS) {
            throw new BadRequestException(`حداکثر ${MAX_AI_GENERATIONS} بار تحلیل برای این تلاش مجاز است`)
        }

        const score = attempt.score as { total?: number; subscales?: Record<string, number> }
        const totalScore = score.total ?? 0

        // Find matching interpretation
        const interpretation = attempt.test.interpretations.find(
            (i) => totalScore >= i.scoreRangeMin && totalScore <= i.scoreRangeMax && !i.subscaleKey,
        )

        const knowledge = CLINICAL_KNOWLEDGE[attempt.test.category]
        const maxScore = knowledge?.maxScore ?? (interpretation?.scoreRangeMax ?? totalScore * 2)

        let result: AiInsightResult

        if (this.openai) {
            try {
                result = await this.callOpenAI(
                    attempt.test.title,
                    attempt.test.category,
                    score,
                    totalScore,
                    maxScore,
                    interpretation?.interpretationText,
                    interpretation?.severity ?? null,
                    knowledge,
                )
            } catch (err) {
                this.logger.error('OpenAI call failed, using rich fallback', err)
                result = buildRichFallback(
                    attempt.test.category,
                    totalScore,
                    maxScore,
                    interpretation?.severity,
                    interpretation?.interpretationText,
                )
            }
        } else {
            result = buildRichFallback(
                attempt.test.category,
                totalScore,
                maxScore,
                interpretation?.severity,
                interpretation?.interpretationText,
            )
        }

        // Persist
        await this.prisma.userTestAttempt.update({
            where: { id: attemptId },
            data: {
                aiRecommendations: result as unknown as Prisma.InputJsonValue,
                aiGeneratedCount: { increment: 1 },
            },
        })

        return result
    }

    private async callOpenAI(
        testTitle: string,
        category: string,
        score: { total?: number; subscales?: Record<string, number> },
        totalScore: number,
        maxScore: number,
        interpretationText: string | undefined,
        severity: string | null,
        knowledge: typeof CLINICAL_KNOWLEDGE[string] | undefined,
    ): Promise<AiInsightResult> {
        const pct = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0
        const sevLabel = severity === 'low' ? 'طبیعی/پایین' : severity === 'medium' ? 'متوسط' : severity === 'high' ? 'بالا/نگران‌کننده' : 'نامشخص'

        const prompt = `
شما یک روان‌شناس کلینیکی متخصص هستید که نتیجه تست روانشناسی یک کاربر را تحلیل می‌کنید.

═══ اطلاعات تست ═══
• نام تست: ${testTitle}
• حوزه: ${category}
• توضیح ابزار: ${knowledge?.description ?? ''}
• راهنمای نمره‌دهی: ${knowledge?.severityGuide ?? ''}
• نکات کلینیکی: ${knowledge?.clinicalNotes ?? ''}

═══ نتیجه کاربر ═══
• نمره کل: ${totalScore} از ${maxScore} (${pct}٪)
• سطح شدت: ${sevLabel}
• خرده‌مقیاس‌ها: ${JSON.stringify(score.subscales ?? {}, null, 2)}
• تفسیر استاندارد: ${interpretationText ?? 'ارائه نشده'}

═══ وظیفه ═══
یک تحلیل روانشناختی جامع، دقیق و عملی به فارسی ارائه دهید.
تحلیل باید:
۱. بر اساس نمره واقعی و ابزار استاندارد باشد
۲. توصیه‌های عملی و قابل اجرا ارائه دهد
۳. لحن حمایتگر و امیدبخش داشته باشد
۴. هیچ اطلاعات شناسایی شخصی ذکر نشود

پاسخ را دقیقاً در قالب JSON زیر ارائه دهید:
{
  "summary": "خلاصه تحلیل کامل (۳-۴ جمله، شامل نمره، تفسیر و چشم‌انداز)",
  "strengths": ["حداقل ۳ نقطه قوت یا جنبه مثبت مرتبط با نتیجه"],
  "concerns": ["نگرانی‌های مرتبط با نتیجه (خالی اگر نمره طبیعی است)"],
  "recommendations": ["حداقل ۴ توصیه عملی، اولویت‌بندی شده از مهم‌ترین به کمتر مهم"]
}

فقط JSON را برگردانید. هیچ متن اضافی قبل یا بعد از JSON نگذارید.
`.trim()

        const response = await this.openai!.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: 'شما یک روان‌شناس کلینیکی متخصص هستید. تحلیل‌های شما دقیق، علمی و حمایتگر هستند. فقط JSON برمی‌گردانید.',
                },
                { role: 'user', content: prompt },
            ],
            response_format: { type: 'json_object' },
            max_tokens: 1200,
            temperature: 0.65,
        })

        const content = response.choices[0]?.message?.content ?? '{}'
        const parsed = JSON.parse(content) as Partial<AiInsightResult>

        return {
            summary:         parsed.summary         ?? 'تحلیل در دسترس نیست',
            strengths:       Array.isArray(parsed.strengths)       ? parsed.strengths       : [],
            concerns:        Array.isArray(parsed.concerns)        ? parsed.concerns        : [],
            recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
            generatedAt:     new Date().toISOString(),
        }
    }
}
