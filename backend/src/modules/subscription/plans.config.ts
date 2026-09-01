export const SUBSCRIPTION_PLANS = {
    FREE: {
        name: 'رایگان',
        level: 'FREE',
        monthlyPrice: 0,
        yearlyPrice: 0,
        features: {
            testsPerMonth: 3,
            premiumTests: false,
            aiAnalysis: false,
            consultationDiscount: 0,
            booksAccess: false,
            prioritySupport: false,
        },
    },
    SILVER: {
        name: 'نقره‌ای',
        level: 'SILVER',
        monthlyPrice: 99000,
        yearlyPrice: 990000,
        features: {
            testsPerMonth: 20,
            premiumTests: true,
            aiAnalysis: false,
            consultationDiscount: 0,
            booksAccess: true,
            prioritySupport: false,
        },
    },
    GOLD: {
        name: 'طلایی',
        level: 'GOLD',
        monthlyPrice: 199000,
        yearlyPrice: 1990000,
        features: {
            testsPerMonth: -1, // unlimited
            premiumTests: true,
            aiAnalysis: true,
            consultationDiscount: 10,
            booksAccess: true,
            prioritySupport: false,
        },
    },
    PLATINUM: {
        name: 'پلاتینیوم',
        level: 'PLATINUM',
        monthlyPrice: 349000,
        yearlyPrice: 3490000,
        features: {
            testsPerMonth: -1,
            premiumTests: true,
            aiAnalysis: true,
            consultationDiscount: 20,
            booksAccess: true,
            prioritySupport: true,
        },
    },
} as const
