import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { imgUrl } from '@/lib/imgUrl'
import BookDetailClient from './BookDetailClient'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:3333/api/v1'

interface Book {
    id: string
    slug: string
    title: string
    author: string
    description: string | null
    coverImage: string | null
    price: number
    isPremium: boolean
    totalPages: number | null
}

interface PageProps { params: Promise<{ slug: string }> }

async function getBook(slug: string): Promise<Book | null> {
    try {
        const res = await fetch(`${API}/books/${slug}`, { next: { revalidate: 300 } })
        if (!res.ok) return null
        const json = await res.json() as { data: Book }
        return json.data
    } catch { return null }
}

async function getBookPages(slug: string) {
    try {
        const res = await fetch(`${API}/books/${slug}/pages`, { next: { revalidate: 3600 } })
        if (!res.ok) return null
        const json = await res.json() as { data: { pages: { index: number; title: string }[]; totalPages: number } }
        return json.data
    } catch { return null }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params
    const book = await getBook(slug)
    return {
        title: book ? `${book.title} | یاری‌جو` : 'کتاب | یاری‌جو',
        description: book?.description?.replace(/<[^>]*>/g, '').slice(0, 160),
    }
}

export default async function BookDetailPage({ params }: PageProps) {
    const { slug } = await params
    const [book, pagesData] = await Promise.all([getBook(slug), getBookPages(slug)])
    if (!book) notFound()

    return (
        <BookDetailClient
            book={book}
            coverSrc={imgUrl(book.coverImage)}
            pages={pagesData?.pages ?? []}
            totalPages={pagesData?.totalPages ?? book.totalPages ?? 0}
        />
    )
}
