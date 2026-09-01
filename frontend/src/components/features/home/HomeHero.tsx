'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function HomeHero() {
    return (
        <section className="relative overflow-hidden bg-gradient-to-bl from-primary-900 via-primary-800 to-primary-700 text-white">
            <div className="max-w-7xl mx-auto px-4 py-20 md:py-32 flex flex-col md:flex-row items-center gap-10">
                <motion.div
                    className="flex-1 text-center md:text-right"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1 className="text-4xl md:text-6xl font-black leading-tight mb-6">
                        سلامت روان خود را
                        <br />
                        <span className="text-primary-300">جدی بگیرید</span>
                    </h1>
                    <p className="text-lg text-primary-100 mb-8 max-w-lg md:mr-0 mx-auto">
                        با تست‌های روانشناسی معتبر، مشاوره آنلاین با متخصصان و محتوای تخصصی، سفر سلامت روان خود را آغاز کنید.
                    </p>
                    <div className="flex gap-4 justify-center md:justify-start flex-wrap">
                        <Link
                            href="/tests"
                            className="px-8 py-4 bg-white text-primary-800 font-bold rounded-2xl hover:bg-primary-50 transition-colors shadow-lg text-base"
                        >
                            شروع تست رایگان
                        </Link>
                        <Link
                            href="/psychologists"
                            className="px-8 py-4 border-2 border-white/40 text-white font-bold rounded-2xl hover:bg-white/10 transition-colors text-base"
                        >
                            مشاوره آنلاین
                        </Link>
                    </div>
                </motion.div>

                <motion.div
                    className="flex-shrink-0"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <div className="w-64 h-64 md:w-80 md:h-80 bg-white/10 rounded-full flex items-center justify-center border-2 border-white/20">
                        <span className="text-9xl select-none">🧠</span>
                    </div>
                </motion.div>
            </div>

            {/* Decorative wave */}
            <svg className="absolute bottom-0 left-0 right-0 w-full" viewBox="0 0 1440 60" preserveAspectRatio="none">
                <path d="M0,60 C360,0 1080,60 1440,20 L1440,60 Z" fill="white" className="dark:fill-gray-950" />
            </svg>
        </section>
    )
}
