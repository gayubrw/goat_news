'use server'

import { prisma } from '@/lib/prisma';
import { clerkClient } from '@/lib/clerk';

type DashboardData = {
    metrics: {
        totalNews: {
            value: string;
            trend: number;
        };
        activeNews: {
            value: string;
            trend: number;
        };
        totalReaders: {
            value: string;
            trend: number;
        };
        newComments: {
            value: string;
            trend: number;
        };
    };
    activities: {
        id: string;
        user: string;
        activity: string;
        date: string;
    }[];
};

export async function getDashboardData(): Promise<DashboardData> {
    try {
        const totalNews = await prisma.news.count();
        const activeNews = await prisma.newsInteraction.count({
            where: {
                updatedAt: {
                    gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                },
            },
        });

        const readersData = await prisma.newsInteraction.aggregate({
            _sum: {
                popularityScore: true,
            },
        });
        const totalReaders = readersData._sum.popularityScore || 0;

        const newComments = await prisma.comment.count({
            where: {
                createdAt: {
                    gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
                },
            },
        });

        const recentActivities = await prisma.$transaction(async (tx) => {
            const newsActivities = await tx.news.findMany({
                select: {
                    id: true,
                    title: true,
                    createdAt: true,
                    user: {
                        select: {
                            id: true,
                            clerkId: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
                take: 5,
            });

            const commentActivities = await tx.comment.findMany({
                select: {
                    id: true,
                    createdAt: true,
                    userInteraction: {
                        select: {
                            user: {
                                select: {
                                    id: true,
                                    clerkId: true,
                                },
                            },
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
                take: 5,
            });

            const clerkIds = new Set(
                [
                    ...newsActivities.map((news) => news.user.clerkId),
                    ...commentActivities.map(
                        (comment) => comment.userInteraction.user.clerkId
                    ),
                ].filter((id): id is string => id !== null)
            );

            const userDetails = new Map<string, string>();
            if (clerkIds.size > 0) {
                const usersResponse = await clerkClient.users.getUserList({
                    userId: Array.from(clerkIds),
                });

                for (const user of usersResponse.data) {
                    userDetails.set(
                        user.id,
                        user.firstName && user.lastName
                            ? `${user.firstName} ${user.lastName}`
                            : user.username || 'Anonymous'
                    );
                }
            }

            return [
                ...newsActivities.map((news) => ({
                    id: news.id,
                    user: news.user.clerkId
                        ? userDetails.get(news.user.clerkId) || 'Anonymous'
                        : 'Anonymous',
                    activity: 'Memposting artikel baru',
                    date: news.createdAt.toISOString(),
                })),
                ...commentActivities.map((comment) => ({
                    id: comment.id,
                    user: comment.userInteraction.user.clerkId
                        ? userDetails.get(
                              comment.userInteraction.user.clerkId
                          ) || 'Anonymous'
                        : 'Anonymous',
                    activity: 'Menambahkan komentar',
                    date: comment.createdAt.toISOString(),
                })),
            ]
                .sort(
                    (a, b) =>
                        new Date(b.date).getTime() - new Date(a.date).getTime()
                )
                .slice(0, 5);
        });

        const previousPeriodComments = await prisma.comment.count({
            where: {
                createdAt: {
                    gte: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                    lt: new Date(Date.now() - 24 * 60 * 60 * 1000),
                },
            },
        });

        const commentsTrend =
            previousPeriodComments === 0
                ? 0
                : ((newComments - previousPeriodComments) /
                      previousPeriodComments) *
                  100;

        return {
            metrics: {
                totalNews: {
                    value: totalNews.toString(),
                    trend: 0,
                },
                activeNews: {
                    value: activeNews.toString(),
                    trend: 0,
                },
                totalReaders: {
                    value: totalReaders.toString(),
                    trend: 0,
                },
                newComments: {
                    value: newComments.toString(),
                    trend: commentsTrend,
                },
            },
            activities: recentActivities,
        };
    } catch (error) {
        console.error('Dashboard error:', error);
        throw new Error('Failed to fetch dashboard data');
    }
}
