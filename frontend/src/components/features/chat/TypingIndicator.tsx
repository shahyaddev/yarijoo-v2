export default function TypingIndicator() {
    return (
        <div className="flex items-center gap-2 text-gray-400 text-sm px-1">
            <div className="flex gap-1">
                <span
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: '0ms' }}
                />
                <span
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: '150ms' }}
                />
                <span
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: '300ms' }}
                />
            </div>
            <span>در حال تایپ...</span>
        </div>
    )
}
