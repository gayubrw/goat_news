import React from 'react';
import { Button } from '@/components/ui/button';
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

const SettingsPage = () => {
    return (
        <div className="min-h-screen pt-24 pb-8">
            <div className="container mx-auto px-4">
                {/* Header Section */}
                <header className="mb-8">
                    <h1 className="text-4xl font-bold text-black dark:text-white mb-6">
                        Pengaturan
                    </h1>
                </header>

                <Tabs defaultValue="notifications" className="space-y-6">
                    <TabsList>
                        <TabsTrigger value="notifications">
                            Notifikasi
                        </TabsTrigger>
                        <TabsTrigger value="appearance">Tampilan</TabsTrigger>
                    </TabsList>

                    {/* Notification Settings */}
                    <TabsContent value="notifications">
                        <Card>
                            <CardHeader>
                                <CardTitle>Pengaturan Notifikasi</CardTitle>
                                <CardDescription>
                                    Atur preferensi notifikasi Anda
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Notifikasi Email</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Terima notifikasi melalui email
                                        </p>
                                    </div>
                                    <Switch />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Notifikasi Komentar</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Notifikasi ketika ada komentar baru
                                        </p>
                                    </div>
                                    <Switch />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Notifikasi Laporan</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Notifikasi ketika ada laporan baru
                                        </p>
                                    </div>
                                    <Switch />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Appearance Settings */}
                    <TabsContent value="appearance">
                        <Card>
                            <CardHeader>
                                <CardTitle>Tampilan</CardTitle>
                                <CardDescription>
                                    Sesuaikan tampilan antarmuka admin
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Mode Gelap</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Aktifkan tampilan mode gelap
                                            </p>
                                        </div>
                                        <Switch />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Animasi Transisi</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Aktifkan animasi saat
                                                perpindahan halaman
                                            </p>
                                        </div>
                                        <Switch />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Ukuran Font</Label>
                                        <select className="w-full p-2 border rounded-md">
                                            <option value="small">Kecil</option>
                                            <option value="medium">
                                                Sedang
                                            </option>
                                            <option value="large">Besar</option>
                                        </select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Bahasa</Label>
                                        <select className="w-full p-2 border rounded-md">
                                            <option value="id">
                                                Bahasa Indonesia
                                            </option>
                                            <option value="en">English</option>
                                        </select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <Button size="lg" className="flex items-center gap-2">
                        <Save size={16} />
                        Simpan Perubahan
                    </Button>
                </Tabs>
            </div>
        </div>
    );
};

export default SettingsPage;
