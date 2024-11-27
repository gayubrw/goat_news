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
    Ban,
    Mail,
    Key,
    UserCheck,
    Shield,
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface User {
    id: string;
    name: string;
    email: string;
    image: string | null;
    emailVerified: string | null;
    contributionScore: number;
    createdAt: string;
    role: {
        id: string;
        name: string;
    };
}

const UsersPage = () => {
    // Sample data
    const users: User[] = [
        {
            id: '1',
            name: 'John Doe',
            email: 'john@example.com',
            image: null,
            emailVerified: '2024-11-24T10:00:00Z',
            contributionScore: 125,
            createdAt: '2024-11-20T10:00:00Z',
            role: { id: '1', name: 'Admin' },
        },
        {
            id: '2',
            name: 'Jane Smith',
            email: 'jane@example.com',
            image: null,
            emailVerified: null,
            contributionScore: 85,
            createdAt: '2024-11-22T09:30:00Z',
            role: { id: '2', name: 'Editor' },
        },
    ];

    const [filterRole, setFilterRole] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterVerified, setFilterVerified] = useState('all');

    // Stats calculation
    const stats = {
        totalUsers: users.length,
        verifiedUsers: users.filter((user) => user.emailVerified).length,
        activeUsers: users.filter((user) => user.contributionScore > 100)
            .length,
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
                    User Management
                </h1>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-border bg-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-foreground">
                            Total Users
                        </CardTitle>
                        <UserCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">
                            {stats.totalUsers}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Registered users
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-border bg-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-foreground">
                            Verified Users
                        </CardTitle>
                        <Mail className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">
                            {stats.verifiedUsers}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Email verified
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-border bg-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-foreground">
                            Active Users
                        </CardTitle>
                        <UserCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">
                            {stats.activeUsers}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Active contributors
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters Section */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search users..."
                        className="pl-10 bg-muted border-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-4">
                    <Select
                        value={filterVerified}
                        onValueChange={setFilterVerified}
                    >
                        <SelectTrigger className="w-[180px] bg-muted border-input">
                            <SelectValue placeholder="Verification Status" />
                        </SelectTrigger>
                        <SelectContent className="bg-background border-input">
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="verified">Verified</SelectItem>
                            <SelectItem value="unverified">
                                Unverified
                            </SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={filterRole} onValueChange={setFilterRole}>
                        <SelectTrigger className="w-[180px] bg-muted border-input">
                            <SelectValue placeholder="Filter Role" />
                        </SelectTrigger>
                        <SelectContent className="bg-background border-input">
                            <SelectItem value="all">All Roles</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="editor">Editor</SelectItem>
                            <SelectItem value="moderator">Moderator</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button
                        variant="outline"
                        className="flex items-center gap-2 border-input"
                    >
                        <Filter size={20} />
                        Filter
                    </Button>
                </div>
            </div>

            {/* Users Table */}
            <div className="rounded-lg border border-border bg-card shadow-lg overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="border-border hover:bg-muted/50">
                            <TableHead className="text-muted-foreground">
                                User
                            </TableHead>
                            <TableHead className="text-muted-foreground">
                                Email
                            </TableHead>
                            <TableHead className="text-muted-foreground">
                                Role
                            </TableHead>
                            <TableHead className="text-muted-foreground">
                                Status
                            </TableHead>
                            <TableHead className="text-muted-foreground">
                                Contribution
                            </TableHead>
                            <TableHead className="text-muted-foreground">
                                Register Date
                            </TableHead>
                            <TableHead className="text-muted-foreground text-right">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow
                                key={user.id}
                                className="border-border hover:bg-muted/50"
                            >
                                <TableCell className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarImage
                                            src={user.image || undefined}
                                        />
                                        <AvatarFallback className="bg-muted text-muted-foreground">
                                            {getInitials(user.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="font-medium text-foreground">
                                        {user.name}
                                    </span>
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                    {user.email}
                                </TableCell>
                                <TableCell>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                        {user.role.name}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <span
                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            user.emailVerified
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                        }`}
                                    >
                                        {user.emailVerified
                                            ? 'Verified'
                                            : 'Unverified'}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-24 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary"
                                                style={{
                                                    width: `${Math.min(
                                                        100,
                                                        user.contributionScore
                                                    )}%`,
                                                }}
                                            />
                                        </div>
                                        <span className="text-sm text-muted-foreground">
                                            {user.contributionScore}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                    {new Date(
                                        user.createdAt
                                    ).toLocaleDateString('en-US', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                    })}
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                className="h-8 w-8 p-0 hover:bg-muted"
                                            >
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent
                                            align="end"
                                            className="bg-background border-border"
                                        >
                                            <DropdownMenuItem className="flex items-center gap-2 hover:bg-muted">
                                                <Mail size={16} />
                                                Send Verification
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="flex items-center gap-2 hover:bg-muted">
                                                <Key size={16} />
                                                Reset Password
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator className="bg-border" />
                                            <DropdownMenuItem className="flex items-center gap-2 hover:bg-muted">
                                                <Shield size={16} />
                                                Change Role
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator className="bg-border" />
                                            <DropdownMenuItem className="flex items-center gap-2 text-destructive hover:bg-muted">
                                                <Ban size={16} />
                                                Block User
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

export default UsersPage;
