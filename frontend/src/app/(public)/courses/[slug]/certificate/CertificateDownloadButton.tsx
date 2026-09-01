'use client'
import { useState } from 'react'
import api from '@/lib/api'
import { useAuthStore } from '@/stores/auth.store'
import { useRouter } from 'next/navigation'

interface Props {
    slug: string
}

export default function CertificateDownloadButton({ slug }: Props) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const { isAuthenticated } = useAuthStore()
    const router = useRouter()

    const handleDownload = async () => {
        if (!isAuthenticated) {
            router.push(`/auth/login?redirect=/courses/${slug}/certificate`)
            return
        }

        setLoading(true)
        setError('')

        try {
            const response = await api.get(`/courses/${slug}/certificate`, {
                responseType: 'blob',
            })

            // Create a temporary link to trigger browser download
            const blob = new Blob([response.data as BlobPart], { type: 'application/pdf' })
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `certificate-${slug}.pdf`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { message?: string } } })
                ?.response?.data?.message
            setError(msg ?? 'خطا در دانلود گواهینامه. لطفاً مطمئن شوید دوره را تکمیل کرده‌اید.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-col items-center gap-2">
            <button
                onClick={handleDownload}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 bg-primary-700 hover:bg-primary-800 disabled:opacity-60 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
            >
                {loading ? (
                    <>
                        <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        در حال آماده‌سازی...
                    </>
                ) : (
                    <>
                        <span>⬇</span>
                        دانلود گواهینامه (PDF)
                    </>
                )}
            </button>
            {error && (
                <p className="text-sm text-red-500 text-center max-w-xs">{error}</p>
            )}
        </div>
    )
}
