'use client';

import React, { useState } from 'react';
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
    Bookmark,
    ChartBar,
    Newspaper,
    Users,
    Eye,
    MoreVertical,
    XCircle,
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Bookmark {
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
        path: string;
        popularityScore: number;
    };
}

const BookmarksPage = () => {
    // Sample data
    const bookmarks: Bookmark[] = [
        {
            id: '1',
            createdAt: '2024-11-24T10:00:00Z',
            user: {
                id: '1',
                name: 'John Doe',
                image: null,
            },
            news: {
                id: '1',
                title: 'Breaking News: Important Event',
                path: 'breaking-news-important-event',
                popularityScore: 85,
            },
        },
        {
            id: '2',
            createdAt: '2024-11-24T09:30:00Z',
            user: {
                id: '2',
                name: 'Jane Smith',
                image: null,
            },
            news: {
                id: '2',
                title: 'Technology Update 2024',
                path: 'technology-update-2024',
                popularityScore: 92,
            },
        },
    ];

    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState('all');

    // Stats calculation
    const stats = {
        totalBookmarks: bookmarks.length,
        popularPosts: bookmarks.filter(
            (bookmark) => bookmark.news.popularityScore > 90
        ).length,
        uniqueUsers: new Set(bookmarks.map((bookmark) => bookmark.user.id))
            .size,
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((word) => word[0])
            .join('')
            .toUpperCase();
    };

    return (
        <div className="pt-16 space-y-6">
            {/* Header Section */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-foreground">
                    Bookmark Management
                </h1>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-border bg-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-foreground">
                            Total Bookmarks
                        </CardTitle>
                        <Bookmark className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">
                            {stats.totalBookmarks}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Total bookmarks
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
                            Saved bookmarks
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
                    >
                        <Filter className="h-4 w-4" />
                        Filter
                    </Button>
                </div>
            </div>

            {/* Bookmarks Table */}
            <div className="rounded-lg border border-border bg-card shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="border-border hover:bg-transparent">
                            <TableHead className="text-muted-foreground">
                                User
                            </TableHead>
                            <TableHead className="text-muted-foreground">
                                Article
                            </TableHead>
                            <TableHead className="text-muted-foreground">
                                Path
                            </TableHead>
                            <TableHead className="text-muted-foreground">
                                Date
                            </TableHead>
                            <TableHead className="text-muted-foreground">
                                Popularity
                            </TableHead>
                            <TableHead className="text-right text-muted-foreground">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {bookmarks.map((bookmark) => (
                            <TableRow
                                key={bookmark.id}
                                className="border-border hover:bg-muted/50"
                            >
                                <TableCell className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarImage
                                            src={
                                                bookmark.user.image || undefined
                                            }
                                        />
                                        <AvatarFallback className="bg-muted text-muted-foreground">
                                            {getInitials(bookmark.user.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium text-foreground">
                                            {bookmark.user.name}
                                        </p>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Newspaper className="h-4 w-4 text-muted-foreground" />
                                        <p className="text-sm text-muted-foreground hover:text-foreground line-clamp-1">
                                            {bookmark.news.title}
                                        </p>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <p className="text-sm text-muted-foreground">
                                        {bookmark.news.path}
                                    </p>
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                    {new Date(
                                        bookmark.createdAt
                                    ).toLocaleDateString('en-US', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                    })}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-24 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary"
                                                style={{
                                                    width: `${bookmark.news.popularityScore}%`,
                                                }}
                                            />
                                        </div>
                                        <span className="text-sm text-muted-foreground">
                                            {bookmark.news.popularityScore}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                            >
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent
                                            align="end"
                                            className="bg-popover border-border"
                                        >
                                            <DropdownMenuItem className="flex items-center gap-2 text-muted-foreground hover:text-foreground focus:text-foreground">
                                                <Eye className="h-4 w-4" />
                                                View Article
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="flex items-center gap-2 text-destructive hover:text-destructive focus:text-destructive">
                                                <XCircle className="h-4 w-4" />
                                                Remove Bookmark
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

export default BookmarksPage;
