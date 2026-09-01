import type { Config } from 'tailwindcss'

const config: Config = {
    content: ['./src/**/*.{ts,tsx,js,jsx,mdx}'],
    theme: {
        extend: {
            fontFamily: {
                vazir: ['Vazirmatn', 'Tahoma', 'sans-serif'],
                sans: ['Vazirmatn', 'Tahoma', 'sans-serif'],
            },
            colors: {
                cream: {
                    50: '#FAF7F2',
                    100: '#F3EDE3',
                    200: '#EDE6D6',
                    300: '#DDD5C5',
                    400: '#C8BBA8',
                    500: '#B0A090',
                },
                forest: {
                    300: '#74C69D',
                    400: '#52B788',
                    500: '#2D6A4F',
                    600: '#1B4332',
                    700: '#163828',
                    800: '#0F2A1D',
                    DEFAULT: '#1B4332',
                },
                gold: {
                    DEFAULT: '#C9A84C',
                    light: '#E8C96A',
                },
                // alias for existing components
                primary: {
                    50: '#D8F3DC',
                    100: '#B7E4C7',
                    200: '#95D5B2',
                    300: '#74C69D',
                    400: '#52B788',
                    500: '#40916C',
                    600: '#2D6A4F',
                    700: '#1B4332',
                    800: '#143226',
                    900: '#081C15',
                    DEFAULT: '#1B4332',
                    light: '#2D6A4F',
                    dark: '#0D2B20',
                },
                accent: {
                    DEFAULT: '#52B788',
                    light: '#74C69D',
                },
            },
            borderRadius: {
                DEFAULT: '12px',
                sm: '8px',
                md: '12px',
                lg: '16px',
                xl: '20px',
                '2xl': '28px',
                card: '16px',
                button: '12px',
                input: '10px',
            },
            boxShadow: {
                xs: '0 1px 3px rgba(27,67,50,0.06)',
                sm: '0 2px 8px rgba(27,67,50,0.08)',
                card: '0 4px 16px rgba(27,67,50,0.10)',
                'card-hover': '0 8px 32px rgba(27,67,50,0.14)',
                lg: '0 8px 32px rgba(27,67,50,0.13)',
                xl: '0 16px 48px rgba(27,67,50,0.16)',
            },
            animation: {
                'fade-in': 'fadeIn 0.3s ease-in-out both',
                'slide-up': 'slideUp 0.4s ease-out both',
                'slide-in': 'slideIn 0.3s ease-out both',
                'scale-in': 'scaleIn 0.2s ease-out both',
            },
            keyframes: {
                fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
                slideUp: { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
                slideIn: { '0%': { opacity: '0', transform: 'translateX(16px)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },
                scaleIn: { '0%': { opacity: '0', transform: 'scale(0.92)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
            },
        },
    },
    plugins: [],
}

export default config
