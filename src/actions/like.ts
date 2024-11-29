'use server'

import { prisma } from '@/lib/prisma'
import { getCurrentUserData } from '@/actions/user'
import { revalidatePath } from 'next/cache'
import { INTERACTION_ACTIONS, createLog } from '@/lib/log'

export async function addLike(newsId: string) {
  try {
    const user = await getCurrentUserData()
    if (!user) {
      throw new Error('Unauthorized')
    }

    // Start a transaction to handle all related updates
    await prisma.$transaction(async (tx) => {
      // Get the news interaction for this news
      const newsInteraction = await tx.newsInteraction.findFirst({
        where: { newsId },
        include: {
          news: {
            select: {
              title: true
            }
          }
        }
      })

      if (!newsInteraction) {
        throw new Error('News interaction not found')
      }

      // Get user interaction
      const userInteraction = await tx.userInteraction.findFirst({
        where: { userId: user.id }
      })

      if (!userInteraction) {
        throw new Error('User interaction not found')
      }

      // Create the like
      const like = await tx.like.create({
        data: {
          newsInteractionId: newsInteraction.id,
          userInteractionId: userInteraction.id
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

      // Create log entry
      await createLog(tx, {
        userId: user.id,
        action: INTERACTION_ACTIONS.NEWS_LIKED,
        description: `Liked news article: ${newsInteraction.news.title}`,
        metadata: {
          newsId,
          likeId: like.id,
          newsTitle: newsInteraction.news.title
        }
      })
    })

    revalidatePath('/news')
    return { success: true }
  } catch (error) {
    console.error('[ADD_LIKE]', error)
    throw error
  }
}

export async function removeLike(newsId: string) {
  try {
    const user = await getCurrentUserData()
    if (!user) {
      throw new Error('Unauthorized')
    }

    // Start a transaction to handle all related updates
    await prisma.$transaction(async (tx) => {
      // Get the news interaction
      const newsInteraction = await tx.newsInteraction.findFirst({
        where: { newsId },
        include: {
          news: {
            select: {
              title: true
            }
          }
        }
      })

      if (!newsInteraction) {
        throw new Error('News interaction not found')
      }

      // Get user interaction
      const userInteraction = await tx.userInteraction.findFirst({
        where: { userId: user.id }
      })

      if (!userInteraction) {
        throw new Error('User interaction not found')
      }

      // Find and delete the like
      const like = await tx.like.findFirst({
        where: {
          newsInteractionId: newsInteraction.id,
          userInteractionId: userInteraction.id
        }
      })

      if (!like) {
        throw new Error('Like not found')
      }

      await tx.like.delete({
        where: { id: like.id }
      })

      // Decrement popularity score for the news
      await tx.newsInteraction.update({
        where: { id: newsInteraction.id },
        data: {
          popularityScore: {
            decrement: 1
          }
        }
      })

      // Decrement contribution score for the user
      await tx.userInteraction.update({
        where: { id: userInteraction.id },
        data: {
          contributionScore: {
            decrement: 1
          }
        }
      })

      // Create log entry
      await createLog(tx, {
        userId: user.id,
        action: INTERACTION_ACTIONS.NEWS_UNLIKED,
        description: `Unliked news article: ${newsInteraction.news.title}`,
        metadata: {
          newsId,
          likeId: like.id,
          newsTitle: newsInteraction.news.title
        }
      })
    })

    revalidatePath('/news')
    return { success: true }
  } catch (error) {
    console.error('[REMOVE_LIKE]', error)
    throw error
  }
}

export async function isNewsLiked(newsId: string): Promise<boolean> {
  try {
    const user = await getCurrentUserData()
    if (!user) {
      return false
    }

    const userInteraction = await prisma.userInteraction.findFirst({
      where: { userId: user.id },
      include: {
        likes: {
          include: {
            newsInteraction: true
          }
        }
      }
    })

    if (!userInteraction) {
      return false
    }

    // Check if the news is liked by the user
    const isLiked = userInteraction.likes.some(like =>
      like.newsInteraction.newsId === newsId
    )

    return isLiked
  } catch (error) {
    console.error('[CHECK_LIKE]', error)
    return false
  }
}
