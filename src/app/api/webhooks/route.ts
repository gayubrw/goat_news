import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

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
    // Create a new user in the database
    await prisma.user.create({
      data: {
        clerkId: evt.data.id,
        // Set role based on email domain or other criteria if needed
        role: 'user',
      },
    });

    // Also create UserInteraction record for the new user
    const user = await prisma.user.findUnique({
      where: { clerkId: evt.data.id }
    });

    if (user) {
      await prisma.userInteraction.create({
        data: {
          userId: user.id,
          contributionScore: 0,
        },
      });
    }
  }

  if (eventType === 'user.deleted') {
    // Delete user from database when deleted in Clerk
    await prisma.user.delete({
      where: { clerkId: evt.data.id }
    });
  }

  return new Response('', { status: 200 });
}
