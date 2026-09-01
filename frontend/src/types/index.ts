// ─── Auth & User ─────────────────────────────────────────────────

export interface User {
    id: string
    phone: string
    fullName: string | null
    email: string | null
    bio: string | null
    avatarUrl: string | null
    role: UserRole
    subscriptionLevel: SubscriptionLevel
    subscriptionExpiresAt: string | null
    isActive: boolean
    createdAt: string
    updatedAt: string
}

export type UserRole = 'USER' | 'PSYCHOLOGIST' | 'ADMIN' | 'SUPER_ADMIN'
export type SubscriptionLevel = 'FREE' | 'SILVER' | 'GOLD' | 'PLATINUM'

export interface AuthTokens {
    accessToken: string
    refreshToken?: string
}

// ─── Generic API wrappers ─────────────────────────────────────────

export interface ApiResponse<T> {
    success: boolean
    data: T
    message?: string
    statusCode?: number
}

export interface PaginatedResponse<T> {
    success: boolean
    data: T[]
    meta: {
        total: number
        page: number
        pageSize: number
        totalPages: number
        hasNextPage: boolean
        hasPrevPage: boolean
    }
}

export interface CursorPaginatedResponse<T> {
    success: boolean
    data: T[]
    nextCursor: string | null
    hasMore: boolean
}

// ─── Tests ───────────────────────────────────────────────────────

export interface Test {
    id: string
    slug: string
    title: string
    description: string
    coverImage: string | null
    questionCount: number
    estimatedMinutes: number
    isPremium: boolean
    category: Category
    config: TestConfig
    createdAt: string
}

export interface TestConfig {
    scoringMethod: 'SUM' | 'WEIGHTED' | 'SUBSCALE' | 'CUSTOM'
    maxScore: number
    subscales?: Array<{ key: string; label: string; questionIds: string[] }>
}

export interface TestQuestion {
    id: string
    testId: string
    order: number
    text: string
    options: Array<{ value: number; label: string }>
}

export interface UserTestAttempt {
    id: string
    userId: string
    testId: string
    test: Test
    status: 'in_progress' | 'completed'
    score: number | null
    subscaleScores: Record<string, number> | null
    interpretation: string | null
    aiRecommendations: AiRecommendations | null
    answers: Record<string, number>
    startedAt: string
    completedAt: string | null
}

export interface AiRecommendations {
    summary: string
    strengths: string[]
    concerns: string[]
    recommendations: string[]
}

// ─── Blog ────────────────────────────────────────────────────────

export interface BlogPost {
    id: string
    slug: string
    title: string
    excerpt: string
    content: string
    coverImage: string | null
    isPremium: boolean
    views: number
    readTimeMinutes: number
    author: Pick<User, 'id' | 'fullName' | 'avatarUrl'>
    category: Category
    tags: string[]
    publishedAt: string
    createdAt: string
}

// ─── Product & Shop ───────────────────────────────────────────────

export interface Product {
    id: string
    slug: string
    title: string
    description: string
    price: number
    discountPrice: number | null
    images: string[]
    stock: number
    isDigital: boolean
    category: Category
    rating: number
    reviewCount: number
    createdAt: string
}

export interface Order {
    id: string
    orderNumber: string
    status: OrderStatus
    items: OrderItem[]
    totalAmount: number
    discountAmount: number
    finalAmount: number
    createdAt: string
    paidAt: string | null
}

export type OrderStatus = 'PENDING' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED'

export interface OrderItem {
    id: string
    productId: string
    product: Product
    quantity: number
    unitPrice: number
}

// ─── Books ───────────────────────────────────────────────────────

export interface Book {
    id: string
    slug: string
    title: string
    author: string
    translator: string | null
    description: string
    coverImage: string | null
    price: number
    discountPrice: number | null
    totalPages: number
    isPremium: boolean
    previewPages: number
    category: Category
    rating: number
    reviewCount: number
    createdAt: string
}

// ─── Courses ──────────────────────────────────────────────────────

export interface Course {
    id: string
    slug: string
    title: string
    description: string
    thumbnail: string | null
    price: number
    discountPrice: number | null
    instructor: Pick<User, 'id' | 'fullName' | 'avatarUrl'>
    category: Category
    level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
    totalLessons: number
    totalHours: number
    enrolledCount: number
    rating: number
    reviewCount: number
    createdAt: string
}

// ─── Appointments ─────────────────────────────────────────────────

export interface Appointment {
    id: string
    userId: string
    psychologistId: string
    psychologist: PsychologistProfile
    status: AppointmentStatus
    scheduledAt: string
    durationMinutes: number
    price: number
    notes: string | null
    meetingUrl: string | null
    createdAt: string
}

export type AppointmentStatus = 'PENDING_PAYMENT' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'

export interface PsychologistProfile {
    id: string
    userId: string
    user: Pick<User, 'id' | 'fullName' | 'avatarUrl'>
    specialties: string[]
    bio: string
    licenseNumber: string
    sessionPrice: number
    rating: number
    reviewCount: number
    isAvailable: boolean
}

// ─── Notification ─────────────────────────────────────────────────

export interface Notification {
    id: string
    userId: string
    type: NotificationType
    title: string
    body: string
    data: Record<string, unknown> | null
    isRead: boolean
    createdAt: string
}

export type NotificationType =
    | 'APPOINTMENT_REMINDER'
    | 'APPOINTMENT_CONFIRMED'
    | 'APPOINTMENT_CANCELLED'
    | 'ORDER_PAID'
    | 'ORDER_SHIPPED'
    | 'TICKET_REPLY'
    | 'SUBSCRIPTION_EXPIRING'
    | 'SUBSCRIPTION_EXPIRED'
    | 'CHAT_MESSAGE'
    | 'SYSTEM'

// ─── Category ────────────────────────────────────────────────────

export interface Category {
    id: string
    slug: string
    title: string
    icon: string | null
    parentId: string | null
    children?: Category[]
}

// ─── Ticket ───────────────────────────────────────────────────────

export interface Ticket {
    id: string
    ticketNumber: string
    userId: string
    subject: string
    status: 'OPEN' | 'PENDING' | 'RESOLVED' | 'CLOSED'
    priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
    category: string
    rating: number | null
    messages: TicketMessage[]
    createdAt: string
    updatedAt: string
}

export interface TicketMessage {
    id: string
    ticketId: string
    senderId: string
    sender: Pick<User, 'id' | 'fullName' | 'avatarUrl' | 'role'>
    content: string
    attachmentUrl: string | null
    createdAt: string
}
