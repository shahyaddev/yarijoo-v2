import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '@/lib/api'

export interface AuthUser {
    id: string
    phone: string
    email?: string | null
    fullName?: string | null
    avatarUrl?: string | null
    role: string
    subscriptionLevel: string
    isVerified: boolean
}

interface AuthState {
    user: AuthUser | null
    accessToken: string | null
    isLoading: boolean
    isAuthenticated: boolean
}

interface AuthActions {
    setUser: (user: AuthUser | null) => void
    setAccessToken: (token: string | null) => void
    setLoading: (loading: boolean) => void
    login: (phone: string, code: string) => Promise<void>
    logout: () => Promise<void>
    refreshToken: () => Promise<string | null>
    fetchMe: () => Promise<void>
}

export type AuthStore = AuthState & AuthActions

export const useAuthStore = create<AuthStore>()(
    persist(
        (set) => ({
            user: null,
            accessToken: null,
            isLoading: false,
            isAuthenticated: false,

            setUser: (user) => set({ user, isAuthenticated: !!user }),
            setAccessToken: (token) => set({ accessToken: token }),
            setLoading: (isLoading) => set({ isLoading }),

            login: async (phone: string, code: string) => {
                set({ isLoading: true })
                try {
                    const res = await api.post<{ data: { accessToken: string; user: AuthUser } }>('/auth/verify-otp', { phone, code })
                    const payload = res.data?.data ?? (res.data as unknown as { accessToken: string; user: AuthUser })
                    set({
                        accessToken: payload.accessToken,
                        user: payload.user,
                        isAuthenticated: true,
                    })
                } finally {
                    set({ isLoading: false })
                }
            },

            logout: async () => {
                try {
                    await api.post('/auth/logout')
                } catch {
                    // ignore errors on logout
                }
                set({ user: null, accessToken: null, isAuthenticated: false })
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('yarijoo-auth')
                    window.location.href = '/auth/login'
                }
            },

            refreshToken: async () => {
                try {
                    const res = await api.post<{ data: { accessToken: string; user: AuthUser } }>('/auth/refresh')
                    const payload = res.data?.data ?? (res.data as unknown as { accessToken: string; user: AuthUser })
                    set({
                        accessToken: payload.accessToken,
                        user: payload.user,
                        isAuthenticated: true,
                    })
                    return payload.accessToken
                } catch {
                    set({ user: null, accessToken: null, isAuthenticated: false })
                    return null
                }
            },

            fetchMe: async () => {
                try {
                    const res = await api.get<{ data: AuthUser }>('/auth/me')
                    const user = res.data?.data ?? (res.data as unknown as AuthUser)
                    set({ user, isAuthenticated: true })
                } catch {
                    set({ user: null, isAuthenticated: false })
                }
            },
        }),
        {
            name: 'yarijoo-auth',
            partialize: (state) => ({
                user: state.user,
                accessToken: state.accessToken,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
)
