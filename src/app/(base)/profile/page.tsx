import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, Key, Upload } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export const metadata = {
    title: 'Profile - GOAT',
    description: 'Manage your profile and security settings',
};

const ProfilePage = () => {
    return (
        <div className="min-h-screen pt-24 pb-8">
            <div className="container mx-auto px-4">
                {/* Header Section */}
                <header className="mb-8">
                    <h1 className="text-4xl font-bold text-black dark:text-white mb-6">
                        Profile
                    </h1>
                </header>

                {/* Main Content */}
                <main>
                    <Tabs defaultValue="profile" className="space-y-6">
                        <TabsList className="bg-zinc-100 dark:bg-zinc-900 p-1 rounded-lg">
                            <TabsTrigger value="profile">Profile</TabsTrigger>
                            <TabsTrigger value="security">Security</TabsTrigger>
                        </TabsList>

                        {/* Profile Settings */}
                        <TabsContent value="profile">
                            <div className="grid gap-6">
                                <Card className="bg-zinc-50 dark:bg-zinc-900">
                                    <CardHeader>
                                        <CardTitle>Informasi Profil</CardTitle>
                                        <CardDescription>
                                            Kelola informasi profil admin Anda
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="flex items-center gap-6">
                                            <Avatar className="h-24 w-24">
                                                <AvatarImage src="/api/placeholder/150/150" />
                                                <AvatarFallback>
                                                    AD
                                                </AvatarFallback>
                                            </Avatar>
                                            <Button
                                                variant="outline"
                                                className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800"
                                            >
                                                <Upload size={16} />
                                                Upload Foto
                                            </Button>
                                        </div>
                                        <div className="grid gap-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="name">
                                                    Nama
                                                </Label>
                                                <Input
                                                    id="name"
                                                    placeholder="Nama lengkap"
                                                    className="bg-zinc-100 dark:bg-zinc-800"
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="email">
                                                    Email
                                                </Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    placeholder="Email"
                                                    className="bg-zinc-100 dark:bg-zinc-800"
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="bio">Bio</Label>
                                                <Textarea
                                                    id="bio"
                                                    placeholder="Tentang Anda"
                                                    className="bg-zinc-100 dark:bg-zinc-800"
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        {/* Security Settings */}
                        <TabsContent value="security">
                            <div className="grid gap-6">
                                <Card className="bg-zinc-50 dark:bg-zinc-900">
                                    <CardHeader>
                                        <CardTitle>Ganti Password</CardTitle>
                                        <CardDescription>
                                            Ubah password akun Anda
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="current-password">
                                                Password Saat Ini
                                            </Label>
                                            <Input
                                                id="current-password"
                                                type="password"
                                                className="bg-zinc-100 dark:bg-zinc-800"
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="new-password">
                                                Password Baru
                                            </Label>
                                            <Input
                                                id="new-password"
                                                type="password"
                                                className="bg-zinc-100 dark:bg-zinc-800"
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="confirm-password">
                                                Konfirmasi Password Baru
                                            </Label>
                                            <Input
                                                id="confirm-password"
                                                type="password"
                                                className="bg-zinc-100 dark:bg-zinc-800"
                                            />
                                        </div>
                                        <Button className="flex items-center gap-2">
                                            <Key size={16} />
                                            Update Password
                                        </Button>
                                    </CardContent>
                                </Card>

                                <Card className="bg-zinc-50 dark:bg-zinc-900">
                                    <CardHeader>
                                        <CardTitle>
                                            Two-Factor Authentication
                                        </CardTitle>
                                        <CardDescription>
                                            Tambahkan lapisan keamanan tambahan
                                            untuk akun Anda
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <Label>
                                                    Autentikasi Dua Faktor
                                                </Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Aktifkan autentikasi dua
                                                    faktor untuk keamanan
                                                    tambahan
                                                </p>
                                            </div>
                                            <Switch />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <Label>Verifikasi Login</Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Kirim kode verifikasi saat
                                                    login dari perangkat baru
                                                </p>
                                            </div>
                                            <Switch />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-zinc-50 dark:bg-zinc-900">
                                    <CardHeader>
                                        <CardTitle>Sesi Login</CardTitle>
                                        <CardDescription>
                                            Kelola sesi login aktif Anda
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between p-4 border rounded-lg bg-zinc-100 dark:bg-zinc-800">
                                                <div className="space-y-1">
                                                    <p className="font-medium">
                                                        Chrome - Windows
                                                    </p>
                                                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                                        Aktif sekarang •
                                                        Jakarta, Indonesia
                                                    </p>
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    className="text-red-600"
                                                >
                                                    Akhiri Sesi
                                                </Button>
                                            </div>
                                            <div className="flex items-center justify-between p-4 border rounded-lg bg-zinc-100 dark:bg-zinc-800">
                                                <div className="space-y-1">
                                                    <p className="font-medium">
                                                        Safari - MacOS
                                                    </p>
                                                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                                        2 jam yang lalu •
                                                        Jakarta, Indonesia
                                                    </p>
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    className="text-red-600"
                                                >
                                                    Akhiri Sesi
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        <Button size="lg" className="flex items-center gap-2">
                            <Save size={16} />
                            Simpan Perubahan
                        </Button>
                    </Tabs>
                </main>
            </div>
        </div>
    );
};

export default ProfilePage;
