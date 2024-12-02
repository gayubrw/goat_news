'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Search,
    Filter,
    Heart,
    ChartBar,
    Newspaper,
    Users,
    Eye,
    MoreVertical,
    XCircle,
    Loader2,
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { removeLike, getLikes } from '@/actions/like';
import { toast } from 'sonner';
import Link from 'next/link';

interface Like {
    id: string;
    createdAt: string;
    user: {
        id: string;
        name: string;
        image: string | null;
    };
    news: {
        id: string;
        title: string;
        popularityScore: number;
        path: string;
        thumbnailUrl: string | null;
    };
}

export default function LikesPage() {
    const [likes, setLikes] = useState<Like[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState('all');
    const [loading, setLoading] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);

    // Fetch likes data
    const fetchLikes = async () => {
        try {
            setLoading(true);
            const response = await getLikes();
            if (response) {
                setLikes(response.likes);
            }
        } catch (error) {
            console.error('Error fetching likes:', error);
            toast.error('Failed to fetch likes');
        } finally {
            setLoading(false);
            setIsInitialLoading(false);
        }
    };

    // Initial fetch
    useEffect(() => {
        fetchLikes();
    }, []);

    // Handle remove like
    const handleRemoveLike = async (newsId: string) => {
        try {
            setLoading(true);
            const result = await removeLike(newsId);

            if (result.success) {
                await fetchLikes(); // Refresh the likes data
                toast.success('Like removed successfully');
            }
        } catch (error) {
            console.error('Error removing like:', error);
            toast.error('Failed to remove like');
        } finally {
            setLoading(false);
        }
    };

    // Filter likes based on search term and date filter
    const filteredLikes = likes.filter(like => {
        const matchesSearch = searchTerm.toLowerCase() === '' ||
            like.news.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            like.user.name.toLowerCase().includes(searchTerm.toLowerCase());

        const likeDate = new Date(like.createdAt);
        const now = new Date();
        let matchesDate = true;

        switch (dateFilter) {
            case 'today':
                matchesDate = likeDate.toDateString() === now.toDateString();
                break;
            case 'week':
                const weekAgo = new Date(now.setDate(now.getDate() - 7));
                matchesDate = likeDate >= weekAgo;
                break;
            case 'month':
                const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
                matchesDate = likeDate >= monthAgo;
                break;
            default:
                matchesDate = true;
        }

        return matchesSearch && matchesDate;
    });

    // Stats calculation from filtered likes
    const stats = {
        totalLikes: filteredLikes.length,
        popularPosts: filteredLikes.filter((like) => like.news.popularityScore > 90).length,
        uniqueUsers: new Set(filteredLikes.map((like) => like.user.id)).size,
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((word) => word[0])
            .join('')
            .toUpperCase();
    };

    if (isInitialLoading) {
        return (
            <div className="pt-16 h-[50vh] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="pt-16 space-y-6 container">
            {/* Header Section */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-foreground">
                    Like Management
                </h1>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-border bg-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-foreground">
                            Total Likes
                        </CardTitle>
                        <Heart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">
                            {stats.totalLikes}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Total interactions
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-border bg-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-foreground">
                            Popular Articles
                        </CardTitle>
                        <ChartBar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">
                            {stats.popularPosts}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Popularity score &gt; 90
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-border bg-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-foreground">
                            Unique Users
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">
                            {stats.uniqueUsers}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Gave likes
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters Section */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search articles or users..."
                        className="pl-10 bg-muted border-input text-foreground placeholder:text-muted-foreground"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-4">
                    <Select value={dateFilter} onValueChange={setDateFilter}>
                        <SelectTrigger className="w-[180px] bg-muted border-input">
                            <SelectValue placeholder="Time Filter" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border">
                            <SelectItem value="all">All Time</SelectItem>
                            <SelectItem value="today">Today</SelectItem>
                            <SelectItem value="week">This Week</SelectItem>
                            <SelectItem value="month">This Month</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button
                        variant="outline"
                        className="inline-flex items-center gap-2 border-input text-muted-foreground hover:text-foreground"
                        onClick={() => {
                            setSearchTerm('');
                            setDateFilter('all');
                        }}
                    >
                        <Filter className="h-4 w-4" />
                        Reset
                    </Button>
                </div>
            </div>

            {/* Likes Table */}
            <div className="rounded-lg border border-border bg-card shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="border-border hover:bg-transparent">
                            <TableHead className="text-muted-foreground">User</TableHead>
                            <TableHead className="text-muted-foreground">Article</TableHead>
                            <TableHead className="text-muted-foreground">Date</TableHead>
                            <TableHead className="text-muted-foreground">Popularity</TableHead>
                            <TableHead className="text-right text-muted-foreground">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                                    <div className="flex items-center justify-center">
                                        <Loader2 className="h-6 w-6 animate-spin" />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : filteredLikes.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                                    No likes found
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredLikes.map((like) => (
                                <TableRow key={like.id} className="border-border hover:bg-muted/50">
                                    <TableCell className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarImage
                                                src={like.user.image || undefined}
                                                alt={like.user.name}
                                            />
                                            <AvatarFallback className="bg-muted text-muted-foreground">
                                                {getInitials(like.user.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium text-foreground">
                                                {like.user.name}
                                            </p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Newspaper className="h-4 w-4 text-muted-foreground" />
                                            <p className="text-sm text-muted-foreground line-clamp-1 hover:text-foreground">
                                                {like.news.title}
                                            </p>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {new Date(like.createdAt).toLocaleDateString('en-US', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                        })}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-muted-foreground">
                                                {like.news.popularityScore}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                                    disabled={loading}
                                                >
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent
                                                align="end"
                                                className="bg-popover border-border"
                                            >
                                                <Link href={`/news/${like.news.path}`}>
                                                    <DropdownMenuItem className="flex items-center gap-2 text-muted-foreground hover:text-foreground focus:text-foreground">
                                                        <Eye className="h-4 w-4" />
                                                        View Article
                                                    </DropdownMenuItem>
                                                </Link>
                                                <DropdownMenuItem
                                                    className="flex items-center gap-2 text-destructive hover:text-destructive focus:text-destructive"
                                                    onClick={() => handleRemoveLike(like.news.id)}
                                                    disabled={loading}
                                                >
                                                    <XCircle className="h-4 w-4" />
                                                    Remove Like
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
