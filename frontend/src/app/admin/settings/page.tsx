'use client'
import { useState, useEffect, useCallback } from 'react'
import api from '@/lib/api'
import { IconSettings, IconPayment, IconSms, IconInfo, IconAlertTriangle, IconCheck, IconX } from '@/components/ui/Icon'

// SVG برای سئو
function IconSearch({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
    )
}

type TabId = 'general' | 'payment' | 'sms' | 'seo'

const TABS: Array<{ id: TabId; label: string; Icon: React.FC<{ size?: number; color?: string }> }> = [
    { id: 'general', label: 'عمومی',  Icon: IconSettings },
    { id: 'payment', label: 'پرداخت', Icon: IconPayment  },
    { id: 'sms',     label: 'پیامک',  Icon: IconSms      },
    { id: 'seo',     label: 'سئو',    Icon: IconSearch   },
]

// ── Key groups per tab ────────────────────────────────────────────────────────
const TAB_KEYS: Record<TabId, string[]> = {
    general: ['site_name', 'site_description', 'support_email', 'support_phone', 'office_address', 'maintenance_mode', 'user_registration', 'show_free_tests'],
    payment: ['zarinpal_gateway', 'zarinpal_sandbox'],
    sms: ['sms_otp_enabled', 'sms_payment_notification', 'sms_appointment_reminder'],
    seo: ['meta_title', 'meta_description', 'meta_keywords', 'og_title', 'og_image', 'sitemap_enabled', 'robots_indexing'],
}

// ── UI sub-components ─────────────────────────────────────────────────────────

function SettingInput({
    label, settingKey, value, type = 'text', placeholder = '', onChange,
}: {
    label: string; settingKey: string; value: string; type?: string; placeholder?: string
    onChange: (key: string, val: string) => void
}) {
    return (
        <div>
            <label className="block text-sm text-gray-400 mb-1.5">{label}</label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(settingKey, e.target.value)}
                placeholder={placeholder}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-primary-500 transition-colors"
            />
        </div>
    )
}

function SettingToggle({
    label, description, settingKey, value, onChange,
}: {
    label: string; description?: string; settingKey: string; value: boolean
    onChange: (key: string, val: string) => void
}) {
    return (
        <div className="flex items-center justify-between py-3 border-b border-gray-800 last:border-0">
            <div>
                <div className="text-sm text-gray-200">{label}</div>
                {description && <div className="text-xs text-gray-500 mt-0.5">{description}</div>}
            </div>
            <button
                onClick={() => onChange(settingKey, value ? 'false' : 'true')}
                className={['relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none', value ? 'bg-primary-600' : 'bg-gray-700'].join(' ')}
                aria-pressed={value}
            >
                <span className={['inline-block h-4 w-4 transform rounded-full bg-white transition-transform', value ? 'translate-x-6' : 'translate-x-1'].join(' ')} />
            </button>
        </div>
    )
}

function SettingTextarea({
    label, settingKey, value, rows = 3, onChange,
}: {
    label: string; settingKey: string; value: string; rows?: number
    onChange: (key: string, val: string) => void
}) {
    return (
        <div>
            <label className="block text-sm text-gray-400 mb-1.5">{label}</label>
            <textarea
                value={value}
                onChange={(e) => onChange(settingKey, e.target.value)}
                rows={rows}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-primary-500 resize-none"
            />
        </div>
    )
}

// ── Tab content components ─────────────────────────────────────────────────────

function GeneralTab({ s, onChange }: { s: Record<string, string>; onChange: (k: string, v: string) => void }) {
    return (
        <div className="space-y-5">
            <h3 className="text-sm font-semibold text-gray-300 border-b border-gray-800 pb-3">اطلاعات سایت</h3>
            <div className="grid grid-cols-2 gap-4">
                <SettingInput label="نام سایت" settingKey="site_name" value={s.site_name ?? ''} onChange={onChange} />
                <SettingInput label="ایمیل پشتیبانی" settingKey="support_email" value={s.support_email ?? ''} type="email" onChange={onChange} />
                <SettingInput label="شماره تماس" settingKey="support_phone" value={s.support_phone ?? ''} onChange={onChange} />
                <SettingInput label="آدرس دفتر" settingKey="office_address" value={s.office_address ?? ''} onChange={onChange} />
            </div>
            <SettingTextarea label="توضیح کوتاه" settingKey="site_description" value={s.site_description ?? ''} rows={3} onChange={onChange} />
            <h3 className="text-sm font-semibold text-gray-300 border-b border-gray-800 pb-3 pt-2">تنظیمات عمومی</h3>
            <div className="space-y-1">
                <SettingToggle label="حالت تعمیر" description="سایت برای بازدیدکنندگان عادی در دسترس نخواهد بود" settingKey="maintenance_mode" value={s.maintenance_mode === 'true'} onChange={onChange} />
                <SettingToggle label="ثبت‌نام کاربران" description="امکان ثبت‌نام کاربران جدید" settingKey="user_registration" value={s.user_registration !== 'false'} onChange={onChange} />
                <SettingToggle label="نمایش تست‌های رایگان" settingKey="show_free_tests" value={s.show_free_tests !== 'false'} onChange={onChange} />
            </div>
        </div>
    )
}

