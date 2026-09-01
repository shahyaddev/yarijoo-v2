'use client'

export default function CTAForm() {
    return (
        <section className="py-16 bg-primary-700 text-white">
            <div className="max-w-2xl mx-auto px-4 text-center">
                <h2 className="text-3xl font-bold mb-3">مشاوره رایگان دریافت کنید</h2>
                <p className="text-primary-200 mb-8">همین حالا شماره موبایل خود را وارد کنید تا با شما تماس بگیریم</p>
                <form
                    className="flex gap-3 flex-col sm:flex-row max-w-md mx-auto"
                    onSubmit={(e) => e.preventDefault()}
                >
                    <input
                        type="tel"
                        placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                        dir="ltr"
                        className="flex-1 px-5 py-3 rounded-2xl bg-white/10 border border-white/30 text-white placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-white/50 text-center"
                    />
                    <button
                        type="submit"
                        className="px-7 py-3 bg-white text-primary-800 font-bold rounded-2xl hover:bg-primary-50 transition-colors"
                    >
                        درخواست مشاوره
                    </button>
                </form>
            </div>
        </section>
    )
}
