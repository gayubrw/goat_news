'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, Bookmark, MessageSquare, Search, Filter } from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line,
} from 'recharts';

interface DailyStats {
    date: string;
    likes: number;
    comments: number;
    bookmarks: number;
}

interface UserInteraction {
    userId: string;
    userName: string;
    contributionScore: number;
    likes: number;
    comments: number;
    bookmarks: number;
}

interface NewsInteraction {
    newsId: string;
    title: string;
    popularityScore: number;
    likes: number;
    comments: number;
    bookmarks: number;
}

const InteractionsPage = () => {
    const [dateRange, setDateRange] = useState('week');
    const [searchTerm, setSearchTerm] = useState('');

    // Sample data
    const dailyStats: DailyStats[] = [
        { date: '2024-11-18', likes: 45, comments: 23, bookmarks: 12 },
        { date: '2024-11-19', likes: 52, comments: 28, bookmarks: 15 },
        { date: '2024-11-20', likes: 48, comments: 25, bookmarks: 18 },
        { date: '2024-11-21', likes: 70, comments: 35, bookmarks: 22 },
        { date: '2024-11-22', likes: 65, comments: 30, bookmarks: 20 },
        { date: '2024-11-23', likes: 58, comments: 27, bookmarks: 16 },
        { date: '2024-11-24', likes: 63, comments: 32, bookmarks: 19 },
    ];

    const userInteractions: UserInteraction[] = [
        {
            userId: '1',
            userName: 'John Doe',
            contributionScore: 85,
            likes: 32,
            comments: 15,
            bookmarks: 8,
        },
        {
            userId: '2',
            userName: 'Jane Smith',
            contributionScore: 92,
            likes: 45,
            comments: 28,
            bookmarks: 12,
        },
    ];

    const newsInteractions: NewsInteraction[] = [
        {
            newsId: '1',
            title: 'Breaking News: Important Event',
            popularityScore: 85,
            likes: 125,
            comments: 45,
            bookmarks: 30,
        },
        {
            newsId: '2',
            title: 'Technology Update 2024',
            popularityScore: 92,
            likes: 180,
            comments: 65,
            bookmarks: 42,
        },
    ];

    // Calculate total stats
    const totalStats = dailyStats.reduce(
        (acc, curr) => ({
            likes: acc.likes + curr.likes,
            comments: acc.comments + curr.comments,
            bookmarks: acc.bookmarks + curr.bookmarks,
        }),
        { likes: 0, comments: 0, bookmarks: 0 }
    );

    return (
        <div className="pt-16 space-y-6">
            {/* Header Section */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Analisis Interaksi</h1>
                <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Rentang Waktu" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="today">Hari Ini</SelectItem>
                        <SelectItem value="week">7 Hari Terakhir</SelectItem>
                        <SelectItem value="month">30 Hari Terakhir</SelectItem>
                        <SelectItem value="year">Tahun Ini</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Likes
                        </CardTitle>
                        <Heart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {totalStats.likes}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            +{dailyStats[dailyStats.length - 1].likes} hari ini
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Komentar
                        </CardTitle>
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {totalStats.comments}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            +{dailyStats[dailyStats.length - 1].comments} hari
                            ini
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Bookmark
                        </CardTitle>
                        <Bookmark className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {totalStats.bookmarks}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            +{dailyStats[dailyStats.length - 1].bookmarks} hari
                            ini
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="users">Interaksi Pengguna</TabsTrigger>
                    <TabsTrigger value="news">Interaksi Artikel</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Trend Interaksi</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={dailyStats}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="likes"
                                        stroke="#8884d8"
                                        name="Likes"
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="comments"
                                        stroke="#82ca9d"
                                        name="Komentar"
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="bookmarks"
                                        stroke="#ffc658"
                                        name="Bookmark"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Users Tab */}
                <TabsContent value="users" className="space-y-4">
                    <div className="flex gap-4 mb-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Cari pengguna..."
                                className="pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button
                            variant="outline"
                            className="flex items-center gap-2"
                        >
                            <Filter size={20} />
                            Filter
                        </Button>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Top Kontributor</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={userInteractions}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="userName" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar
                                        dataKey="likes"
                                        fill="#8884d8"
                                        name="Likes"
                                    />
                                    <Bar
                                        dataKey="comments"
                                        fill="#82ca9d"
                                        name="Komentar"
                                    />
                                    <Bar
                                        dataKey="bookmarks"
                                        fill="#ffc658"
                                        name="Bookmark"
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* News Tab */}
                <TabsContent value="news" className="space-y-4">
                    <div className="flex gap-4 mb-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Cari artikel..."
                                className="pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button
                            variant="outline"
                            className="flex items-center gap-2"
                        >
                            <Filter size={20} />
                            Filter
                        </Button>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Artikel Populer</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={newsInteractions}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="title" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar
                                        dataKey="likes"
                                        fill="#8884d8"
                                        name="Likes"
                                    />
                                    <Bar
                                        dataKey="comments"
                                        fill="#82ca9d"
                                        name="Komentar"
                                    />
                                    <Bar
                                        dataKey="bookmarks"
                                        fill="#ffc658"
                                        name="Bookmark"
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default InteractionsPage;
