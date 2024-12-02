'use server'

import { prisma } from '@/lib/prisma'
import { getCurrentUserData } from '@/actions/user'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { COLLECTION_ACTIONS, createLog } from '@/lib/log'

const BookmarkSchema = z.object({
  newsId: z.string().min(1),
  collectionId: z.string().min(1)
})

// Type for getBookmarks response
export type BookmarkWithDetails = {
  id: string
  createdAt: Date
  user: {
    id: string
    clerkId: string | null
    role: string | null
  }
  news: {
    id: string
    title: string
    path: string
  }
  newsInteraction: {
    popularityScore: number
  }
}

export async function getBookmarks(search?: string, dateFilter?: string) {
  try {
    const user = await getCurrentUserData()
    if (!user) {
      throw new Error('Unauthorized')
    }

    // Base query conditions
    let dateCondition = {}
    const now = new Date()

    switch(dateFilter) {
      case 'today':
        dateCondition = {
          gte: new Date(now.setHours(0,0,0,0))
        }
        break
      case 'week':
        const lastWeek = new Date(now)
        lastWeek.setDate(lastWeek.getDate() - 7)
        dateCondition = {
          gte: lastWeek
        }
        break
      case 'month':
        const lastMonth = new Date(now)
        lastMonth.setMonth(lastMonth.getMonth() - 1)
        dateCondition = {
          gte: lastMonth
        }
        break
      default:
        dateCondition = {}
    }

    // Get user's bookmarks through their collections
    const bookmarks = await prisma.bookmark.findMany({
      where: {
        collection: {
          userInteraction: {
            userId: user.id
          }
        },
        ...(Object.keys(dateCondition).length > 0 && {
          createdAt: dateCondition
        }),
        newsInteraction: {
          news: search ? {
            title: {
              contains: search,
              mode: 'insensitive'
            }
          } : undefined
        }
      },
      include: {
        collection: {
          select: {
            userInteraction: {
              select: {
                user: {
                  select: {
                    id: true,
                    clerkId: true,
                    role: true
                  }
                }
              }
            }
          }
        },
        newsInteraction: {
          select: {
            popularityScore: true,
            news: {
              select: {
                id: true,
                title: true,
                path: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return bookmarks.map(bookmark => ({
      id: bookmark.id,
      createdAt: bookmark.createdAt,
      user: bookmark.collection.userInteraction.user,
      news: bookmark.newsInteraction.news,
      newsInteraction: {
        popularityScore: bookmark.newsInteraction.popularityScore
      }
    }))

  } catch (error) {
    console.error('[GET_BOOKMARKS]', error)
    throw error
  }
}

export async function addBookmark(data: z.infer<typeof BookmarkSchema>) {
    try {
      const validation = BookmarkSchema.safeParse(data)
      if (!validation.success) {
        throw new Error('Invalid bookmark data')
      }

      const user = await getCurrentUserData()
      if (!user) {
        throw new Error('Unauthorized')
      }

      const userInteraction = await prisma.userInteraction.findFirst({
        where: { userId: user.id },
        include: {
          collections: {
            include: {
              bookmarks: {
                include: {
                  newsInteraction: true
                }
              }
            }
          }
        }
      })

      // Check if news is already bookmarked
      const isAlreadyBookmarked = userInteraction?.collections.some(collection =>
        collection.bookmarks.some(bookmark =>
          bookmark.newsInteraction.newsId === data.newsId
        )
      )

      if (isAlreadyBookmarked) {
        throw new Error('News already bookmarked')
      }

      const result = await prisma.$transaction(async (tx) => {
        let newsInteraction = await tx.newsInteraction.findFirst({
          where: { newsId: data.newsId }
        })

        if (!newsInteraction) {
          newsInteraction = await tx.newsInteraction.create({
            data: {
              newsId: data.newsId,
              popularityScore: 0
            }
          })
        }

        if (!userInteraction) {
          throw new Error('User interaction not found')
        }

        const bookmark = await tx.bookmark.create({
          data: {
            newsInteractionId: newsInteraction.id,
            collectionId: data.collectionId
          },
          include: {
            newsInteraction: {
              include: {
                news: true
              }
            },
            collection: true
          }
        })

        await tx.newsInteraction.update({
          where: { id: newsInteraction.id },
          data: { popularityScore: { increment: 1 } }
        })

        await tx.userInteraction.update({
          where: { id: userInteraction.id },
          data: { contributionScore: { increment: 1 } }
        })

        await createLog(tx, {
          userId: user.id,
          action: COLLECTION_ACTIONS.NEWS_ADDED_TO_COLLECTION,
          description: `Added news "${bookmark.newsInteraction.news.title}" to collection "${bookmark.collection.name}"`,
          metadata: {
            newsId: data.newsId,
            collectionId: data.collectionId,
            bookmarkId: bookmark.id
          }
        })

        return bookmark
      })

      revalidatePath('/collections')
      return { success: true, data: result }
    } catch (error) {
      console.error('[ADD_BOOKMARK]', error)
      throw error
    }
  }

  export async function removeBookmark(bookmarkId: string) {
    try {
      const user = await getCurrentUserData()
      if (!user) {
        throw new Error('Unauthorized')
      }

      const result = await prisma.$transaction(async (tx) => {
        const bookmark = await tx.bookmark.findUnique({
          where: { id: bookmarkId },
          include: {
            newsInteraction: {
              include: {
                news: true
              }
            },
            collection: {
              include: {
                userInteraction: true
              }
            }
          }
        })

        if (!bookmark) {
          throw new Error('Bookmark not found')
        }

        if (bookmark.collection.userInteraction.userId !== user.id) {
          throw new Error('Unauthorized')
        }

        await tx.bookmark.delete({ where: { id: bookmarkId } })

        await tx.newsInteraction.update({
          where: { id: bookmark.newsInteractionId },
          data: { popularityScore: { decrement: 1 } }
        })

        await tx.userInteraction.update({
          where: { id: bookmark.collection.userInteractionId },
          data: { contributionScore: { decrement: 1 } }
        })

        await createLog(tx, {
          userId: user.id,
          action: COLLECTION_ACTIONS.NEWS_REMOVED_FROM_COLLECTION,
          description: `Removed news "${bookmark.newsInteraction.news.title}" from collection "${bookmark.collection.name}"`,
          metadata: {
            newsId: bookmark.newsInteraction.news.id,
            collectionId: bookmark.collection.id,
            bookmarkId: bookmark.id
          }
        })

        return bookmark
      })

      revalidatePath('/collections')
      return { success: true, data: result }
    } catch (error) {
      console.error('[REMOVE_BOOKMARK]', error)
      throw error
    }
  }


export async function getUserCollections() {
  try {
    const user = await getCurrentUserData()
    if (!user) {
      throw new Error('Unauthorized')
    }

    const userInteraction = await prisma.userInteraction.findFirst({
      where: { userId: user.id },
      include: {
        collections: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            name: true,
            description: true,
            createdAt: true,
            bookmarks: {
              select: { id: true }
            }
          }
        }
      }
    })

    if (!userInteraction) {
      return []
    }

    return userInteraction.collections.map(collection => ({
      ...collection,
      bookmarkCount: collection.bookmarks.length
    }))

  } catch (error) {
    console.error('[GET_USER_COLLECTIONS]', error)
    throw error
  }
}

export async function isNewsBookmarked(newsId: string) {
  try {
    const user = await getCurrentUserData()
    if (!user) {
      return false
    }

    const userInteraction = await prisma.userInteraction.findFirst({
      where: { userId: user.id },
      include: {
        collections: {
          include: {
            bookmarks: {
              include: {
                newsInteraction: true
              }
            }
          }
        }
      }
    })

    if (!userInteraction) {
      return false
    }

    return userInteraction.collections.some(collection =>
      collection.bookmarks.some(bookmark =>
        bookmark.newsInteraction.newsId === newsId
      )
    )
  } catch (error) {
    console.error('[CHECK_BOOKMARK]', error)
    return false
  }
}
