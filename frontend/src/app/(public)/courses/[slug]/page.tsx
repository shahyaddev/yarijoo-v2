import type { Metadata } from 'next'
import Link from 'next/link'
import Accordion from '@/components/ui/Accordion'
import { Badge } from '@/components/ui'

export const metadata: Metadata = {
    title: 'جزئیات دوره | یاری‌جو',
}

const CURRICULUM = [
    {
        id: 'section-1',
        title: 'فصل اول: مقدمات و آشنایی با مفاهیم پایه',
        content: (
            <ul className="space-y-2 text-sm">
                {[
                    'معرفی دوره و اهداف آموزشی',
                    'تعریف اضطراب و انواع آن',
                    'مدل شناختی-رفتاری اضطراب',
                    'ارزیابی سطح اضطراب شخصی',
                ].map((lesson) => (
                    <li key={lesson} className="flex items-center gap-2">
                        <span className="text-primary-500">▶</span>
                        {lesson}
                    </li>
                ))}
            </ul>
        ),
    },
    {
        id: 'section-2',
        title: 'فصل دوم: تکنیک‌های مدیریت و کنترل',
        content: (
            <ul className="space-y-2 text-sm">
                {[
                    'تنفس دیافراگمی و آرام‌سازی عضلانی',
                    'بازسازی شناختی افکار منفی',
                    'مواجهه تدریجی با محرک‌های اضطراب‌زا',
                    'تکنیک توقف فکر',
                    'برنامه‌ریزی فعالیت‌های لذت‌بخش',
                ].map((lesson) => (
                    <li key={lesson} className="flex items-center gap-2">
                        <span className="text-primary-500">▶</span>
                        {lesson}
                    </li>
                ))}
            </ul>
        ),
    },
    {
        id: 'section-3',
        title: 'فصل سوم: تمرین‌های عملی و پایداری',
        content: (
            <ul className="space-y-2 text-sm">
                {[
                    'طراحی برنامه روزانه مدیریت اضطراب',
                    'تمرین مدیتیشن و ذهن‌آگاهی',
                    'مهارت حل مسئله',
                    'پیشگیری از بازگشت و نگهداری دستاوردها',
                ].map((lesson) => (
                    <li key={lesson} className="flex items-center gap-2">
                        <span className="text-primary-500">▶</span>
                        {lesson}
                    </li>
                ))}
            </ul>
        ),
    },
]

export default async function CourseDetailPage({
    params,
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params

    const course = {
        slug,
        title: 'مدیریت اضطراب با روش‌های شناختی-رفتاری',
        description:
            'در این دوره جامع، با مبانی علمی اضطراب آشنا می‌شوید و تکنیک‌های اثبات‌شده CBT را برای مدیریت آن در زندگی روزمره فرا می‌گیرید.',
        instructor: {
            name: 'دکتر سارا محمدی',
            title: 'روانشناس بالینی · دکترای روانشناسی از دانشگاه تهران',
            emoji: '👩‍⚕️',
        },
        stats: {
            students: '۱٬۲۴۰',
            hours: '۱۲',
            lessons: '۲۴',
            rating: '۴.۸',
        },
        price: 490000,
        category: 'مدیریت استرس',
        level: 'مبتدی',
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-10">
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Main content */}
                <div className="flex-1 min-w-0">
                    {/* Hero */}
                    <div className="relative rounded-2xl overflow-hidden mb-8 h-72 bg-gradient-to-br from-primary-700 to-primary-900 flex items-center justify-center">
                        <div className="text-center text-white z-10 px-6">
                            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-3xl mx-auto mb-4 cursor-pointer hover:bg-white/30 transition-colors">
                                ▶
                            </div>
                            <p className="text-primary-100 text-sm">مشاهده پیش‌نمایش دوره</p>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    </div>

                    {/* Title + badges */}
                    <div className="mb-6">
                        <div className="flex gap-2 mb-3">
                            <Badge variant="info">{course.category}</Badge>
                            <Badge variant="default">{course.level}</Badge>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                            {course.title}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                            {course.description}
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                        {[
                            { label: 'دانشجو', value: course.stats.students, icon: '👥' },
                            { label: 'ساعت آموزش', value: course.stats.hours, icon: '⏱' },
                            { label: 'درس', value: course.stats.lessons, icon: '📚' },
                            { label: 'امتیاز', value: course.stats.rating, icon: '⭐' },
                        ].map((stat) => (
                            <div
                                key={stat.label}
                                className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 text-center"
                            >
                                <div className="text-2xl mb-1">{stat.icon}</div>
                                <div className="text-xl font-bold text-gray-900 dark:text-white">
                                    {stat.value}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Instructor card */}
                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5 mb-8">
                        <h2 className="font-bold text-gray-900 dark:text-white mb-4">
                            مدرس دوره
                        </h2>
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-3xl flex-shrink-0">
                                {course.instructor.emoji}
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900 dark:text-white">
                                    {course.instructor.name}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                                    {course.instructor.title}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Curriculum */}
                    <div>
                        <h2 className="font-bold text-gray-900 dark:text-white mb-4 text-xl">
                            سرفصل‌های دوره
                        </h2>
                        <Accordion items={CURRICULUM} allowMultiple />
                    </div>
                </div>

                {/* Sticky sidebar */}
                <aside className="lg:w-80 flex-shrink-0">
                    <div className="sticky top-24">
                        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6 shadow-lg">
                            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                                {course.price.toLocaleString('fa-IR')}
                                <span className="text-base font-normal text-gray-500 mr-1">
                                    تومان
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                                دسترسی مادام‌العمر · گواهینامه پایان دوره
                            </p>
                            <Link
                                href={`/courses/${course.slug}/learn`}
                                className="block w-full text-center bg-primary-700 hover:bg-primary-800 text-white font-semibold py-3 rounded-xl transition-colors mb-3"
                            >
                                ثبت‌نام در دوره
                            </Link>
                            <Link
                                href={`/checkout?course=${course.slug}`}
                                className="block w-full text-center bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium py-3 rounded-xl transition-colors"
                            >
                                خرید دوره
                            </Link>
                            <ul className="mt-6 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                <li className="flex items-center gap-2">
                                    <span className="text-green-500">✓</span>
                                    {course.stats.lessons} درس ویدیویی
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-green-500">✓</span>
                                    {course.stats.hours} ساعت آموزش
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-green-500">✓</span>
                                    گواهینامه پایان دوره
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-green-500">✓</span>
                                    پشتیبانی آنلاین مدرس
                                </li>
                            </ul>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    )
}
