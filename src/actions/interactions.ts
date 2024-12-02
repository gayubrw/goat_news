'use server'

import { clerkClient } from '@/lib/clerk';
import { prisma } from '@/lib/prisma';
import { startOfDay, subDays, subMonths, startOfYear } from 'date-fns';

interface DailyStats {
    date: string;
    likes: string | number;
    comments: string | number;
    bookmarks: string | number;
}

interface UserBasicInfo {
    firstName: string | null;
    lastName: string | null;
    imageUrl: string | null;
}

interface InteractionsData {
    dailyStats: DailyStats[];
    userInteractions: {
        userId: string;
        userName: string;
        profile: UserBasicInfo | null;
        contributionScore: number;
        likes: number;
        comments: number;
        bookmarks: number;
    }[];
    newsInteractions: {
        newsId: string;
        title: string;
        popularityScore: number;
        likes: number;
        comments: number;
        bookmarks: number;
    }[];
}

function getDateFilter(dateRange: string): Date {
  const now = new Date();
  switch (dateRange) {
    case 'today': return startOfDay(now);
    case 'week': return subDays(now, 7);
    case 'month': return subMonths(now, 1);
    case 'year': return startOfYear(now);
    default: return subDays(now, 7);
  }
}

export async function getInteractionsData(dateRange: string = 'week'): Promise<InteractionsData> {
  const dateFilter = getDateFilter(dateRange);
  
  const dailyStats = await prisma.$queryRaw<DailyStats[]>`
    SELECT 
      DATE(ni.created_at)::text as date,
      CAST(COUNT(DISTINCT l.id) as INTEGER) as likes,
      CAST(COUNT(DISTINCT c.id) as INTEGER) as comments,
      CAST(COUNT(DISTINCT b.id) as INTEGER) as bookmarks
    FROM news_interactions ni
    LEFT JOIN likes l ON ni.id = l.news_interaction_id
    LEFT JOIN comments c ON ni.id = c.news_interaction_id
    LEFT JOIN bookmarks b ON ni.id = b.news_interaction_id
    WHERE ni.created_at >= ${dateFilter}
    GROUP BY DATE(ni.created_at)
    ORDER BY date DESC
  `;

  const userInteractions = await prisma.userInteraction.findMany({
    where: { createdAt: { gte: dateFilter } },
    select: {
      id: true,
      user: {
        select: {
          id: true,
          clerkId: true,
        }
      },
      contributionScore: true,
      likes: { select: { id: true } },
      comments: { select: { id: true } },
      collections: { select: { bookmarks: true } }
    },
    orderBy: { contributionScore: 'desc' },
    take: 10
  });

  // Fetch Clerk user data for each user
  const enrichedUserInteractions = await Promise.all(
    userInteractions.map(async (ui) => {
      const clerkUser = await getClerkUser(ui.user.clerkId);
      return {
        userId: ui.user.id,
        userName: clerkUser ? `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() : 'Anonymous',
        profile: clerkUser ? {
          firstName: clerkUser.firstName,
          lastName: clerkUser.lastName,
          imageUrl: clerkUser.imageUrl,
        } : null,
        contributionScore: ui.contributionScore,
        likes: ui.likes.length,
        comments: ui.comments.length,
        bookmarks: ui.collections.reduce((acc, col) => acc + col.bookmarks.length, 0)
      };
    })
  );

  const newsInteractions = await prisma.newsInteraction.findMany({
    where: { createdAt: { gte: dateFilter } },
    select: {
      id: true,
      news: { select: { id: true, title: true } },
      popularityScore: true,
      likes: { select: { id: true } },
      comments: { select: { id: true } },
      bookmarks: { select: { id: true } }
    },
    orderBy: { popularityScore: 'desc' },
    take: 10
  });

  return {
    dailyStats: dailyStats.map(stat => ({
      ...stat,
      likes: Number(stat.likes),
      comments: Number(stat.comments),
      bookmarks: Number(stat.bookmarks)
    })),
    userInteractions: enrichedUserInteractions,
    newsInteractions: newsInteractions.map(ni => ({
      newsId: ni.news.id,
      title: ni.news.title,
      popularityScore: ni.popularityScore,
      likes: ni.likes.length,
      comments: ni.comments.length,
      bookmarks: ni.bookmarks.length
    }))
  };
}

async function getClerkUser(clerkId: string | null) {
  if (!clerkId) return null;

  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const user = await Promise.race([
        clerkClient.users.getUser(clerkId),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Request timeout')), 5000)
        )
      ]) as Awaited<ReturnType<typeof clerkClient.users.getUser>>;

      if (!user) return null;

      return {
        firstName: user.firstName || null,
        lastName: user.lastName || null,
        imageUrl: user.imageUrl || null
      };
    } catch {
      const isLastAttempt = attempt === MAX_RETRIES;
      if (isLastAttempt) return null;
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
    }
  }

  return null;
}