type SpinnerSize = 'sm' | 'md' | 'lg'

const sizes: Record<SpinnerSize, string> = {
    sm: 'w-3.5 h-3.5 border-2',
    md: 'w-5 h-5 border-2',
    lg: 'w-8 h-8 border-[3px]',
}

export default function Spinner({
    size = 'md',
    className = '',
}: {
    size?: SpinnerSize
    className?: string
}) {
    return (
        <span
            className={[
                'rounded-full border-current border-t-transparent animate-spin inline-block',
                sizes[size],
                className,
            ].join(' ')}
            role="status"
            aria-label="در حال بارگذاری"
        />
    )
}