function PaymentTab({ s, onChange }: { s: Record<string, string>; onChange: (k: string, v: string) => void }) {
    return (
        <div className="space-y-5">
            <h3 className="text-sm font-semibold text-gray-300 border-b border-gray-800 pb-3">درگاه پرداخت</h3>
            <div className="space-y-1">
                <SettingToggle label="درگاه زرین‌پال فعال" settingKey="zarinpal_gateway" value={s.zarinpal_gateway !== 'false'} onChange={onChange} />
                <SettingToggle label="حالت آزمایشی (Sandbox)" description="فقط برای محیط توسعه فعال کنید" settingKey="zarinpal_sandbox" value={s.zarinpal_sandbox === 'true'} onChange={onChange} />
            </div>
            <div className="rounded-xl bg-yellow-900/20 border border-yellow-700/30 p-4 text-xs text-yellow-400 flex items-center gap-2">
                <IconAlertTriangle size={14} color="#C9A84C" />
                برای تغییر کلید API درگاه، متغیرهای محیطی سرور را ویرایش کنید.
            </div>
        </div>
    )
}

function SmsTab({ s, onChange }: { s: Record<string, string>; onChange: (k: string, v: string) => void }) {
    return (
        <div className="space-y-5">
            <h3 className="text-sm font-semibold text-gray-300 border-b border-gray-800 pb-3">تنظیمات پیامک</h3>
            <div className="space-y-1">
                <SettingToggle label="ارسال OTP با پیامک" settingKey="sms_otp_enabled" value={s.sms_otp_enabled !== 'false'} onChange={onChange} />
                <SettingToggle label="اعلان پرداخت موفق" settingKey="sms_payment_notification" value={s.sms_payment_notification !== 'false'} onChange={onChange} />
                <SettingToggle label="یادآور نوبت مشاوره" settingKey="sms_appointment_reminder" value={s.sms_appointment_reminder === 'true'} onChange={onChange} />
            </div>
            <div className="rounded-xl bg-blue-900/20 border border-blue-700/30 p-4 text-xs text-blue-400 flex items-center gap-2">
                <IconInfo size={14} color="#1565C0" />
                برای تغییر کلید API کاوه‌نگار، متغیر KAVENEGAR_API_KEY در فایل .env سرور را ویرایش کنید.
            </div>
        </div>
    )
}

