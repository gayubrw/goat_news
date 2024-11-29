import { PrismaClient, Prisma } from '@prisma/client';

// Action types for user-related activities
export const USER_ACTIONS = {
  USER_CREATED: 'user.created',
  USER_UPDATED: 'user.updated',
  USER_ROLE_CHANGED: 'user.role.changed',
  USER_DELETED: 'user.deleted'  // Added USER_DELETED action
} as const;

// Action types for news-related activities
export const NEWS_ACTIONS = {
  NEWS_CREATED: 'news.created',
  NEWS_UPDATED: 'news.updated',
  NEWS_DELETED: 'news.deleted',
  SECTION_ADDED: 'news.section.added',
  SECTION_UPDATED: 'news.section.updated',
  SECTION_DELETED: 'news.section.deleted',
  SECTION_REORDERED: 'news.section.reordered'
} as const;

// Action types for interaction-related activities
export const INTERACTION_ACTIONS = {
  NEWS_LIKED: 'interaction.news.liked',
  NEWS_UNLIKED: 'interaction.news.unliked',
  NEWS_BOOKMARKED: 'interaction.news.bookmarked',
  NEWS_UNBOOKMARKED: 'interaction.news.unbookmarked',
  COMMENT_ADDED: 'interaction.comment.added',
  COMMENT_UPDATED: 'interaction.comment.updated',
  COMMENT_DELETED: 'interaction.comment.deleted'
} as const;

// Action types for collection-related activities
export const COLLECTION_ACTIONS = {
  COLLECTION_CREATED: 'collection.created',
  COLLECTION_UPDATED: 'collection.updated',
  COLLECTION_DELETED: 'collection.deleted',
  NEWS_ADDED_TO_COLLECTION: 'collection.news.added',
  NEWS_REMOVED_FROM_COLLECTION: 'collection.news.removed'
} as const;

// Action types for category-related activities
export const CATEGORY_ACTIONS = {
  CATEGORY_CREATED: 'category.created',
  CATEGORY_UPDATED: 'category.updated',
  CATEGORY_DELETED: 'category.deleted',
  SUBCATEGORY_CREATED: 'subcategory.created',
  SUBCATEGORY_UPDATED: 'subcategory.updated',
  SUBCATEGORY_DELETED: 'subcategory.deleted'
} as const;

// Combine all actions into a single type
export const LOG_ACTIONS = {
  ...USER_ACTIONS,
  ...NEWS_ACTIONS,
  ...INTERACTION_ACTIONS,
  ...COLLECTION_ACTIONS,
  ...CATEGORY_ACTIONS
} as const;

// Create a type from all possible action values
export type LogAction = typeof LOG_ACTIONS[keyof typeof LOG_ACTIONS];

// Helper types for server actions
export type GetLogsParams = {
  userId?: string;
  action?: LogAction | LogAction[];
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
  orderBy?: 'asc' | 'desc';
};

export type LogWithUser = {
  id: string;
  userId: string;
  action: LogAction;
  description: string;
  metadata: Prisma.JsonValue;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    clerkId: string | null;
    role: string | null;
  };
};

export type LogCategory = 'user' | 'news' | 'interaction' | 'collection' | 'category';

// Helper interface for create log
export interface CreateLogParams {
  userId: string;
  action: LogAction;
  description: string;
  metadata?: Prisma.InputJsonValue;
}

type PrismaTransactionClient = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

const prisma = new PrismaClient();

// Create log helper function
export const createLog = async (
  prismaClient: PrismaClient | PrismaTransactionClient,
  { userId, action, description, metadata = {} }: CreateLogParams
) => {
  return prismaClient.log.create({
    data: {
      userId,
      action,
      description,
      metadata
    }
  });
};

