import { type ReactNode, type HTMLAttributes, type ElementType } from 'react'

type Variant =
    | 'h1'
    | 'h2'
    | 'h3'
    | 'h4'
    | 'h5'
    | 'h6'
    | 'body'
    | 'body-sm'
    | 'caption'

const variantStyles: Record<Variant, { tag: ElementType; cls: string }> = {
    h1: { tag: 'h1', cls: 'text-4xl font-black leading-tight' },
    h2: { tag: 'h2', cls: 'text-3xl font-bold leading-snug' },
    h3: { tag: 'h3', cls: 'text-2xl font-bold leading-snug' },
    h4: { tag: 'h4', cls: 'text-xl font-semibold' },
    h5: { tag: 'h5', cls: 'text-lg font-semibold' },
    h6: { tag: 'h6', cls: 'text-base font-semibold' },
    body: { tag: 'p', cls: 'text-base leading-relaxed' },
    'body-sm': { tag: 'p', cls: 'text-sm leading-relaxed' },
    caption: { tag: 'span', cls: 'text-xs text-gray-500 dark:text-gray-400' },
}

interface TypographyProps extends HTMLAttributes<HTMLElement> {
    variant?: Variant
    children: ReactNode
    as?: ElementType
}

export default function Typography({
    variant = 'body',
    children,
    as,
    className = '',
    ...props
}: TypographyProps) {
    const { tag: DefaultTag, cls } = variantStyles[variant]
    const Tag = as ?? DefaultTag
    return (
        <Tag
            className={[cls, className].filter(Boolean).join(' ')}
            {...props}
        >
            {children}
        </Tag>
    )
}
