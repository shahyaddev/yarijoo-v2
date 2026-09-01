'use client'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useCartStore } from '@/stores/cart.store'

export default function CartDrawer() {
    const { items, isOpen, closeCart, removeItem, updateQuantity, total } =
        useCartStore()

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40 bg-black/50"
                        onClick={closeCart}
                    />

                    {/* Drawer slides from left (RTL layout) */}
                    <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: 'tween', duration: 0.3 }}
                        className="fixed top-0 left-0 bottom-0 z-50 w-80 bg-white dark:bg-gray-900 shadow-2xl flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                            <button
                                onClick={closeCart}
                                aria-label="بستن سبد خرید"
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl transition-colors"
                            >
                                ✕
                            </button>
                            <h2 className="font-bold text-gray-900 dark:text-white">
                                سبد خرید ({items.length})
                            </h2>
                        </div>

                        {/* Items */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {items.length === 0 ? (
                                <div className="text-center py-10 text-gray-400">
                                    <div className="text-5xl mb-3">🛒</div>
                                    <p className="text-sm">سبد خرید خالی است</p>
                                </div>
                            ) : (
                                items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 rounded-xl p-3"
                                    >
                                        {/* Thumbnail */}
                                        <div className="w-14 h-14 bg-primary-100 dark:bg-primary-900/40 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
                                            {item.image ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img
                                                    src={item.image}
                                                    alt={item.title}
                                                    className="w-full h-full object-cover rounded-lg"
                                                />
                                            ) : (
                                                '🛍️'
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
                                                {item.title}
                                            </p>
                                            <p className="text-sm text-primary-700 dark:text-primary-400 font-semibold">
                                                {item.price.toLocaleString('fa-IR')} ت
                                            </p>
                                        </div>

                                        {/* Qty controls */}
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() =>
                                                    updateQuantity(item.id, item.quantity - 1)
                                                }
                                                aria-label="کاهش تعداد"
                                                className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                                            >
                                                −
                                            </button>
                                            <span className="w-5 text-center text-sm font-medium">
                                                {item.quantity}
                                            </span>
                                            <button
                                                onClick={() =>
                                                    updateQuantity(item.id, item.quantity + 1)
                                                }
                                                aria-label="افزایش تعداد"
                                                className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                                            >
                                                +
                                            </button>
                                        </div>

                                        {/* Remove */}
                                        <button
                                            onClick={() => removeItem(item.id)}
                                            aria-label="حذف از سبد"
                                            className="text-red-400 hover:text-red-600 text-sm transition-colors"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer — discount + subtotal + CTA */}
                        {items.length > 0 && (
                            <div className="p-4 border-t border-gray-100 dark:border-gray-800 space-y-3">
                                {/* Discount code */}
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="کد تخفیف"
                                        className="flex-1 px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-primary-500"
                                    />
                                    <button className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium">
                                        اعمال
                                    </button>
                                </div>

                                {/* Subtotal */}
                                <div className="flex justify-between font-bold text-gray-900 dark:text-white">
                                    <span>جمع کل:</span>
                                    <span>{total().toLocaleString('fa-IR')} تومان</span>
                                </div>

                                {/* Checkout CTA */}
                                <Link
                                    href="/checkout"
                                    onClick={closeCart}
                                    className="block w-full text-center py-3 bg-primary-700 hover:bg-primary-600 text-white font-bold rounded-xl transition-colors"
                                >
                                    ادامه خرید
                                </Link>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
