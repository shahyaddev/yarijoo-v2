'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import MessageBubble from './MessageBubble'
import TypingIndicator from './TypingIndicator'
import { useChatSocket } from '@/hooks/useChatSocket'
import api from '@/lib/api'

interface Message {
    id: string
    roomId: string
    senderId: string
    content: string
    type: string
    fileUrl?: string
    createdAt: string
}

interface ChatWindowProps {
    currentUserId: string
    roomId: string
}

export default function ChatWindow({ currentUserId, roomId }: ChatWindowProps) {
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const [uploading, setUploading] = useState(false)
    const bottomRef = useRef<HTMLDivElement>(null)
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Load message history on room change
    useEffect(() => {
        if (!roomId) return
        setMessages([])
        api.get<{ data: Message[] }>(`/chat/rooms/${roomId}/messages`)
            .then((res) => {
                const msgs = Array.isArray(res.data) ? res.data : (res.data as { data: Message[] }).data ?? []
                setMessages(msgs)
            })
            .catch(() => {/* history not critical */})
    }, [roomId])

    const handleMessage = useCallback((msg: Message) => {
        setMessages((prev) => [...prev, msg])
    }, [])

    const handleTyping = useCallback(
        ({ userId, isTyping: typing }: { userId: string; isTyping: boolean }) => {
            if (userId !== currentUserId) {
                setIsTyping(typing)
            }
        },
        [currentUserId],
    )

    const { sendMessage, sendTyping } = useChatSocket({
        roomId,
        onMessage: handleMessage,
        onTyping: handleTyping,
    })

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const handleSend = () => {
        if (!input.trim()) return
        sendMessage(input.trim())
        setInput('')
        sendTyping(false)
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value)
        sendTyping(true)
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
        typingTimeoutRef.current = setTimeout(() => sendTyping(false), 2000)
    }

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file || !roomId) return

        setUploading(true)
        try {
            const formData = new FormData()
            formData.append('file', file)

            const res = await api.post<{ fileUrl: string; type: string }>(
                `/chat/rooms/${roomId}/upload`,
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } },
            )

            const { fileUrl, type } = res.data as { fileUrl: string; type: string }
            const msgType = type.startsWith('image/') ? 'image' : 'file'
            sendMessage(file.name, msgType)

            // Emit again with fileUrl so gateway saves it
            setMessages((prev) => [
                ...prev,
                {
                    id: `local-${Date.now()}`,
                    roomId,
                    senderId: currentUserId,
                    content: file.name,
                    type: msgType,
                    fileUrl,
                    createdAt: new Date().toISOString(),
                },
            ])
        } catch {
            // silent — user sees no change
        } finally {
            setUploading(false)
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-lg">
                    👩‍⚕️
                </div>
                <div>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">دکتر سارا احمدی</p>
                    <p className="text-xs text-green-500">آنلاین</p>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => (
                    <MessageBubble
                        key={msg.id}
                        content={msg.content}
                        isSent={msg.senderId === currentUserId || msg.senderId === 'me'}
                        createdAt={msg.createdAt}
                        fileUrl={msg.fileUrl}
                        type={msg.type}
                    />
                ))}
                {isTyping && <TypingIndicator />}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2">
                {/* Hidden file input */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.pdf,.doc,.docx"
                    className="hidden"
                    onChange={handleFileSelect}
                    aria-label="انتخاب فایل"
                />
                <button
                    aria-label="پیوست فایل"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                >
                    {uploading ? (
                        <span className="inline-block w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                    ) : '📎'}
                </button>
                <input
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            handleSend()
                        }
                    }}
                    placeholder="پیام خود را بنویسید..."
                    className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-300"
                />
                <button
                    onClick={handleSend}
                    disabled={!input.trim()}
                    aria-label="ارسال پیام"
                    className="p-2.5 bg-primary-700 hover:bg-primary-600 text-white rounded-xl disabled:opacity-40 transition-colors"
                >
                    ↑
                </button>
            </div>
        </div>
    )
}
