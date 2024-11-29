'use server'

import { prisma } from '@/lib/prisma'
import { getCurrentUserData } from '@/actions/user'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const BookmarkSchema = z.object({
  newsId: z.string().min(1),
  collectionId: z.string().min(1)
})

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

      // Check if news is already bookmarked by user
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

      const isAlreadyBookmarked = userInteraction?.collections.some(collection =>
        collection.bookmarks.some(bookmark =>
          bookmark.newsInteraction.newsId === data.newsId
        )
      )

      if (isAlreadyBookmarked) {
        throw new Error('News already bookmarked')
      }

      // Start a transaction to handle all related updates
      await prisma.$transaction(async (tx) => {
        // Get the news interaction for this news
        const newsInteraction = await tx.newsInteraction.findFirst({
          where: { newsId: data.newsId }
        })

        if (!newsInteraction) {
          throw new Error('News interaction not found')
        }

        if (!userInteraction) {
          throw new Error('User interaction not found')
        }

        // Create the bookmark
        await tx.bookmark.create({
          data: {
            newsInteractionId: newsInteraction.id,
            collectionId: data.collectionId
          }
        })

        // Increment popularity score for the news
        await tx.newsInteraction.update({
          where: { id: newsInteraction.id },
          data: {
            popularityScore: {
              increment: 1
            }
          }
        })

        // Increment contribution score for the user
        await tx.userInteraction.update({
          where: { id: userInteraction.id },
          data: {
            contributionScore: {
              increment: 1
            }
          }
        })
      })

      revalidatePath('/collections')
      return { success: true }
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

    // Start a transaction to handle all related updates
    await prisma.$transaction(async (tx) => {
      // Get the bookmark with its relations
      const bookmark = await tx.bookmark.findUnique({
        where: { id: bookmarkId },
        include: {
          newsInteraction: true,
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

      // Verify ownership through userInteraction
      if (bookmark.collection.userInteraction.userId !== user.id) {
        throw new Error('Unauthorized')
      }

      // Delete the bookmark
      await tx.bookmark.delete({
        where: { id: bookmarkId }
      })

      // Decrement popularity score for the news
      await tx.newsInteraction.update({
        where: { id: bookmark.newsInteractionId },
        data: {
          popularityScore: {
            decrement: 1
          }
        }
      })

      // Decrement contribution score for the user
      await tx.userInteraction.update({
        where: { id: bookmark.collection.userInteractionId },
        data: {
          contributionScore: {
            decrement: 1
          }
        }
      })
    })

    revalidatePath('/collections')
    return { success: true }
  } catch (error) {
    console.error('[REMOVE_BOOKMARK]', error)
    throw error
  }
}

// Add function to check if a news is bookmarked
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

    // Check if the news is bookmarked in any of the user's collections
    const isBookmarked = userInteraction.collections.some(collection =>
      collection.bookmarks.some(bookmark =>
        bookmark.newsInteraction.newsId === newsId
      )
    )

    return isBookmarked
  } catch (error) {
    console.error('[CHECK_BOOKMARK]', error)
    return false
  }
}
