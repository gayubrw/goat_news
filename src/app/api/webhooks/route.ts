import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { createLog, USER_ACTIONS } from '@/lib/log';

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");
  const SIGNING_SECRET = process.env.SIGNING_SECRET

  if (!SIGNING_SECRET) {
    throw new Error('Error: Please add SIGNING_SECRET from Clerk Dashboard to .env or .env.local')
  }

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your webhook secret
  const wh = new Webhook(process.env.SIGNING_SECRET || '');

  let evt: WebhookEvent;

  // Verify the webhook
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400
    });
  }

  // Handle the webhook
  const eventType = evt.type;

  if (eventType === 'user.created') {
    // Use prisma transaction to ensure both user creation and logging succeed or fail together
    await prisma.$transaction(async (tx) => {
      // Create a new user in the database
      const user = await tx.user.create({
        data: {
          clerkId: evt.data.id,
          role: 'user',
        },
      });

      // Create UserInteraction record
      await tx.userInteraction.create({
        data: {
          userId: user.id,
          contributionScore: 0,
        },
      });

      // Log the user creation
      await createLog(tx, {
        userId: user.id,
        action: USER_ACTIONS.USER_CREATED,
        description: `New user created with clerk ID: ${evt.data.id}`,
        metadata: {
          clerkId: evt.data.id,
          eventType,
          email: evt.data.email_addresses?.[0]?.email_address,
          firstName: evt.data.first_name,
          lastName: evt.data.last_name
        }
      });
    });
  }

  if (eventType === 'user.deleted') {
    // Find the user first to get their ID for logging
    const user = await prisma.user.findUnique({
      where: { clerkId: evt.data.id }
    });

    if (user) {
      await prisma.$transaction(async (tx) => {
        // Log the deletion with only the available information
        await createLog(tx, {
          userId: user.id,
          action: USER_ACTIONS.USER_DELETED,
          description: `User deleted with clerk ID: ${evt.data.id}`,
          metadata: {
            clerkId: evt.data.id,
            eventType
          }
        });

        // Delete the user
        await tx.user.delete({
          where: { clerkId: evt.data.id }
        });
      });
    }
  }

  return new Response('', { status: 200 });
}