// Server Actions
export async function getLogs({
  userId,
  action,
  startDate,
  endDate,
  page = 1,
  limit = 10,
  orderBy = 'desc'
}: GetLogsParams = {}): Promise<{
  logs: LogWithUser[];
  total: number;
  pages: number;
}> {
  try {
    const where = {
      ...(userId && { userId }),
      ...(action && {
        action: Array.isArray(action) ? { in: action } : action
      }),
      ...(startDate || endDate
        ? {
            createdAt: {
              ...(startDate && { gte: startDate }),
              ...(endDate && { lte: endDate })
            }
          }
        : {})
    };

    const total = await prisma.log.count({ where });
    const pages = Math.ceil(total / limit);

    const logs = await prisma.log.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            clerkId: true,
            role: true
          }
        }
      },
      orderBy: {
        createdAt: orderBy
      },
      skip: (page - 1) * limit,
      take: limit
    });

    return {
      logs: logs.map(log => ({
        ...log,
        action: log.action as LogAction,
        metadata: log.metadata as Prisma.JsonValue
      })) satisfies LogWithUser[],
      total,
      pages
    };
  } catch (error) {
    console.error('Error fetching logs:', error);
    throw new Error('Failed to fetch logs');
  }
}

export async function getLogById(id: string): Promise<LogWithUser | null> {
  try {
    const log = await prisma.log.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            clerkId: true,
            role: true
          }
        }
      }
    });

    if (!log) return null;

    return {
      ...log,
      action: log.action as LogAction,
      metadata: log.metadata as Prisma.JsonValue
    } satisfies LogWithUser;
  } catch (error) {
    console.error('Error fetching log:', error);
    throw new Error('Failed to fetch log');
  }
}

export async function getLogsByCategory(category: LogCategory): Promise<LogWithUser[]> {
  try {
    let actions: LogAction[] = [];

    switch (category) {
      case 'user':
        actions = Object.values(LOG_ACTIONS).filter(action => action.startsWith('user.'));
        break;
      case 'news':
        actions = Object.values(LOG_ACTIONS).filter(action => action.startsWith('news.'));
        break;
      case 'interaction':
        actions = Object.values(LOG_ACTIONS).filter(action => action.startsWith('interaction.'));
        break;
      case 'collection':
        actions = Object.values(LOG_ACTIONS).filter(action => action.startsWith('collection.'));
        break;
      case 'category':
        actions = Object.values(LOG_ACTIONS).filter(action =>
          action.startsWith('category.') || action.startsWith('subcategory.')
        );
        break;
    }

    const logs = await prisma.log.findMany({
      where: {
        action: {
          in: actions
        }
      },
      include: {
        user: {
          select: {
            id: true,
            clerkId: true,
            role: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return logs.map(log => ({
      ...log,
      action: log.action as LogAction,
      metadata: log.metadata as Prisma.JsonValue
    })) satisfies LogWithUser[];
  } catch (error) {
    console.error('Error fetching logs by category:', error);
    throw new Error('Failed to fetch logs by category');
  }
}

export async function getUserLogs(userId: string, category?: LogCategory): Promise<LogWithUser[]> {
  try {
    let actions: LogAction[] | undefined;

    if (category) {
      switch (category) {
        case 'user':
          actions = Object.values(LOG_ACTIONS).filter(action => action.startsWith('user.'));
          break;
        case 'news':
          actions = Object.values(LOG_ACTIONS).filter(action => action.startsWith('news.'));
          break;
        case 'interaction':
          actions = Object.values(LOG_ACTIONS).filter(action => action.startsWith('interaction.'));
          break;
        case 'collection':
          actions = Object.values(LOG_ACTIONS).filter(action => action.startsWith('collection.'));
          break;
        case 'category':
          actions = Object.values(LOG_ACTIONS).filter(action =>
            action.startsWith('category.') || action.startsWith('subcategory.')
          );
          break;
      }
    }

    const logs = await prisma.log.findMany({
      where: {
        userId,
        ...(actions && {
          action: {
            in: actions
          }
        })
      },
      include: {
        user: {
          select: {
            id: true,
            clerkId: true,
            role: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return logs.map(log => ({
      ...log,
      action: log.action as LogAction,
      metadata: log.metadata as Prisma.JsonValue
    })) satisfies LogWithUser[];
  } catch (error) {
    console.error('Error fetching user logs:', error);
    throw new Error('Failed to fetch user logs');
  }
}