function SeoTab({ s, onChange }: { s: Record<string, string>; onChange: (k: string, v: string) => void }) {
    return (
        <div className="space-y-5">
            <h3 className="text-sm font-semibold text-gray-300 border-b border-gray-800 pb-3">متا تگ‌های پایه</h3>
            <SettingInput label="عنوان صفحه اصلی" settingKey="meta_title" value={s.meta_title ?? ''} onChange={onChange} />
            <SettingTextarea label="توضیحات متا" settingKey="meta_description" value={s.meta_description ?? ''} rows={3} onChange={onChange} />
            <SettingInput label="کلمات کلیدی" settingKey="meta_keywords" value={s.meta_keywords ?? ''} onChange={onChange} />
            <h3 className="text-sm font-semibold text-gray-300 border-b border-gray-800 pb-3 pt-2">Open Graph</h3>
            <div className="grid grid-cols-2 gap-4">
                <SettingInput label="عنوان OG" settingKey="og_title" value={s.og_title ?? ''} onChange={onChange} />
                <SettingInput label="تصویر OG URL" settingKey="og_image" value={s.og_image ?? ''} onChange={onChange} />
            </div>
            <h3 className="text-sm font-semibold text-gray-300 border-b border-gray-800 pb-3 pt-2">تنظیمات فنی</h3>
            <div className="space-y-1">
                <SettingToggle label="Sitemap XML" description="تولید خودکار نقشه سایت" settingKey="sitemap_enabled" value={s.sitemap_enabled !== 'false'} onChange={onChange} />
                <SettingToggle label="ایندکس موتورهای جستجو" description="اجازه ایندکس به گوگل و بینگ" settingKey="robots_indexing" value={s.robots_indexing !== 'false'} onChange={onChange} />
            </div>
        </div>
    )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AdminSettingsPage() {
    const [activeTab, setActiveTab] = useState<TabId>('general')
    const [settings, setSettings] = useState<Record<string, string>>({})
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [saveResult, setSaveResult] = useState<{ ok: boolean; msg: string } | null>(null)
    // Track which keys have changed
    const [dirty, setDirty] = useState<Record<string, string>>({})

    const loadSettings = useCallback(async () => {
        setLoading(true)
        try {
            const res = await api.get<Record<string, string>>('/admin/settings')
            const data: Record<string, string> = (res.data as { data?: Record<string, string> }).data ?? res.data as unknown as Record<string, string>
            setSettings(data)
        } catch {
            // ignore — keep defaults
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { void loadSettings() }, [loadSettings])

    const handleChange = (key: string, value: string) => {
        setSettings((prev) => ({ ...prev, [key]: value }))
        setDirty((prev) => ({ ...prev, [key]: value }))
    }

    const handleSave = async () => {
        const keysToSave = TAB_KEYS[activeTab]
        const payload = keysToSave.reduce<Record<string, string>>((acc, k) => {
            if (settings[k] !== undefined) acc[k] = settings[k]
            return acc
        }, {})

        if (Object.keys(payload).length === 0) return

        setSaving(true)
        setSaveResult(null)

        try {
            // Save each changed key (API supports one key at a time per PATCH)
            const changed = Object.entries(payload).filter(([k, v]) => dirty[k] !== undefined || v !== undefined)
            await Promise.all(
                changed.map(([key, value]) =>
                    api.patch('/admin/settings', { key, value })
                )
            )
            setDirty({})
            setSaveResult({ ok: true, msg: 'تنظیمات با موفقیت ذخیره شد' })
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'خطا در ذخیره تنظیمات'
            setSaveResult({ ok: false, msg })
        } finally {
            setSaving(false)
            setTimeout(() => setSaveResult(null), 4000)
        }
    }

    const s = settings

    const TAB_COMPONENTS: Record<TabId, React.ReactNode> = {
        general: <GeneralTab s={s} onChange={handleChange} />,
        payment: <PaymentTab s={s} onChange={handleChange} />,
        sms: <SmsTab s={s} onChange={handleChange} />,
        seo: <SeoTab s={s} onChange={handleChange} />,
    }

    return (
        <div className="space-y-6">
            <h1 className="text-xl font-bold text-white">تنظیمات</h1>

            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                {/* Tab Header */}
                <div className="flex border-b border-gray-800 bg-gray-800/30">
                    {TABS.map((tab) => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={['flex items-center gap-2 px-5 py-3.5 text-sm transition-colors border-b-2 -mb-px',
                                activeTab === tab.id ? 'border-primary-500 text-white bg-gray-900/50' : 'border-transparent text-gray-400 hover:text-gray-200'].join(' ')}>
                            <tab.Icon size={15} color={activeTab === tab.id ? 'white' : '#9CA3AF'} />
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="p-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : (
                        TAB_COMPONENTS[activeTab]
                    )}

                    {/* Save bar */}
                    <div className="mt-6 pt-4 border-t border-gray-800 flex items-center justify-between gap-4">
                        {saveResult && (
                            <p className={['text-sm font-medium flex items-center gap-1.5', saveResult.ok ? 'text-green-400' : 'text-red-400'].join(' ')}>
                                {saveResult.ok
                                    ? <IconCheck size={14} color="#4ADE80" />
                                    : <IconX size={14} color="#F87171" />}
                                {saveResult.msg}
                            </p>
                        )}
                        <div className="flex-1" />
                        <button
                            onClick={handleSave}
                            disabled={saving || loading}
                            className="bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white text-sm px-6 py-2.5 rounded-xl transition-colors flex items-center gap-2"
                        >
                            {saving ? (
                                <>
                                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    در حال ذخیره...
                                </>
                            ) : 'ذخیره تغییرات'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
