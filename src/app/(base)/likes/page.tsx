export const dynamic = 'force-dynamic'

import { Metadata } from 'next'
import { getCurrentUserData } from '@/actions/user'
import { prisma } from '@/lib/prisma'
import { Card, CardContent } from '@/components/ui/card'
import { Heart } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import type { News, Category, SubCategory } from '@/types'
import { UnlikeButton } from '@/components/unlike-button'

export const metadata: Metadata = {
  title: 'My Likes - GOAT',
  description: 'View your liked news articles',
}

type NewsWithRelations = News & {
  subCategory: SubCategory & {
    category: Category
  }
}

async function getLikedNews() {
  const user = await getCurrentUserData()
  if (!user) return []

  const userInteraction = await prisma.userInteraction.findFirst({
    where: { userId: user.id },
    include: {
      likes: {
        include: {
          newsInteraction: {
            include: {
              news: {
                include: {
                  subCategory: {
                    include: {
                      category: true
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  })

  if (!userInteraction) return []

  return userInteraction.likes.map(like => like.newsInteraction.news) as NewsWithRelations[]
}

function NewsCard({ news }: { news: NewsWithRelations }) {
  return (
    <div className="relative">
      <Link
        href={`/${news.subCategory.category.path}/${news.subCategory.path}/${news.path}`}
        className="block"
      >
        <Card className="group overflow-hidden">
          <CardContent className="p-0">
            <div className="relative h-[200px]">
              <Image
                src={news.thumbnailUrl || '/api/placeholder/400/200'}
                alt={news.title}
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700"
                width={400}
                height={200}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-primary transition-colors line-clamp-2">
                  {news.title}
                </h3>
                <p className="text-zinc-200 text-sm mb-2 line-clamp-2">
                  {news.description}
                </p>
                <div className="flex items-center justify-between text-zinc-300">
                  <span className="text-sm">
                    {formatDistanceToNow(new Date(news.createdAt), { addSuffix: true })}
                  </span>
                  <span className="text-sm">
                    {news.subCategory.category.title} • {news.subCategory.title}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
      <UnlikeButton newsId={news.id} />
    </div>
  )
}

export default async function LikesPage() {
  const likedNews = await getLikedNews()

  if (likedNews.length === 0) {
    return (
      <div className="container mx-auto py-24">
        <h1 className="text-4xl font-bold mb-8">My Likes</h1>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
            <Heart className="w-16 h-16 mb-4" />
            <h2 className="text-2xl font-bold mb-2">No Liked Articles</h2>
            <p>You haven&apos;t liked any news articles yet.</p>
            <p className="text-sm">Like articles to show your appreciation and save them for later.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-24">
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-4">My Likes</h1>
        <p className="text-lg text-muted-foreground">
          Browse your liked news articles
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {likedNews.map((news) => (
          <NewsCard key={news.id} news={news} />
        ))}
      </div>
    </div>
  )
}
