interface MessageBubbleProps {
    content: string
    isSent: boolean
    createdAt: string
    isRead?: boolean
    fileUrl?: string
    type?: string
}

export default function MessageBubble({ content, isSent, createdAt, isRead, fileUrl, type }: MessageBubbleProps) {
    const time = new Date(createdAt).toLocaleTimeString('fa-IR', {
        hour: '2-digit',
        minute: '2-digit',
    })

    const isImage = type === 'image' || (fileUrl && /\.(jpg|jpeg|png|gif|webp)$/i.test(fileUrl))
    const isFile = type === 'file' || (fileUrl && !isImage)

    return (
        <div className={['flex', isSent ? 'justify-end' : 'justify-start'].join(' ')}>
            <div
                className={[
                    'max-w-xs lg:max-w-sm px-4 py-2.5 rounded-2xl text-sm leading-relaxed',
                    isSent
                        ? 'bg-primary-700 text-white rounded-bl-none'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-br-none',
                ].join(' ')}
            >
                {/* Image attachment */}
                {isImage && fileUrl && (
                    <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="block mb-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={fileUrl}
                            alt={content}
                            className="rounded-xl max-w-full max-h-48 object-cover"
                        />
                    </a>
                )}

                {/* File attachment */}
                {isFile && fileUrl && (
                    <a
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={[
                            'flex items-center gap-2 mb-2 px-3 py-2 rounded-xl text-xs font-medium',
                            isSent ? 'bg-primary-600 hover:bg-primary-500' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600',
                        ].join(' ')}
                    >
                        <span>📎</span>
                        <span className="truncate max-w-[160px]">{content}</span>
                        <span className="opacity-70">↓</span>
                    </a>
                )}

                {/* Text content — show if not a pure file message or has text */}
                {(!fileUrl || content !== (fileUrl.split('/').pop() ?? '')) && (
                    <p>{content}</p>
                )}

                <div
                    className={[
                        'flex items-center gap-1 mt-1 text-xs',
                        isSent ? 'justify-end text-primary-200' : 'text-gray-400',
                    ].join(' ')}
                >
                    <span>{time}</span>
                    {isSent && <span>{isRead ? '✓✓' : '✓'}</span>}
                </div>
            </div>
        </div>
    )
}
