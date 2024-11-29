'use server';

import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { User, UserInteraction } from '@prisma/client';
import { clerkClient } from '@/lib/clerk';
import type { User as ClerkUser } from '@clerk/nextjs/server';

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

        // Add null check
        if (!user) return null;

        return {
            firstName: user.firstName || null,
            lastName: user.lastName || null,
            imageUrl: user.imageUrl || null,
            email: user.emailAddresses[0]?.emailAddress || null,
        };
    } catch (error) {
        // Enhanced error logging to handle different types of errors
        if (error instanceof Error) {
            // Log Error message and stack if it's a standard Error object
            console.error('[GET_CLERK_USER] Error details:', {
                clerkId,
                message: error.message,
                stack: error.stack,
            });
        } else {
            // Handle non-Error objects by converting them to a string
            console.error('[GET_CLERK_USER] Error details:', {
                clerkId,
                error: String(error),
            });
        }

        // Return null instead of throwing
        return null;
    }
}


// Get all users with filters
export async function getUsers(role: string = 'all', search: string = '') {
    try {
        // First get all users matching the role filter
        const users = await prisma.user.findMany({
            where: {
                ...(role !== 'all' ? { role } : {}),
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

        // Get all Clerk users that match the search term
        let clerkUsers: ClerkUser[] = [];
        if (search) {
            try {
                const response = await clerkClient.users.getUserList({
                    query: search,
                });
                clerkUsers = response.data;
            } catch (error) {
                console.error('[GET_CLERK_USERS]', error);
            }
        }

        // Create a Set of matching Clerk IDs for efficient lookup
        const matchingClerkIds = new Set(clerkUsers.map(user => user.id));

        // Fetch and enrich user data
        const enrichedUsers = await Promise.all(
            users.map(async (user) => {
                const clerkUser = await getClerkUser(user.clerkId);
                return {
                    ...user,
                    profile: clerkUser,
                    contributionScore: user.userInteractions[0]?.contributionScore || 0,
                    totalNews: user.news.length,
                };
            })
        );

        // Filter users based on search if provided
        if (search && search.trim()) {
            const searchLower = search.toLowerCase().trim();
            return enrichedUsers.filter((user) => {
                // Include user if their Clerk ID matches from the earlier search
                if (user.clerkId && matchingClerkIds.has(user.clerkId)) {
                    return true;
                }

                // Or if their profile data matches the search term
                const firstName = user.profile?.firstName?.toLowerCase() || '';
                const lastName = user.profile?.lastName?.toLowerCase() || '';
                const email = user.profile?.email?.toLowerCase() || '';
                const fullName = `${firstName} ${lastName}`.trim();

                return (
                    firstName.includes(searchLower) ||
                    lastName.includes(searchLower) ||
                    fullName.includes(searchLower) ||
                    email.includes(searchLower)
                );
            });
        }

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
