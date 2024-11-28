'use server'

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { User, UserInteraction } from "@prisma/client";
import { clerkClient } from "@/lib/clerk";

// Types
type UserBasic = Pick<User, 'id' | 'clerkId' | 'role' | 'createdAt' | 'updatedAt'>;
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
    console.error("[GET_CURRENT_USER]", error);
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
        clerkId: userId
      },
      include: {
        userInteractions: true
      }
    });

    return user;
  } catch (error) {
    console.error("[GET_CURRENT_USER_WITH_INTERACTIONS]", error);
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
        email: user.emailAddresses[0]?.emailAddress
      };
    } catch (error) {
      console.error("[GET_CLERK_USER]", error);
      return null;
    }
}
