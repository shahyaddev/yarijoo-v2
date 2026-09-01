'use client'
import { useState } from 'react'
import { Badge } from '@/components/ui'

interface Article {
    id: string
    title: string
    author: string
    category: string
    published: boolean
    views: string
    date: string
}

const INITIAL_ARTICLES: Article[] = [
    { id: 'B-001', title: 'راهنمای کامل تست MBTI', author: 'دکتر رضایی', category: 'شخصیت', published: true, views: '۱۲٬۴۵۰', date: '۱۴۰۳/۰۵/۲۰' },
    { id: 'B-002', title: 'چگونه اضطراب را مدیریت کنیم', author: 'دکتر احمدی', category: 'سلامت روان', published: true, views: '۸٬۳۲۱', date: '۱۴۰۳/۰۵/۱۵' },
    { id: 'B-003', title: 'هوش هیجانی در محیط کار', author: 'مهندس نوری', category: 'شغل', published: false, views: '۰', date: '۱۴۰۳/۰۶/۰۱' },
    { id: 'B-004', title: 'تفاوت‌های شخصیتی در روابط', author: 'دکتر کریمی', category: 'روابط', published: true, views: '۵٬۶۷۸', date: '۱۴۰۳/۰۴/۱۰' },
]

export default function AdminBlogPage() {
    const [articles, setArticles] = useState<Article[]>(INITIAL_ARTICLES)
    const [showModal, setShowModal] = useState(false)
    const [newTitle, setNewTitle] = useState('')
    const [newCategory, setNewCategory] = useState('')

    const togglePublish = (id: string) => {
        setArticles(prev =>
            prev.map(a => a.id === id ? { ...a, published: !a.published } : a)
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold text-white">مجله</h1>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-primary-600 hover:bg-primary-700 text-white text-sm px-4 py-2 rounded-xl transition-colors"
                >
                    + مقاله جدید
                </button>
            </div>

            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-gray-400 border-b border-gray-800 bg-gray-800/50">
                            <th className="text-right px-5 py-3">عنوان</th>
                            <th className="text-right px-5 py-3">نویسنده</th>
                            <th className="text-right px-5 py-3">دسته‌بندی</th>
                            <th className="text-right px-5 py-3">بازدید</th>
                            <th className="text-right px-5 py-3">انتشار</th>
                            <th className="text-right px-5 py-3">تاریخ</th>
                            <th className="text-right px-5 py-3">عملیات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {articles.map((article) => (
                            <tr key={article.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                                <td className="px-5 py-3 text-gray-200 font-medium max-w-xs truncate">{article.title}</td>
                                <td className="px-5 py-3 text-gray-400">{article.author}</td>
                                <td className="px-5 py-3">
                                    <Badge variant="info">{article.category}</Badge>
                                </td>
                                <td className="px-5 py-3 text-gray-400">{article.views}</td>
                                <td className="px-5 py-3">
                                    <button
                                        onClick={() => togglePublish(article.id)}
                                        className={[
                                            'relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none',
                                            article.published ? 'bg-green-500' : 'bg-gray-700',
                                        ].join(' ')}
                                        title={article.published ? 'کلیک برای پنهان‌کردن' : 'کلیک برای انتشار'}
                                    >
                                        <span
                                            className={[
                                                'inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform',
                                                article.published ? 'translate-x-1' : 'translate-x-4',
                                            ].join(' ')}
                                        />
                                    </button>
                                </td>
                                <td className="px-5 py-3 text-gray-400">{article.date}</td>
                                <td className="px-5 py-3">
                                    <div className="flex items-center gap-2">
                                        <button className="text-xs text-blue-400 hover:text-blue-300 transition-colors">ویرایش</button>
                                        <span className="text-gray-700">|</span>
                                        <button className="text-xs text-red-400 hover:text-red-300 transition-colors">حذف</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 w-full max-w-md mx-4">
                        <h2 className="text-lg font-bold text-white mb-5">مقاله جدید</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1.5">عنوان مقاله</label>
                                <input
                                    type="text"
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    placeholder="عنوان مقاله را وارد کنید"
                                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-primary-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1.5">دسته‌بندی</label>
                                <input
                                    type="text"
                                    value={newCategory}
                                    onChange={(e) => setNewCategory(e.target.value)}
                                    placeholder="دسته‌بندی مقاله"
                                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-primary-500"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => { setShowModal(false); setNewTitle(''); setNewCategory('') }}
                                className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm px-4 py-2.5 rounded-xl transition-colors"
                            >
                                انصراف
                            </button>
                            <button
                                onClick={() => { setShowModal(false); setNewTitle(''); setNewCategory('') }}
                                className="flex-1 bg-primary-600 hover:bg-primary-700 text-white text-sm px-4 py-2.5 rounded-xl transition-colors"
                            >
                                ایجاد مقاله
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
