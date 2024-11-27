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
    MoreVertical,
    CheckCircle,
    XCircle,
    MessageSquare,
    AlertTriangle,
    Eye,
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Comment {
    id: string;
    text: string;
    user: {
        id: string;
        name: string;
        image: string | null;
    };
    news: {
        id: string;
        title: string;
    };
    createdAt: string;
    status: 'pending' | 'approved' | 'rejected';
}

const CommentsPage = () => {
    const comments: Comment[] = [
        {
            id: '1',
            text: 'Very informative article, thank you for sharing!',
            user: {
                id: '1',
                name: 'John Doe',
                image: null,
            },
            news: {
                id: '1',
                title: 'Breaking News: Important Event',
            },
            createdAt: '2024-11-24T10:00:00Z',
            status: 'pending',
        },
        {
            id: '2',
            text: 'I disagree with the second point, it needs to be reviewed.',
            user: {
                id: '2',
                name: 'Jane Smith',
                image: null,
            },
            news: {
                id: '2',
                title: 'Technology Update 2024',
            },
            createdAt: '2024-11-24T09:30:00Z',
            status: 'approved',
        },
    ];

    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((word) => word[0])
            .join('')
            .toUpperCase();
    };

    const formatDate = (date: string): string => {
        const dateObject = new Date(date);
        const dateFormat = new Intl.DateTimeFormat('en-US', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        }).format(dateObject);

        const timeFormat = new Intl.DateTimeFormat('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
        }).format(dateObject);

        return `${dateFormat} - ${timeFormat}`;
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'approved':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'rejected':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            default:
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved':
                return <CheckCircle className="h-3 w-3 mr-1" />;
            case 'rejected':
                return <XCircle className="h-3 w-3 mr-1" />;
            default:
                return <AlertTriangle className="h-3 w-3 mr-1" />;
        }
    };

    return (
        <div className="pt-16 space-y-6">
            {/* Header Section */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-foreground">
                    Comment Management
                </h1>
            </div>

            {/* Stats Cards */}
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
                            Comments received
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-border bg-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-foreground">
                            Pending Review
                        </CardTitle>
                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">
                            {
                                comments.filter(
                                    (comment) => comment.status === 'pending'
                                ).length
                            }
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Needs review
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-border bg-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-foreground">
                            Rejected Comments
                        </CardTitle>
                        <XCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">
                            {
                                comments.filter(
                                    (comment) => comment.status === 'rejected'
                                ).length
                            }
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Violates guidelines
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters Section */}
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
                        value={filterStatus}
                        onValueChange={setFilterStatus}
                    >
                        <SelectTrigger className="w-[180px] bg-muted border-input">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border">
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="pending">
                                Pending Review
                            </SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
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

            {/* Comments Table */}
            <div className="rounded-lg border border-border bg-card shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="border-border hover:bg-transparent">
                            <TableHead className="text-muted-foreground">
                                User
                            </TableHead>
                            <TableHead className="w-[300px] text-muted-foreground">
                                Comment
                            </TableHead>
                            <TableHead className="text-muted-foreground">
                                Article
                            </TableHead>
                            <TableHead className="text-muted-foreground">
                                Date
                            </TableHead>
                            <TableHead className="text-muted-foreground">
                                Status
                            </TableHead>
                            <TableHead className="text-right text-muted-foreground">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {comments.map((comment) => (
                            <TableRow
                                key={comment.id}
                                className="border-border"
                            >
                                <TableCell className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarImage
                                            src={
                                                comment.user.image || undefined
                                            }
                                        />
                                        <AvatarFallback className="bg-muted text-muted-foreground">
                                            {getInitials(comment.user.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="font-medium text-foreground">
                                        {comment.user.name}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                        {comment.text}
                                    </p>
                                </TableCell>
                                <TableCell>
                                    <p className="text-sm text-muted-foreground hover:text-foreground cursor-pointer line-clamp-1">
                                        {comment.news.title}
                                    </p>
                                </TableCell>
                                <TableCell className="text-muted-foreground whitespace-nowrap">
                                    {formatDate(comment.createdAt)}
                                </TableCell>
                                <TableCell>
                                    <span
                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(
                                            comment.status
                                        )}`}
                                    >
                                        {getStatusIcon(comment.status)}
                                        {comment.status
                                            .charAt(0)
                                            .toUpperCase() +
                                            comment.status.slice(1)}
                                    </span>
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
                                                View Details
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="flex items-center gap-2 text-muted-foreground hover:text-foreground focus:text-foreground">
                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                                Approve
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="flex items-center gap-2 text-destructive hover:text-destructive focus:text-destructive">
                                                <XCircle className="h-4 w-4" />
                                                Reject
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
