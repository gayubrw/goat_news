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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
    Search,
    PlusCircle,
    MoreVertical,
    Pencil,
    Trash2,
    Shield,
    Users,
    Lock,
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';

interface Role {
    id: string;
    name: string;
    description: string;
    usersCount: number;
    permissions: string[];
    createdAt: string;
}

interface Permission {
    id: string;
    name: string;
    description: string;
    category: string;
}

const RolesPage = () => {
    // Sample data
    const roles: Role[] = [
        {
            id: '1',
            name: 'Admin',
            description: 'Akses penuh ke semua fitur',
            usersCount: 5,
            permissions: ['manage_users', 'manage_content', 'manage_roles'],
            createdAt: '2024-11-24T10:00:00Z',
        },
        {
            id: '2',
            name: 'Editor',
            description: 'Mengelola konten dan kategori',
            usersCount: 12,
            permissions: ['manage_content'],
            createdAt: '2024-11-24T09:30:00Z',
        },
        {
            id: '3',
            name: 'Moderator',
            description: 'Moderasi komentar dan interaksi',
            usersCount: 8,
            permissions: ['manage_comments', 'manage_interactions'],
            createdAt: '2024-11-24T08:45:00Z',
        },
    ];

    const permissions: Permission[] = [
        {
            id: '1',
            name: 'manage_users',
            description: 'Mengelola pengguna',
            category: 'Users',
        },
        {
            id: '2',
            name: 'manage_content',
            description: 'Mengelola konten',
            category: 'Content',
        },
        {
            id: '3',
            name: 'manage_roles',
            description: 'Mengelola roles',
            category: 'System',
        },
        {
            id: '4',
            name: 'manage_comments',
            description: 'Moderasi komentar',
            category: 'Engagement',
        },
        {
            id: '5',
            name: 'manage_interactions',
            description: 'Mengelola interaksi',
            category: 'Engagement',
        },
    ];

    const [searchTerm, setSearchTerm] = useState('');
    const [isAddRoleOpen, setIsAddRoleOpen] = useState(false);
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>(
        []
    );

    // Stats calculation
    const stats = {
        totalRoles: roles.length,
        totalUsers: roles.reduce((acc, role) => acc + role.usersCount, 0),
        totalPermissions: permissions.length,
    };

    return (
        <div className="pt-16 space-y-6">
            {/* Header Section */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-foreground">
                    Role Management
                </h1>
                <Button
                    onClick={() => setIsAddRoleOpen(true)}
                    className="flex items-center gap-2"
                >
                    <PlusCircle size={20} />
                    Add Role
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-border bg-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-foreground">
                            Total Roles
                        </CardTitle>
                        <Shield className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">
                            {stats.totalRoles}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Available roles
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-border bg-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-foreground">
                            Total Users
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">
                            {stats.totalUsers}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Users with roles
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-border bg-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-foreground">
                            Total Permissions
                        </CardTitle>
                        <Lock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">
                            {stats.totalPermissions}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Available permissions
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Search Section */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search roles..."
                        className="pl-10 bg-muted border-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Roles Table */}
            <div className="rounded-lg border border-border bg-card shadow-lg overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="border-border hover:bg-muted/50">
                            <TableHead className="text-muted-foreground">
                                Role Name
                            </TableHead>
                            <TableHead className="text-muted-foreground">
                                Description
                            </TableHead>
                            <TableHead className="text-muted-foreground">
                                Users
                            </TableHead>
                            <TableHead className="text-muted-foreground">
                                Permissions
                            </TableHead>
                            <TableHead className="text-muted-foreground">
                                Created Date
                            </TableHead>
                            <TableHead className="text-muted-foreground text-right">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {roles.map((role) => (
                            <TableRow
                                key={role.id}
                                className="border-border hover:bg-muted/50"
                            >
                                <TableCell className="font-medium text-foreground">
                                    {role.name}
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                    {role.description}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-muted-foreground">
                                            {role.usersCount}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-1 flex-wrap">
                                        {role.permissions.map((permission) => (
                                            <span
                                                key={permission}
                                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary"
                                            >
                                                {permission}
                                            </span>
                                        ))}
                                    </div>
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                    {new Date(
                                        role.createdAt
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
                                                <Pencil size={16} />
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="flex items-center gap-2 hover:bg-muted">
                                                <Users size={16} />
                                                View Users
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator className="bg-border" />
                                            <DropdownMenuItem
                                                className="flex items-center gap-2 text-destructive hover:bg-muted"
                                                disabled={role.name === 'Admin'}
                                            >
                                                <Trash2 size={16} />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Add Role Dialog */}
            <Dialog open={isAddRoleOpen} onOpenChange={setIsAddRoleOpen}>
                <DialogContent className="sm:max-w-[525px]">
                    <DialogHeader>
                        <DialogTitle>Tambah Role Baru</DialogTitle>
                        <DialogDescription>
                            Buat role baru dengan mengisi informasi berikut
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nama Role</Label>
                            <Input id="name" placeholder="Masukkan nama role" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Deskripsi</Label>
                            <Input
                                id="description"
                                placeholder="Deskripsi role"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Permissions</Label>
                            <div className="border rounded-lg p-4 space-y-4">
                                {Object.entries(
                                    permissions.reduce((acc, permission) => {
                                        acc[permission.category] = [
                                            ...(acc[permission.category] || []),
                                            permission,
                                        ];
                                        return acc;
                                    }, {} as Record<string, Permission[]>)
                                ).map(([category, perms]) => (
                                    <div key={category} className="space-y-2">
                                        <h4 className="text-sm font-medium text-muted-foreground">
                                            {category}
                                        </h4>
                                        <div className="grid gap-2">
                                            {perms.map((permission) => (
                                                <div
                                                    key={permission.id}
                                                    className="flex items-center space-x-2"
                                                >
                                                    <Checkbox
                                                        id={permission.id}
                                                        checked={selectedPermissions.includes(
                                                            permission.name
                                                        )}
                                                        onCheckedChange={(
                                                            checked
                                                        ) => {
                                                            if (checked) {
                                                                setSelectedPermissions(
                                                                    [
                                                                        ...selectedPermissions,
                                                                        permission.name,
                                                                    ]
                                                                );
                                                            } else {
                                                                setSelectedPermissions(
                                                                    selectedPermissions.filter(
                                                                        (p) =>
                                                                            p !==
                                                                            permission.name
                                                                    )
                                                                );
                                                            }
                                                        }}
                                                    />
                                                    <Label
                                                        htmlFor={permission.id}
                                                        className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                    >
                                                        {permission.description}
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit">Simpan</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default RolesPage;
