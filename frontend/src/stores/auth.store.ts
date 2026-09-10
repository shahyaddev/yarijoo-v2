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
    login: (phone: string, code: string) => Promise<{ isNewUser: boolean }>
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

            login: async (phone: string, code: string): Promise<{ isNewUser: boolean }> => {
                set({ isLoading: true })
                try {
                    const res = await api.post<{ data: { accessToken: string; user: AuthUser; isNewUser?: boolean } }>('/auth/verify-otp', { phone, code })
                    const payload = res.data?.data ?? (res.data as unknown as { accessToken: string; user: AuthUser; isNewUser?: boolean })
                    set({
                        accessToken: payload.accessToken,
                        user: payload.user,
                        isAuthenticated: true,
                    })
                    // Set a non-HttpOnly cookie so middleware can detect auth
                    if (typeof document !== 'undefined') {
                        document.cookie = `access_token=${payload.accessToken}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`
                    }
                    return { isNewUser: payload.isNewUser ?? false }
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
                    // Clear the auth cookie
                    document.cookie = 'access_token=; path=/; max-age=0; SameSite=Lax'
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
                    // Keep cookie in sync
                    if (typeof document !== 'undefined') {
                        document.cookie = `access_token=${payload.accessToken}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`
                    }
                    return payload.accessToken
                } catch {
                    set({ user: null, accessToken: null, isAuthenticated: false })
                    if (typeof document !== 'undefined') {
                        document.cookie = 'access_token=; path=/; max-age=0; SameSite=Lax'
                    }
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
