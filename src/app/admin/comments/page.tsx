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
    MoreVertical,
    MessageSquare,
    Eye,
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getUserComments } from '@/actions/comment';
import type { Comment, News, User, NewsInteraction, UserInteraction } from '@/types';

interface DatabaseComment extends Comment {
    userInteraction: UserInteraction & {
        user: User;
    };
    newsInteraction: NewsInteraction & {
        news: News & {
            subCategory: {
                category: {
                    id: string;
                    path: string;
                    title: string;
                    description: string;
                };
            };
        };
    };
}

const CommentsPage = () => {
    const [comments, setComments] = useState<DatabaseComment[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [timePeriod, setTimePeriod] = useState('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchComments = async () => {
            try {
                const userComments = await getUserComments();
                setComments(userComments as DatabaseComment[]);
            } catch (error) {
                console.error('Failed to fetch comments:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchComments();
    }, []);

    const getInitials = (id: string) => {
        return 'U' + id.slice(0, 2).toUpperCase();
    };

    const formatDate = (date: Date): string => {
        const dateObject = new Date(date);
        const dateFormat = new Intl.DateTimeFormat('en-US', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        }).format(dateObject);

        return dateFormat;
    };

    const filteredComments = comments.filter(comment => {
        const matchesSearch = 
            comment.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
            comment.newsInteraction.news.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            comment.newsInteraction.news.subCategory.category.title.toLowerCase().includes(searchTerm.toLowerCase());

        if (timePeriod === 'all') return matchesSearch;
        
        const commentDate = new Date(comment.createdAt);
        const now = new Date();
        const daysDiff = (now.getTime() - commentDate.getTime()) / (1000 * 3600 * 24);

        switch (timePeriod) {
            case 'today':
                return matchesSearch && daysDiff < 1;
            case 'week':
                return matchesSearch && daysDiff < 7;
            case 'month':
                return matchesSearch && daysDiff < 30;
            default:
                return matchesSearch;
        }
    });

    if (loading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    return (
        <div className="pt-16 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-foreground">
                    Comment Management
                </h1>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-border bg-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-foreground">
                            Total Comments
                        </CardTitle>
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">
                            {comments.length}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Total comments
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-border bg-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-foreground">
                            Recent Comments
                        </CardTitle>
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">
                            {comments.filter(c => {
                                const daysDiff = (new Date().getTime() - new Date(c.createdAt).getTime()) / (1000 * 3600 * 24);
                                return daysDiff < 7;
                            }).length}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Last 7 days
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-border bg-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-foreground">
                            Active Articles
                        </CardTitle>
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">
                            {new Set(comments.map(c => c.newsInteractionId)).size}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Articles with comments
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search comments..."
                        className="pl-10 bg-muted border-input text-foreground placeholder:text-muted-foreground"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-4">
                    <Select
                        value={timePeriod}
                        onValueChange={setTimePeriod}
                    >
                        <SelectTrigger className="w-48 bg-muted border-input">
                            <SelectValue placeholder="Time Period" />
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
                    >
                        <Filter className="h-4 w-4" />
                        Filter
                    </Button>
                </div>
            </div>

            <div className="rounded-lg border border-border bg-card shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="border-border hover:bg-transparent">
                            <TableHead className="text-muted-foreground">User</TableHead>
                            <TableHead className="w-72 text-muted-foreground">Comment</TableHead>
                            <TableHead className="text-muted-foreground">Article</TableHead>
                            <TableHead className="text-muted-foreground">Category</TableHead>
                            <TableHead className="text-muted-foreground">Date</TableHead>
                            <TableHead className="text-right text-muted-foreground">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredComments.map((comment) => (
                            <TableRow key={comment.id} className="border-border">
                                <TableCell className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarFallback className="bg-muted text-muted-foreground">
                                            {getInitials(comment.userInteraction.user.id)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="font-medium text-foreground">
                                        User {comment.userInteraction.user.id.slice(0, 8)}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                        {comment.text}
                                    </p>
                                </TableCell>
                                <TableCell>
                                    <p className="text-sm text-muted-foreground hover:text-foreground cursor-pointer line-clamp-1">
                                        {comment.newsInteraction.news.title}
                                    </p>
                                </TableCell>
                                <TableCell>
                                    <p className="text-sm text-muted-foreground line-clamp-1">
                                        {comment.newsInteraction.news.subCategory.category.title}
                                    </p>
                                </TableCell>
                                <TableCell className="text-muted-foreground whitespace-nowrap">
                                    {formatDate(comment.createdAt)}
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-muted/50">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="bg-popover border-border">
                                            <DropdownMenuItem 
                                                className="flex items-center gap-2 text-muted-foreground hover:text-foreground focus:text-foreground"
                                                onClick={() => window.location.href = `/news/${comment.newsInteraction.news.path}`}
                                            >
                                                <Eye className="h-4 w-4" />
                                                View Article
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default CommentsPage;
