import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        // Verify the request is from the cron job
        const authHeader = request.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET_KEY}`) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        // Delete logs older than 90 days
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

        const deleteResult = await prisma.log.deleteMany({
            where: {
                createdAt: {
                    lt: ninetyDaysAgo
                }
            }
        });

        return NextResponse.json({
            success: true,
            deletedCount: deleteResult.count
        });
    } catch (error) {
        console.error('Failed to cleanup logs:', error);
        return NextResponse.json(
            { error: 'Failed to cleanup logs' },
            { status: 500 }
        );
    }
}
