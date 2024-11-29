export const dynamic = 'force-dynamic'

import { Metadata } from 'next'
import { getCurrentUserData } from '@/actions/user'
import { getUserComments } from '@/actions/comment'
import { Card, CardContent } from '@/components/ui/card'
import { MessageCircle } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import type { Comment, News, Category, SubCategory } from '@/types'

export const metadata: Metadata = {
  title: 'My Comments - GOAT',
  description: 'View your comment history',
}

type NewsWithRelations = News & {
  subCategory: SubCategory & {
    category: Category
  }
}

type CommentWithNews = Comment & {
  newsInteraction: {
    news: NewsWithRelations
  }
}

function CommentCard({ comment }: { comment: CommentWithNews }) {
  const news = comment.newsInteraction.news

  return (
    <Card>
      <CardContent className="p-6">
        <div className="grid md:grid-cols-3 gap-6">
          <Link
            href={`/${news.subCategory.category.path}/${news.subCategory.path}/${news.path}`}
            className="block md:col-span-1"
          >
            <div className="relative h-[200px] rounded-lg overflow-hidden">
              <Image
                src={news.thumbnailUrl || '/api/placeholder/400/200'}
                alt={news.title}
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                fill
              />
            </div>
          </Link>
          <div className="md:col-span-2 space-y-4">
            <div>
              <Link
                href={`/${news.subCategory.category.path}/${news.subCategory.path}/${news.path}`}
                className="inline-block hover:text-primary transition-colors"
              >
                <h2 className="text-xl font-bold mb-2">{news.title}</h2>
              </Link>
              <p className="text-sm text-muted-foreground">
                {news.subCategory.category.title} • {news.subCategory.title}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                You commented {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}:
              </p>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm">{comment.text}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default async function CommentsPage() {
  const user = await getCurrentUserData()
  if (!user) {
    throw new Error('Unauthorized')
  }

  const comments = await getUserComments() as CommentWithNews[]

  if (comments.length === 0) {
    return (
      <div className="container mx-auto py-24">
        <h1 className="text-4xl font-bold mb-8">My Comments</h1>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
            <MessageCircle className="w-16 h-16 mb-4" />
            <h2 className="text-2xl font-bold mb-2">No Comments Yet</h2>
            <p>You haven&apos;t commented on any news articles yet.</p>
            <p className="text-sm">Share your thoughts and engage with the community!</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-24">
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-4">My Comments</h1>
        <p className="text-lg text-muted-foreground">
          View and manage your comments on news articles
        </p>
      </header>

      <div className="space-y-6">
        {comments.map((comment) => (
          <CommentCard key={comment.id} comment={comment} />
        ))}
      </div>
    </div>
  )
}
