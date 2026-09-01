import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1'

const api: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
})

// ─── Request interceptor — attach Authorization header ────────────
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        if (typeof window !== 'undefined') {
            try {
                // Primary: read from zustand-persist storage (auth store)
                const stored = localStorage.getItem('yarijoo-auth')
                if (stored) {
                    const parsed = JSON.parse(stored) as { state?: { accessToken?: string } }
                    const token = parsed?.state?.accessToken
                    if (token) {
                        config.headers.Authorization = `Bearer ${token}`
                        return config
                    }
                }
                // Fallback: legacy flat key
                const legacyToken = localStorage.getItem('yarijoo-access-token')
                if (legacyToken) {
                    config.headers.Authorization = `Bearer ${legacyToken}`
                }
            } catch {
                // localStorage not accessible (SSR or private mode)
            }
        }
        return config
    },
    (error) => Promise.reject(error),
)

// ─── Track whether a refresh is already in flight ────────────────
let isRefreshing = false
let refreshSubscribers: Array<(token: string) => void> = []

function onTokenRefreshed(token: string) {
    refreshSubscribers.forEach((cb) => cb(token))
    refreshSubscribers = []
}

function addRefreshSubscriber(cb: (token: string) => void) {
    refreshSubscribers.push(cb)
}

// ─── Response interceptor — handle 401 and token refresh ─────────
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                // Queue the request until refresh completes
                return new Promise((resolve) => {
                    addRefreshSubscriber((token: string) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`
                        resolve(api(originalRequest))
                    })
                })
            }

            originalRequest._retry = true
            isRefreshing = true

            try {
                const { data } = await axios.post(
                    `${BASE_URL}/auth/refresh`,
                    {},
                    { withCredentials: true },
                )

                const newAccessToken: string = data?.data?.accessToken ?? data?.accessToken

                if (newAccessToken && typeof window !== 'undefined') {
                    localStorage.setItem('yarijoo-access-token', newAccessToken)
                }

                onTokenRefreshed(newAccessToken)
                isRefreshing = false

                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
                return api(originalRequest)
            } catch (refreshError) {
                isRefreshing = false
                refreshSubscribers = []

                if (typeof window !== 'undefined') {
                    localStorage.removeItem('yarijoo-access-token')
                    window.location.href = '/auth/login'
                }

                return Promise.reject(refreshError)
            }
        }

        return Promise.reject(error)
    },
)

export default api
