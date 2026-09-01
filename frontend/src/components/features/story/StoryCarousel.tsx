'use client'
import { useState } from 'react'
import StoryViewer from './StoryViewer'

interface Story {
    id: string
    title?: string | null
    content: string
    mediaUrl?: string | null
    seen?: boolean
    authorId: string
}

const MOCK_STORIES: Story[] = [
    { id: '1', title: 'مدیریت استرس', content: 'تکنیک تنفس ۴-۷-۸ برای آرامش فوری', mediaUrl: null, seen: false, authorId: 'a1' },
    { id: '2', title: 'خواب سالم', content: 'ساعت خواب منظم داشته باشید', mediaUrl: null, seen: true, authorId: 'a2' },
    { id: '3', title: 'ذهن‌آگاهی', content: 'مدیتیشن ۵ دقیقه‌ای روزانه', mediaUrl: null, seen: false, authorId: 'a3' },
    { id: '4', title: 'روابط سالم', content: 'ارتباط موثر با دیگران', mediaUrl: null, seen: false, authorId: 'a4' },
    { id: '5', title: 'ورزش و روان', content: 'ورزش روزانه برای شادی', mediaUrl: null, seen: true, authorId: 'a5' },
]

export default function StoryCarousel() {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

    return (
        <>
            {/* RTL horizontal scroll — flex-row-reverse for RTL layout */}
            <div
                className="flex gap-4 overflow-x-auto pb-3 scrollbar-thin scrollbar-thumb-gray-300 flex-row-reverse"
                role="list"
                aria-label="استوری‌ها"
            >
                {MOCK_STORIES.map((story, index) => (
                    <button
                        key={story.id}
                        onClick={() => setSelectedIndex(index)}
                        className="flex flex-col items-center gap-2 flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-full"
                        role="listitem"
                        aria-label={`استوری ${story.title ?? ''} - ${story.seen ? 'مشاهده شده' : 'مشاهده نشده'}`}
                    >
                        {/* Ring indicator: green for unseen, grey for seen */}
                        <div
                            className={[
                                'w-16 h-16 rounded-full flex items-center justify-center ring-[3px] ring-offset-2 transition-all',
                                story.seen
                                    ? 'ring-gray-300 dark:ring-gray-600'
                                    : 'ring-primary-500 dark:ring-primary-400',
                            ].join(' ')}
                        >
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-200 to-primary-400 dark:from-primary-800 dark:to-primary-600 flex items-center justify-center text-2xl">
                                🧠
                            </div>
                        </div>
                        <span className="text-xs text-gray-600 dark:text-gray-400 max-w-[64px] truncate">
                            {story.title}
                        </span>
                    </button>
                ))}
            </div>

            {/* Story viewer modal */}
            {selectedIndex !== null && (
                <StoryViewer
                    stories={MOCK_STORIES}
                    initialIndex={selectedIndex}
                    onClose={() => setSelectedIndex(null)}
                />
            )}
        </>
    )
}
