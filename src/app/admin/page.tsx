import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpIcon, ArrowDownIcon, User2, Info, ActivityIcon } from 'lucide-react';
import { getDashboardData } from '@/actions/dashboard';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Prisma } from '@prisma/client';
import { ErrorRefreshButton, RefreshButton } from '@/components/refresh-button';

type DashboardData = {
    title: string;
    value: string;
    trend: number;
    icon: React.ReactNode;
};

const hasMetadata = (metadata: Prisma.JsonValue): boolean => {
    return typeof metadata === 'object' &&
           metadata !== null &&
           !Array.isArray(metadata) &&
           Object.keys(metadata as object).length > 0;
};

export default async function Page() {
    const data = await getDashboardData().catch(() => null);

    if (!data) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 pt-16 px-4">
                <div className="max-w-7xl mx-auto space-y-4">
                    <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
                    <Card className="p-6">
                        <div className="flex flex-col items-center justify-center space-y-4 py-12">
                            <ActivityIcon className="w-12 h-12 text-muted-foreground animate-pulse" />
                            <p className="text-lg text-muted-foreground">Failed to load dashboard data. Please try again later.</p>
                            <ErrorRefreshButton />
                        </div>
                    </Card>
                </div>
            </div>
        );
    }

    const dashboardData: DashboardData[] = [
        {
            title: 'Total Artikel',
            value: data.metrics.totalNews.value,
            trend: data.metrics.totalNews.trend,
            icon: <ActivityIcon className="w-4 h-4 md:w-5 md:h-5 text-blue-500" />
        },
        {
            title: 'Artikel Aktif',
            value: data.metrics.activeNews.value,
            trend: data.metrics.activeNews.trend,
            icon: <ActivityIcon className="w-4 h-4 md:w-5 md:h-5 text-green-500" />
        },
        {
            title: 'Total Pembaca',
            value: parseInt(data.metrics.totalReaders.value).toLocaleString(),
            trend: data.metrics.totalReaders.trend,
            icon: <User2 className="w-4 h-4 md:w-5 md:h-5 text-purple-500" />
        },
        {
            title: 'Komentar Baru',
            value: data.metrics.newComments.value,
            trend: data.metrics.newComments.trend,
            icon: <ActivityIcon className="w-4 h-4 md:w-5 md:h-5 text-orange-500" />
        },
    ];

    return (
        <div className="min-h-screen pt-16 px-4">
            <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
                    <RefreshButton />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {dashboardData.map((item, index) => (
                        <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
                                <CardTitle className="text-sm md:text-base font-medium flex items-center gap-2">
                                    {item.icon}
                                    {item.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 pt-2">
                                <div className="flex flex-col space-y-2">
                                    <div className="text-2xl md:text-3xl font-bold">
                                        {item.value}
                                    </div>
                                    <span
                                        className={`inline-flex items-center text-xs md:text-sm font-medium ${
                                            item.trend >= 0
                                                ? 'text-green-600 dark:text-green-400'
                                                : 'text-red-600 dark:text-red-400'
                                        }`}
                                    >
                                        {item.trend >= 0 ? (
                                            <ArrowUpIcon className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                                        ) : (
                                            <ArrowDownIcon className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                                        )}
                                        {Math.abs(item.trend).toFixed(1)}%
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200">
                    <CardHeader className="p-4 md:p-6 border-b bg-muted/50">
                        <CardTitle className="text-lg md:text-xl flex items-center gap-2">
                            <ActivityIcon className="w-5 h-5 md:w-6 md:h-6" />
                            Recent Activities
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                            <div className="hidden md:grid md:grid-cols-4 py-3 px-6 text-sm font-medium text-muted-foreground bg-muted/30">
                                <div>User</div>
                                <div>Activity</div>
                                <div>Date</div>
                                <div>Details</div>
                            </div>
                            {data.activities.map((activity) => (
                                <div
                                    key={activity.id}
                                    className="p-4 md:p-6 text-sm space-y-2 md:space-y-0 md:grid md:grid-cols-4 md:items-center hover:bg-muted/30 transition-colors duration-200"
                                >
                                    <div className="flex items-center space-x-3">
                                        <Avatar className="h-8 w-8 ring-2 ring-background">
                                            {activity.user.imageUrl ? (
                                                <AvatarImage
                                                    src={activity.user.imageUrl}
                                                    alt={`${activity.user.firstName} ${activity.user.lastName}`}
                                                />
                                            ) : (
                                                <AvatarFallback className="bg-primary/10">
                                                    <User2 className="h-4 w-4" />
                                                </AvatarFallback>
                                            )}
                                        </Avatar>
                                        <span className="font-medium">
                                            {activity.user.firstName && activity.user.lastName
                                                ? `${activity.user.firstName} ${activity.user.lastName}`
                                                : 'Anonymous User'}
                                        </span>
                                    </div>
                                    <div className="text-muted-foreground">
                                        {activity.activity}
                                    </div>
                                    <div className="text-muted-foreground text-xs md:text-sm">
                                        {new Date(activity.date).toLocaleDateString('id-ID', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </div>
                                    <div>
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="hover:bg-primary/10 transition-colors duration-200"
                                                >
                                                    <Info className="h-4 w-4" />
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="sm:max-w-lg">
                                                <DialogHeader>
                                                    <DialogTitle className="flex items-center gap-2">
                                                        <ActivityIcon className="w-5 h-5" />
                                                        {activity.activity}
                                                    </DialogTitle>
                                                    <DialogDescription>
                                                        {new Date(activity.date).toLocaleString('id-ID', {
                                                            weekday: 'long',
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        })}
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <div className="space-y-4">
                                                    <div className="bg-muted/50 p-4 rounded-lg">
                                                        <h4 className="text-sm font-medium mb-2">Description</h4>
                                                        <p className="text-sm text-muted-foreground">
                                                            {activity.description}
                                                        </p>
                                                    </div>
                                                    {hasMetadata(activity.metadata) && (
                                                        <div className="bg-muted/50 p-4 rounded-lg">
                                                            <h4 className="text-sm font-medium mb-2">Metadata</h4>
                                                            <pre className="text-sm bg-background/50 p-4 rounded-lg overflow-auto">
                                                                {JSON.stringify(activity.metadata, null, 2)}
                                                            </pre>
                                                        </div>
                                                    )}
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
