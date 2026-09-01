'use client'
import { useRouter, useSearchParams } from 'next/navigation'

export default function ShopClientControls() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const inStock = searchParams.get('inStock') === 'true'

    const handleInStockChange = (checked: boolean) => {
        const params = new URLSearchParams(searchParams.toString())
        if (checked) {
            params.set('inStock', 'true')
        } else {
            params.delete('inStock')
        }
        router.push(`/shop?${params.toString()}`)
    }

    return (
        <div className="space-y-4">
            {/* In-stock toggle */}
            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer select-none">
                <input
                    type="checkbox"
                    checked={inStock}
                    onChange={(e) => handleInStockChange(e.target.checked)}
                    className="rounded border-gray-300 dark:border-gray-600 text-primary-600"
                />
                فقط کالاهای موجود
            </label>
        </div>
    )
}
