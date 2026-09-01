'use client'
import { useState } from 'react'

type TabId = 'general' | 'payment' | 'sms' | 'seo'

const TABS: Array<{ id: TabId; label: string; icon: string }> = [
    { id: 'general', label: 'عمومی', icon: '⚙️' },
    { id: 'payment', label: 'پرداخت', icon: '💳' },
    { id: 'sms', label: 'پیامک', icon: '📱' },
    { id: 'seo', label: 'سئو', icon: '🔍' },
]

function InputField({ label, value, type = 'text', placeholder = '' }: { label: string; value: string; type?: string; placeholder?: string }) {
    const [val, setVal] = useState(value)
    return (
        <div>
            <label className="block text-sm text-gray-400 mb-1.5">{label}</label>
            <input
                type={type}
                value={val}
                onChange={(e) => setVal(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-primary-500 transition-colors"
            />
        </div>
    )
}

function ToggleField({ label, description, defaultValue }: { label: string; description?: string; defaultValue: boolean }) {
    const [enabled, setEnabled] = useState(defaultValue)
    return (
        <div className="flex items-center justify-between py-3 border-b border-gray-800 last:border-0">
            <div>
                <div className="text-sm text-gray-200">{label}</div>
                {description && <div className="text-xs text-gray-500 mt-0.5">{description}</div>}
            </div>
            <button
                onClick={() => setEnabled(e => !e)}
                className={['relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none', enabled ? 'bg-primary-600' : 'bg-gray-700'].join(' ')}
            >
                <span
                    className={['inline-block h-4 w-4 transform rounded-full bg-white transition-transform', enabled ? 'translate-x-1.5' : 'translate-x-5.5'].join(' ')}
                />
            </button>
        </div>
    )
}

function GeneralTab() {
    return (
        <div className="space-y-5">
            <h3 className="text-sm font-semibold text-gray-300 border-b border-gray-800 pb-3">اطلاعات سایت</h3>
            <div className="grid grid-cols-2 gap-4">
                <InputField label="نام سایت" value="یاری‌جو" />
                <InputField label="ایمیل پشتیبانی" value="support@yarijoo.com" type="email" />
                <InputField label="شماره تماس" value="021-88888888" />
                <InputField label="آدرس دفتر" value="تهران، خیابان ولیعصر" />
            </div>
            <div>
                <label className="block text-sm text-gray-400 mb-1.5">توضیح کوتاه</label>
                <textarea
                    defaultValue="پلتفرم روان‌شناسی و خودشناسی یاری‌جو"
                    rows={3}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-primary-500 resize-none"
                />
            </div>
            <h3 className="text-sm font-semibold text-gray-300 border-b border-gray-800 pb-3 pt-2">تنظیمات عمومی</h3>
            <div className="space-y-1">
                <ToggleField label="حالت تعمیر" description="سایت برای بازدیدکنندگان عادی در دسترس نخواهد بود" defaultValue={false} />
                <ToggleField label="ثبت‌نام کاربران" description="امکان ثبت‌نام کاربران جدید" defaultValue={true} />
                <ToggleField label="نمایش تست‌های رایگان" defaultValue={true} />
            </div>
        </div>
    )
}

function PaymentTab() {
    return (
        <div className="space-y-5">
            <h3 className="text-sm font-semibold text-gray-300 border-b border-gray-800 pb-3">درگاه پرداخت</h3>
            <div className="grid grid-cols-2 gap-4">
                <InputField label="نام درگاه" value="زرین‌پال" />
                <InputField label="شماره پذیرنده" value="XXXXXXXXXX" />
                <InputField label="کلید API" value="••••••••••••••••" type="password" />
                <InputField label="کلید مخفی" value="••••••••••••••••" type="password" />
            </div>
            <InputField label="آدرس بازگشت پس از پرداخت" value="https://yarijoo.com/payment/verify" />
            <h3 className="text-sm font-semibold text-gray-300 border-b border-gray-800 pb-3 pt-2">تنظیمات مالی</h3>
            <div className="grid grid-cols-2 gap-4">
                <InputField label="حداقل مبلغ پرداخت (تومان)" value="۱۰٬۰۰۰" />
                <InputField label="حداکثر مبلغ پرداخت (تومان)" value="۵٬۰۰۰٬۰۰۰" />
            </div>
            <div className="space-y-1">
                <ToggleField label="درگاه فعال" defaultValue={true} />
                <ToggleField label="پرداخت آزمایشی (Sandbox)" description="فقط برای تست فعال شود" defaultValue={false} />
            </div>
        </div>
    )
}

function SmsTab() {
    return (
        <div className="space-y-5">
            <h3 className="text-sm font-semibold text-gray-300 border-b border-gray-800 pb-3">سرویس پیامک</h3>
            <div className="grid grid-cols-2 gap-4">
                <InputField label="ارائه‌دهنده" value="کاوه‌نگار" />
                <InputField label="شماره ارسال" value="30009999" />
                <InputField label="API Key" value="••••••••••••••••" type="password" />
                <InputField label="API Secret" value="••••••••••••••••" type="password" />
            </div>
            <h3 className="text-sm font-semibold text-gray-300 border-b border-gray-800 pb-3 pt-2">قالب‌های پیامک</h3>
            <div>
                <label className="block text-sm text-gray-400 mb-1.5">قالب OTP</label>
                <textarea
                    defaultValue="کد تایید یاری‌جو: {code}\nاین کد تا ۵ دقیقه معتبر است."
                    rows={2}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-primary-500 resize-none font-mono"
                />
            </div>
            <div>
                <label className="block text-sm text-gray-400 mb-1.5">قالب تایید پرداخت</label>
                <textarea
                    defaultValue="پرداخت شما به مبلغ {amount} تومان با موفقیت ثبت شد. یاری‌جو"
                    rows={2}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-primary-500 resize-none font-mono"
                />
            </div>
            <div className="space-y-1">
                <ToggleField label="ارسال OTP با پیامک" defaultValue={true} />
                <ToggleField label="ارسال اعلان پرداخت" defaultValue={true} />
                <ToggleField label="ارسال یادآور نوبت" defaultValue={false} />
            </div>
        </div>
    )
}

function SeoTab() {
    return (
        <div className="space-y-5">
            <h3 className="text-sm font-semibold text-gray-300 border-b border-gray-800 pb-3">متا تگ‌های پایه</h3>
            <InputField label="عنوان صفحه اصلی" value="یاری‌جو - پلتفرم روان‌شناسی و خودشناسی" />
            <div>
                <label className="block text-sm text-gray-400 mb-1.5">توضیحات متا (Meta Description)</label>
                <textarea
                    defaultValue="یاری‌جو بهترین پلتفرم برای تست‌های روان‌شناسی، خودشناسی و مشاوره آنلاین در ایران"
                    rows={3}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-primary-500 resize-none"
                />
            </div>
            <InputField label="کلمات کلیدی" value="تست روان‌شناسی، خودشناسی، مشاوره آنلاین، تست MBTI" />
            <h3 className="text-sm font-semibold text-gray-300 border-b border-gray-800 pb-3 pt-2">شبکه‌های اجتماعی (Open Graph)</h3>
            <div className="grid grid-cols-2 gap-4">
                <InputField label="عنوان OG" value="یاری‌جو" />
                <InputField label="تصویر OG URL" value="https://yarijoo.com/og-image.jpg" />
            </div>
            <h3 className="text-sm font-semibold text-gray-300 border-b border-gray-800 pb-3 pt-2">تنظیمات فنی</h3>
            <div className="space-y-1">
                <ToggleField label="Sitemap XML" description="تولید خودکار نقشه سایت" defaultValue={true} />
                <ToggleField label="Robots.txt" description="اجازه ایندکس به موتورهای جستجو" defaultValue={true} />
                <ToggleField label="Canonical URL" defaultValue={true} />
            </div>
        </div>
    )
}

export default function AdminSettingsPage() {
    const [activeTab, setActiveTab] = useState<TabId>('general')

    const TabContent = {
        general: GeneralTab,
        payment: PaymentTab,
        sms: SmsTab,
        seo: SeoTab,
    }[activeTab]

    return (
        <div className="space-y-6">
            <h1 className="text-xl font-bold text-white">تنظیمات</h1>

            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                {/* Tab Header */}
                <div className="flex border-b border-gray-800 bg-gray-800/30">
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={[
                                'flex items-center gap-2 px-5 py-3.5 text-sm transition-colors border-b-2 -mb-px',
                                activeTab === tab.id
                                    ? 'border-primary-500 text-white bg-gray-900/50'
                                    : 'border-transparent text-gray-400 hover:text-gray-200',
                            ].join(' ')}
                        >
                            <span>{tab.icon}</span>
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="p-6">
                    <TabContent />
                    <div className="mt-6 pt-4 border-t border-gray-800 flex justify-end">
                        <button className="bg-primary-600 hover:bg-primary-700 text-white text-sm px-6 py-2.5 rounded-xl transition-colors">
                            ذخیره تغییرات
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
