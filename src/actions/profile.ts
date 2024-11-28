'use server';

import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { clerkClient } from '@/lib/clerk';

export async function getCurrentUserProfile() {
    try {
        const { userId } = await auth();
        if (!userId) return null;

        const [user, clerkUser] = await Promise.all([
            prisma.user.findFirst({
                where: { clerkId: userId },
            }),
            clerkClient.users.getUser(userId),
        ]);

        return {
            ...user,
            profile: {
                firstName: clerkUser.firstName,
                lastName: clerkUser.lastName,
                imageUrl: clerkUser.imageUrl,
                email: clerkUser.emailAddresses[0]?.emailAddress,
            },
        };
    } catch (error) {
        console.error('[GET_PROFILE]', error);
        throw error;
    }
}

export async function updateProfile(data: {
    firstName?: string;
    lastName?: string;
    imageUrl?: string;
}) {
    try {
        const { userId } = await auth();
        if (!userId) throw new Error('Unauthorized');

        // Update Clerk user profile
        const clerkUpdateData: { firstName?: string; lastName?: string } = {};
        if (data.firstName !== undefined)
            clerkUpdateData.firstName = data.firstName;
        if (data.lastName !== undefined)
            clerkUpdateData.lastName = data.lastName;

        await clerkClient.users.updateUser(userId, clerkUpdateData);

        // Update local database
        await prisma.user.update({
            where: { clerkId: userId },
            data: {
                updatedAt: new Date(),
            },
        });

        return { success: true };
    } catch (error) {
        console.error('[UPDATE_PROFILE]', error);
        throw error;
    }
}

export async function deleteProfileImage() {
    try {
        const { userId } = await auth();
        if (!userId) throw new Error('Unauthorized');

        // Delete the profile image using Clerk's deleteProfileImage method
        await clerkClient.users.deleteUserProfileImage(userId);

        // Update local database
        await prisma.user.update({
            where: { clerkId: userId },
            data: {
                updatedAt: new Date(),
            },
        });

        return {
            success: true,
            message: 'Profile image deleted successfully',
        };
    } catch (error) {
        console.error('[DELETE_PROFILE_IMAGE]', error);
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to delete profile image',
        };
    }
}

export async function uploadImage(formData: FormData) {
    try {
        const { userId } = await auth();
        if (!userId) throw new Error('Unauthorized');

        const file = formData.get('file') as File;
        if (!file) throw new Error('No file provided');

        // Update user profile image using Clerk API
        const updatedUser = await clerkClient.users.updateUserProfileImage(
            userId,
            {
                file: file,
            }
        );

        return {
            success: true,
            url: updatedUser.imageUrl,
        };
    } catch (error) {
        console.error('[UPLOAD_IMAGE]', error);
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to upload image',
        };
    }
}
