'use server';

import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { User, UserInteraction } from '@prisma/client';
import { clerkClient } from '@/lib/clerk';

// Types
type UserBasic = Pick<
    User,
    'id' | 'clerkId' | 'role' | 'createdAt' | 'updatedAt'
>;
type UserWithInteractions = User & {
    userInteractions: UserInteraction[];
};

// Get basic user data (untuk navbar, auth checks, etc)
export async function getCurrentUserData(): Promise<UserBasic | null> {
    try {
        const { userId } = await auth();

        if (!userId) {
            return null;
        }

        const user = await prisma.user.findFirst({
            where: {
                clerkId: userId,
            },
            select: {
                id: true,
                clerkId: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return user;
    } catch (error) {
        console.error('[GET_CURRENT_USER]', error);
        return null;
    }
}

// Get full user data with interactions (untuk profile, settings, etc)
export async function getCurrentUserWithInteractions(): Promise<UserWithInteractions | null> {
    try {
        const { userId } = await auth();

        if (!userId) {
            return null;
        }

        const user = await prisma.user.findFirst({
            where: {
                clerkId: userId,
            },
            include: {
                userInteractions: true,
            },
        });

        return user;
    } catch (error) {
        console.error('[GET_CURRENT_USER_WITH_INTERACTIONS]', error);
        return null;
    }
}

export async function getClerkUser(clerkId: string | null) {
    if (!clerkId) return null;

    try {
        const user = await clerkClient.users.getUser(clerkId);

        return {
            firstName: user.firstName,
            lastName: user.lastName,
            imageUrl: user.imageUrl,
            email: user.emailAddresses[0]?.emailAddress,
        };
    } catch (error) {
        console.error('[GET_CLERK_USER]', error);
        return null;
    }
}

// Get all users with filters
export async function getUsers(role: string = 'all', search: string = '') {
    try {
        const users = await prisma.user.findMany({
            where: {
                ...(role !== 'all' ? { role } : {}),
                ...(search
                    ? {
                          clerkId: { contains: search, mode: 'insensitive' },
                      }
                    : {}),
            },
            include: {
                userInteractions: true,
                news: {
                    select: {
                        id: true,
                    },
                },
            },
        });

        // Fetch Clerk user data for each user
        const enrichedUsers = await Promise.all(
            users.map(async (user) => {
                const clerkUser = await getClerkUser(user.clerkId);
                return {
                    ...user,
                    profile: clerkUser,
                    contributionScore:
                        user.userInteractions[0]?.contributionScore || 0,
                    totalNews: user.news.length,
                };
            })
        );

        return enrichedUsers;
    } catch (error) {
        console.error('[GET_USERS]', error);
        return [];
    }
}

// Update user role
export async function updateUserRole(userId: string, newRole: string) {
    try {
        const { userId: currentUserId } = await auth();
        const currentUser = await prisma.user.findFirst({
            where: { clerkId: currentUserId },
        });

        if (!currentUser || currentUser.role !== 'admin') {
            throw new Error('Unauthorized');
        }

        return await prisma.user.update({
            where: { id: userId },
            data: { role: newRole },
        });
    } catch (error) {
        console.error('[UPDATE_USER_ROLE]', error);
        throw error;
    }
}

// Delete user
export async function deleteUser(userId: string) {
    try {
        const { userId: currentUserId } = await auth();
        const currentUser = await prisma.user.findFirst({
            where: { clerkId: currentUserId },
        });

        if (!currentUser || currentUser.role !== 'admin') {
            throw new Error('Unauthorized');
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (user?.clerkId) {
            await clerkClient.users.deleteUser(user.clerkId);
        }

        return await prisma.user.delete({
            where: { id: userId },
        });
    } catch (error) {
        console.error('[DELETE_USER]', error);
        throw error;
    }
}
