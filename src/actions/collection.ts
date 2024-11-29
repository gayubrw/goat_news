'use server'

import { prisma } from '@/lib/prisma'
import { getCurrentUserData } from '@/actions/user'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

export async function getUserCollections() {
  try {
    const user = await getCurrentUserData()
    if (!user) {
      throw new Error('Unauthorized')
    }

    const userWithInteractions = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        userInteractions: {
          include: {
            collections: {
              include: {
                bookmarks: {
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
            }
          }
        }
      }
    })

    if (!userWithInteractions?.userInteractions[0]) {
      return []
    }

    return userWithInteractions.userInteractions[0].collections
  } catch (error) {
    console.error('[GET_USER_COLLECTIONS]', error)
    throw new Error('Failed to fetch collections')
  }
}

const CreateCollectionSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
    description: z.string().min(1, 'Description is required').max(200, 'Description is too long')
  })

  export async function createCollection(data: z.infer<typeof CreateCollectionSchema>) {
    try {
      const validation = CreateCollectionSchema.safeParse(data)
      if (!validation.success) {
        throw new Error(validation.error.errors[0].message)
      }

      const user = await getCurrentUserData()
      if (!user) {
        throw new Error('Unauthorized')
      }

      // Get user with complete relations
      const userWithRelations = await prisma.user.findUnique({
        where: { id: user.id },
        include: {
          news: {
            include: {
              user: true,
              subCategory: {
                include: {
                  category: true
                }
              },
              sections: {
                include: {
                  sectionImages: true,
                  sectionTexts: true
                }
              },
              newsInteractions: {
                include: {
                  likes: true,
                  bookmarks: true,
                  comments: true
                }
              }
            }
          },
          userInteractions: {
            include: {
              likes: true,
              collections: true,
              comments: true
            }
          }
        }
      })

      if (!userWithRelations) {
        throw new Error('User not found')
      }

      const userInteraction = await prisma.userInteraction.findFirst({
        where: { userId: userWithRelations.id },
      })

      if (!userInteraction) {
        throw new Error('User interaction not found')
      }

      const collection = await prisma.collection.create({
        data: {
          ...validation.data,
          userInteractionId: userInteraction.id
        },
        include: {
          userInteraction: {
            include: {
              user: {
                include: {
                  news: {
                    include: {
                      user: true,
                      subCategory: {
                        include: {
                          category: true
                        }
                      },
                      sections: {
                        include: {
                          sectionImages: true,
                          sectionTexts: true
                        }
                      },
                      newsInteractions: {
                        include: {
                          likes: true,
                          bookmarks: true,
                          comments: true
                        }
                      }
                    }
                  },
                  userInteractions: {
                    include: {
                      likes: true,
                      collections: true,
                      comments: true
                    }
                  }
                }
              },
              likes: true,
              collections: true,
              comments: true
            }
          },
          bookmarks: {
            include: {
              newsInteraction: {
                include: {
                  news: {
                    include: {
                      user: true,
                      subCategory: {
                        include: {
                          category: true
                        }
                      },
                      sections: {
                        include: {
                          sectionImages: true,
                          sectionTexts: true
                        }
                      },
                      newsInteractions: true
                    }
                  }
                }
              },
              collection: true
            }
          }
        }
      })

      revalidatePath('/collections')
      return collection
    } catch (error) {
      console.error('[CREATE_COLLECTION]', error)
      if (error instanceof Error) {
        throw new Error(error.message)
      }
      throw new Error('Failed to create collection')
    }
  }

  export async function deleteCollection(id: string) {
    try {
      const user = await getCurrentUserData()
      if (!user) {
        throw new Error('Unauthorized')
      }

      // Get the collection with its userInteraction
      const collection = await prisma.collection.findFirst({
        where: { id },
        include: {
          userInteraction: true,
          bookmarks: true,
        },
      })

      if (!collection) {
        throw new Error('Collection not found')
      }

      // Verify ownership through userInteraction
      const userInteraction = await prisma.userInteraction.findFirst({
        where: { userId: user.id },
      })

      if (collection.userInteractionId !== userInteraction?.id) {
        throw new Error('Unauthorized')
      }

      // Start a transaction to handle both deletion and score updates
      await prisma.$transaction(async (tx) => {
        // Calculate score reduction (1 point per bookmark)
        const scoreReduction = collection.bookmarks.length

        // Delete the collection (cascade will handle bookmarks)
        await tx.collection.delete({
          where: { id }
        })

        // Update user's contribution score
        await tx.userInteraction.update({
          where: { id: collection.userInteractionId },
          data: {
            contributionScore: {
              decrement: scoreReduction
            }
          }
        })
      })

      revalidatePath('/collections')
      return { success: true }
    } catch (error) {
      console.error('[DELETE_COLLECTION]', error)
      throw error
    }
  }

  const EditCollectionSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
    description: z.string().min(1, 'Description is required').max(200, 'Description is too long')
  })

  export async function editCollection(id: string, data: z.infer<typeof EditCollectionSchema>) {
    try {
      const validation = EditCollectionSchema.safeParse(data)
      if (!validation.success) {
        throw new Error(validation.error.errors[0].message)
      }

      const user = await getCurrentUserData()
      if (!user) {
        throw new Error('Unauthorized')
      }

      // Verify ownership
      const userInteraction = await prisma.userInteraction.findFirst({
        where: { userId: user.id }
      })

      const collection = await prisma.collection.findFirst({
        where: { id },
        include: {
          userInteraction: true
        }
      })

      if (!collection || collection.userInteractionId !== userInteraction?.id) {
        throw new Error('Unauthorized')
      }

      // Update collection
      await prisma.collection.update({
        where: { id },
        data: validation.data
      })

      revalidatePath('/collections')
      return { success: true }
    } catch (error) {
      console.error('[EDIT_COLLECTION]', error)
      throw error
    }
  }
