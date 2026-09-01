'use client'
import { useState } from 'react'
import { useCartStore } from '@/stores/cart.store'

interface Product { id: string; slug: string; title: string; price: number; salePrice: number | null; stock: number; images: string[]; type: string }

interface Props {
    product: Product
    src: string | null
    displayPrice: number
    inStock: boolean
}

export default function AddToCartButton({ product, src, displayPrice, inStock }: Props) {
    const { addItem, openCart } = useCartStore()
    const [added, setAdded] = useState(false)

    const handleAdd = () => {
        addItem({
            id: product.id,
            title: product.title,
            price: displayPrice,
            quantity: 1,
            image: src ?? undefined,
        })
        openCart()
        setAdded(true)
        setTimeout(() => setAdded(false), 2500)
    }

    if (!inStock) {
        return (
            <button disabled className="w-full py-3 rounded-xl font-bold cursor-not-allowed"
                style={{ background: '#F3EDE3', color: '#8C8C8E' }}>
                ناموجود
            </button>
        )
    }

    return (
        <div className="space-y-2">
            <button onClick={handleAdd}
                className="w-full py-3 rounded-xl font-bold text-white transition-all hover:opacity-90"
                style={{ background: added ? '#2D6A4F' : '#1B4332' }}>
                {added ? '✓ به سبد اضافه شد' : '🛒 افزودن به سبد خرید'}
            </button>
            <a href="/checkout"
                className="block w-full py-3 rounded-xl font-bold text-center border-2 hover:bg-[#F3EDE3] transition-colors"
                style={{ borderColor: '#1B4332', color: '#1B4332' }}>
                خرید فوری
            </a>
        </div>
    )
}
