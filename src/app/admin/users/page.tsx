'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
    MoreVertical,
    Ban,
    Mail,
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
import { getUsers, updateUserRole, deleteUser } from '@/actions/user';
import { useToast } from '@/hooks/use-toast';

interface EnrichedUser {
    id: string;
    clerkId: string | null;
    role: string | null; // Changed to allow null
    createdAt: string;
    updatedAt: string;
    profile: {
        firstName: string | null;
        lastName: string | null;
        imageUrl: string;
        email: string | null;
    } | null;
    contributionScore: number;
    totalNews: number;
}

const UsersPage = () => {
    const [users, setUsers] = useState<EnrichedUser[]>([]);
    const [filterRole, setFilterRole] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    // const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const loadUsers = useCallback(async () => {
        try {
            const data = await getUsers(filterRole, searchTerm);
            const formattedData = data.map((user) => ({
                ...user,
                createdAt: user.createdAt.toISOString(),
                updatedAt: user.updatedAt.toISOString(),
            }));
            setUsers(formattedData);
        } catch (error) {
            console.error(error);
            toast({
                title: 'Error',
                description: 'Failed to load users',
                variant: 'destructive',
            });
        }
    }, [filterRole, searchTerm, toast]);

    useEffect(() => {
        const debounce = setTimeout(loadUsers, 300);
        return () => clearTimeout(debounce);
    }, [filterRole, searchTerm, loadUsers]); // Added loadUsers

    const handleRoleChange = async (userId: string, newRole: string) => {
        if (newRole === 'admin') {
            // Optional: Add confirmation dialog for making admin
            const confirm = window.confirm(
                'Are you sure you want to make this user an admin?'
            );
            if (!confirm) return;
        }

        try {
            await updateUserRole(userId, newRole);
            await loadUsers();
            toast({
                title: 'Success',
                description: 'User role updated successfully',
            });
        } catch (error) {
            console.error(error);
            toast({
                title: 'Error',
                description: 'Failed to update user role',
                variant: 'destructive',
            });
        }
    };

    const handleDeleteUser = async (userId: string) => {
        try {
            await deleteUser(userId);
            await loadUsers();
            toast({
                title: 'Success',
                description: 'User deleted successfully',
            });
        } catch (error) {
            console.error(error);
            toast({
                title: 'Error',
                description: 'Failed to delete user',
                variant: 'destructive',
            });
        }
    };

    const stats = {
        totalUsers: users.length,
        activeUsers: users.filter((user) => user.contributionScore > 100)
            .length,
        contentCreators: users.filter((user) => user.totalNews > 0).length,
    };

    const getInitials = (user: EnrichedUser) => {
        if (!user.profile) return '??';
        const firstName = user.profile.firstName || '';
        const lastName = user.profile.lastName || '';
        return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase();
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
                            Active Users
                        </CardTitle>
                        <UserCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">
                            {stats.activeUsers}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            High contribution score
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-border bg-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-foreground">
                            Content Creators
                        </CardTitle>
                        <Mail className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">
                            {stats.contentCreators}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Users with news content
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
                    <Select value={filterRole} onValueChange={setFilterRole}>
                        <SelectTrigger className="w-[180px] bg-muted border-input">
                            <SelectValue placeholder="Filter Role" />
                        </SelectTrigger>
                        <SelectContent className="bg-background border-input">
                            <SelectItem value="all">All Roles</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="user">User</SelectItem>
                        </SelectContent>
                    </Select>
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
                                News
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
                                            src={user.profile?.imageUrl}
                                            alt={user.profile?.firstName || ''}
                                        />
                                        <AvatarFallback className="bg-muted text-muted-foreground">
                                            {getInitials(user)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="font-medium text-foreground">
                                        {user.profile?.firstName}{' '}
                                        {user.profile?.lastName}
                                    </span>
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                    {user.profile?.email}
                                </TableCell>
                                <TableCell>
                                    <Select
                                        value={user.role || 'user'}
                                        onValueChange={(newRole) =>
                                            handleRoleChange(user.id, newRole)
                                        }
                                        disabled={user.role === 'admin'} // Prevent changing admin role
                                    >
                                        <SelectTrigger className="w-[110px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="admin">
                                                Admin
                                            </SelectItem>
                                            <SelectItem value="user">
                                                User
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                    {user.totalNews}
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
                                            <DropdownMenuItem
                                                className="flex items-center gap-2 hover:bg-muted"
                                                onClick={() =>
                                                    handleRoleChange(
                                                        user.id,
                                                        'admin'
                                                    )
                                                }
                                            >
                                                <Shield size={16} />
                                                Make Admin
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="flex items-center gap-2 hover:bg-muted"
                                                onClick={() =>
                                                    handleRoleChange(
                                                        user.id,
                                                        'user'
                                                    )
                                                }
                                            >
                                                <UserCheck size={16} />
                                                Make User
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator className="bg-border" />
                                            <DropdownMenuItem
                                                className="flex items-center gap-2 text-destructive hover:bg-muted"
                                                onClick={() =>
                                                    handleDeleteUser(user.id)
                                                }
                                            >
                                                <Ban size={16} />
                                                Delete User
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
