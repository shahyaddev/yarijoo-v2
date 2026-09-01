'use client'

import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import CartDrawer from '@/components/features/shop/CartDrawer'

export default function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 60 * 1000, // 1 minute
                        retry: 1,
                    },
                },
            }),
    )

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            <CartDrawer />
            {/*
             * The Toaster wrapper div is given role="status" and aria-live="polite"
             * so screen-readers announce toast notifications without interrupting the user.
             * react-hot-toast renders its own portal but wrapping with a live-region div
             * ensures the container is accessible even before the first toast appears.
             */}
            <div
                role="status"
                aria-live="polite"
                aria-atomic="false"
                aria-relevant="additions"
                className="sr-only"
                id="toast-live-region"
            />
            <Toaster
                position="top-center"
                toastOptions={{
                    duration: 4000,
                    style: {
                        fontFamily: 'var(--font-estedad, Estedad), sans-serif',
                        direction: 'rtl',
                        textAlign: 'right',
                    },
                    success: {
                        style: {
                            background: '#1B4332',
                            color: '#fff',
                        },
                        ariaProps: {
                            role: 'status',
                            'aria-live': 'polite',
                        },
                    },
                    error: {
                        style: {
                            background: '#7F1D1D',
                            color: '#fff',
                        },
                        ariaProps: {
                            role: 'alert',
                            'aria-live': 'assertive',
                        },
                    },
                }}
            />
        </QueryClientProvider>
    )
}
