'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { getCurrentUserProfile, updateProfile } from '@/actions/profile';
import { ProfileImageUploadField } from '@/components/profile-image-upload';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save } from 'lucide-react';

export default function ProfilePage() {
    const { isLoaded, user } = useUser();
    const { toast } = useToast();
    const [profileData, setProfileData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        imageUrl: '',
    });
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const loadProfile = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getCurrentUserProfile();
            if (data?.profile) {
                setProfileData({
                    firstName: data.profile.firstName || '',
                    lastName: data.profile.lastName || '',
                    email: data.profile.email || '',
                    imageUrl: data.profile.imageUrl || '',
                });
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: `Failed to load profile: ${
                    error instanceof Error ? error.message : 'Unknown error'
                }`,
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        let mounted = true;

        if (isLoaded && user && mounted) {
            loadProfile();
        }

        return () => {
            mounted = false;
        };
    }, [isLoaded, user, loadProfile]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        try {
            setIsSaving(true);

            // Update profile data
            await updateProfile({
                firstName: profileData.firstName,
                lastName: profileData.lastName,
            });

            // Reload profile data to get the latest changes
            await loadProfile();

            toast({
                title: 'Success',
                description: 'Profile updated successfully',
            });
        } catch (error) {
            console.error(error);
            toast({
                title: 'Error',
                description: 'Failed to update profile',
                variant: 'destructive',
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleImageUploadComplete = async (url: string) => {
        try {
            // Update local state immediately
            setProfileData((prev) => ({
                ...prev,
                imageUrl: url,
            }));

            // Force reload user data from Clerk
            if (user) {
                await user.reload();
            }

            // Reload profile data to ensure sync
            await loadProfile();

            if (!url) {
                toast({
                    title: 'Success',
                    description: 'Profile image removed successfully',
                });
            }
        } catch (error) {
            console.error('Failed to handle image update completion:', error);
            toast({
                title: 'Error',
                description: 'Failed to update profile image',
                variant: 'destructive',
            });
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-24 pb-8 flex items-center justify-center">
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-8">
            <div className="container mx-auto px-4">
                <form onSubmit={handleSubmit}>
                    <Tabs defaultValue="profile" className="space-y-6">
                        <TabsList className="bg-zinc-100 dark:bg-zinc-900 p-1 rounded-lg">
                            <TabsTrigger value="profile">Profile</TabsTrigger>
                            <TabsTrigger value="security">Security</TabsTrigger>
                        </TabsList>

                        <TabsContent value="profile">
                            <Card className="bg-zinc-50 dark:bg-zinc-900">
                                <CardHeader>
                                    <CardTitle>Informasi Profil</CardTitle>
                                    <CardDescription>
                                        Kelola informasi profil admin Anda
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-8">
                                    <div className="flex flex-col items-center space-y-4">
                                        <ProfileImageUploadField
                                            value={profileData.imageUrl}
                                            onUploadComplete={
                                                handleImageUploadComplete
                                            }
                                        />
                                        <div className="text-center">
                                            <p className="text-lg font-medium">
                                                {profileData.firstName}{' '}
                                                {profileData.lastName}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {profileData.email}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid gap-4 max-w-xl mx-auto">
                                        <div className="grid gap-2">
                                            <Label htmlFor="firstName">
                                                First Name
                                            </Label>
                                            <Input
                                                id="firstName"
                                                value={profileData.firstName}
                                                onChange={(e) =>
                                                    setProfileData((prev) => ({
                                                        ...prev,
                                                        firstName:
                                                            e.target.value,
                                                    }))
                                                }
                                                className="bg-zinc-100 dark:bg-zinc-800"
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="lastName">
                                                Last Name
                                            </Label>
                                            <Input
                                                id="lastName"
                                                value={profileData.lastName}
                                                onChange={(e) =>
                                                    setProfileData((prev) => ({
                                                        ...prev,
                                                        lastName:
                                                            e.target.value,
                                                    }))
                                                }
                                                className="bg-zinc-100 dark:bg-zinc-800"
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input
                                                id="email"
                                                value={profileData.email}
                                                disabled
                                                className="bg-zinc-100 dark:bg-zinc-800"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="security">
                            <div className="grid gap-6">
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
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        <Button
                            type="submit"
                            size="lg"
                            className="flex items-center gap-2"
                            disabled={isSaving}
                        >
                            <Save size={16} />
                            {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </Button>
                    </Tabs>
                </form>
            </div>
        </div>
    );
}
