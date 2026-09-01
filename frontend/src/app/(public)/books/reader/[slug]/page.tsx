import { notFound } from 'next/navigation'
import BookReaderClient from './BookReaderClient'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:3333/api/v1'

interface BookPage {
    index: number
    title: string
    content: string
}

interface BookData {
    book: {
        id: string
        slug: string
        title: string
        author: string
        coverImage: string | null
        isPremium: boolean
        price: number
    }
    totalPages: number
    pages: BookPage[]
}

interface PageProps {
    params: Promise<{ slug: string }>
}

async function getBookPages(slug: string): Promise<BookData | null> {
    try {
        const res = await fetch(`${API}/books/${slug}/pages`, { next: { revalidate: 3600 } })
        if (!res.ok) return null
        const json = await res.json() as { data: BookData }
        return json.data
    } catch {
        return null
    }
}

function imgUrl(path: string | null | undefined): string | null {
    if (!path) return null
    if (path.startsWith('http')) return path
    return path.startsWith('/') ? path : `/${path}`
}

export default async function BookReaderPage({ params }: PageProps) {
    const { slug } = await params
    const data = await getBookPages(slug)
    if (!data) notFound()

    const coverSrc = imgUrl(data.book.coverImage)

    return (
        <BookReaderClient
            book={data.book}
            coverSrc={coverSrc}
            pages={data.pages}
        />
    )
}
