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
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Search, Trash2, Mail, UserCheck, ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getUsers, updateUserRole, deleteUser } from '@/actions/user';
import { useToast } from '@/hooks/use-toast';

interface EnrichedUser {
    id: string;
    clerkId: string | null;
    role: string | null;
    createdAt: string;
    updatedAt: string;
    profile: {
        firstName: string | null;
        lastName: string | null;
        imageUrl: string | null;
        email: string | null;
    } | null;
    contributionScore: number;
    totalNews: number;
}

interface AdminPromoteDialogProps {
    user: EnrichedUser;
    onPromote: () => void;
}

const AdminPromoteDialog = ({ user, onPromote }: AdminPromoteDialogProps) => {
    const [confirmEmail, setConfirmEmail] = useState('');
    const userEmail = user.profile?.email || '';
    const isValid = confirmEmail === userEmail;

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs hover:bg-yellow-100 hover:text-yellow-800 dark:hover:bg-yellow-900 dark:hover:text-yellow-200"
                >
                    <ShieldAlert className="h-3 w-3 mr-1" />
                    Make Admin
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-xl">
                        Promote to Admin
                    </AlertDialogTitle>
                    <div className="space-y-4">
                        <div className="text-sm text-muted-foreground">
                            You are about to promote{' '}
                            <span className="font-semibold text-foreground">
                                {user.profile?.firstName}{' '}
                                {user.profile?.lastName}
                            </span>{' '}
                            to admin role. This will grant them full
                            administrative privileges.
                        </div>
                        <div className="space-y-2">
                            <Label
                                htmlFor="confirm-email"
                                className="text-sm font-medium"
                            >
                                Please enter the user&apos;s email to confirm:
                            </Label>
                            <Input
                                id="confirm-email"
                                type="email"
                                placeholder={userEmail}
                                value={confirmEmail}
                                onChange={(e) =>
                                    setConfirmEmail(e.target.value)
                                }
                                className="w-full"
                            />
                            {confirmEmail && !isValid && (
                                <p className="text-xs text-destructive">
                                    Email does not match
                                </p>
                            )}
                        </div>
                    </div>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onPromote}
                        disabled={!isValid}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white"
                    >
                        Promote to Admin
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

const DeleteConfirmDialog = ({
    onConfirm,
    user,
}: {
    onConfirm: () => void;
    user: EnrichedUser;
}) => (
    <AlertDialog>
        <AlertDialogTrigger asChild>
            <Button
                variant="ghost"
                size="icon"
                className="hover:bg-destructive/10 hover:text-destructive"
            >
                <Trash2 className="h-4 w-4" />
            </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Delete User</AlertDialogTitle>
                <AlertDialogDescription>
                    Are you sure you want to delete {user.profile?.firstName}{' '}
                    {user.profile?.lastName}? This action cannot be undone and
                    will permanently remove the user and all associated data.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                    onClick={onConfirm}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                    Delete
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
);

const UsersPage = () => {
    const [users, setUsers] = useState<EnrichedUser[]>([]);
    const [filterRole, setFilterRole] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const { toast } = useToast();

    const loadUsers = useCallback(async () => {
        try {
            const data = await getUsers(filterRole, searchTerm);
            const formattedData = data.map((user) => ({
                ...user,
                createdAt: user.createdAt.toISOString(),
                updatedAt: user.updatedAt.toISOString(),
                profile: user.profile ? {
                  ...user.profile,
                  imageUrl: user.profile.imageUrl || '',  // Fallback to empty string if imageUrl is null
                } : null,
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
        const debounce = setTimeout(loadUsers, 200);
        return () => clearTimeout(debounce);
    }, [filterRole, searchTerm, loadUsers]);

    const handleRoleChange = async (userId: string, newRole: string) => {
        try {
            await updateUserRole(userId, newRole);
            await loadUsers();
            toast({
                title: 'Success',
                description:
                    newRole === 'admin'
                        ? 'User has been promoted to admin successfully'
                        : 'User role updated successfully',
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
                            <TableHead className="text-muted-foreground w-72">
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
                                <TableCell className="flex items-center gap-4">
                                    <Avatar className="h-12 w-12">
                                        <AvatarImage
                                            src={user.profile?.imageUrl || ''}
                                            alt={user.profile?.firstName || ''}
                                            className="object-cover"
                                        />
                                        <AvatarFallback className="bg-muted text-muted-foreground text-lg">
                                            {getInitials(user)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col">
                                        <span className="font-medium text-foreground">
                                            {user.profile?.firstName}{' '}
                                            {user.profile?.lastName}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                    {user.profile?.email}
                                </TableCell>
                                <TableCell>
                                    <span
                                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            user.role === 'admin'
                                                ? 'bg-primary/10 text-primary'
                                                : 'bg-muted text-muted-foreground'
                                        }`}
                                    >
                                        {user.role || 'User'}
                                    </span>
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
                                    <div className="flex items-center justify-end gap-2">
                                        {user.role !== 'admin' && (
                                            <AdminPromoteDialog
                                                user={user}
                                                onPromote={() =>
                                                    handleRoleChange(
                                                        user.id,
                                                        'admin'
                                                    )
                                                }
                                            />
                                        )}
                                        <DeleteConfirmDialog
                                            user={user}
                                            onConfirm={() =>
                                                handleDeleteUser(user.id)
                                            }
                                        />
                                    </div>
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
