import Image from 'next/image'

interface AvatarProps {
    src?: string | null
    alt?: string
    size?: 'sm' | 'md' | 'lg' | 'xl'
    fallback?: string
    className?: string
}

const sizes: Record<string, { px: number; cls: string }> = {
    sm: { px: 32, cls: 'w-8 h-8 text-xs' },
    md: { px: 40, cls: 'w-10 h-10 text-sm' },
    lg: { px: 56, cls: 'w-14 h-14 text-base' },
    xl: { px: 80, cls: 'w-20 h-20 text-xl' },
}

export default function Avatar({
    src,
    alt = '',
    size = 'md',
    fallback,
    className = '',
}: AvatarProps) {
    const { px, cls } = sizes[size]
    const initials = fallback ?? (alt ? alt.charAt(0).toUpperCase() : '?')

    return (
        <div
            className={[
                'rounded-full overflow-hidden bg-primary-100 dark:bg-primary-900 flex items-center justify-center flex-shrink-0',
                cls,
                className,
            ].join(' ')}
        >
            {src ? (
                <Image
                    src={src}
                    alt={alt}
                    width={px}
                    height={px}
                    className="object-cover w-full h-full"
                />
            ) : (
                <span className="font-bold text-primary-700 dark:text-primary-300">
                    {initials}
                </span>
            )}
        </div>
    )
}
