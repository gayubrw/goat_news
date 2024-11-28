'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import Image from 'next/image';
import {
    PlusCircle,
    Search,
    MoreVertical,
    Eye,
    Pencil,
    Trash2,
    Calendar,
    User,
    Loader2
} from 'lucide-react';
import type { News, SubCategory } from '@/types';
import { getNews, deleteNews } from '@/actions/news';
import { getSubCategories } from '@/actions/subcategory';

// Delete Dialog Component
const DeleteDialog = ({
    open,
    onOpenChange,
    onConfirm,
    isDeleting,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => Promise<void>;
    isDeleting: boolean;
}) => (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your news article and remove it from our servers.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                    disabled={isDeleting}
                    onClick={async (e) => {
                        e.preventDefault();
                        await onConfirm();
                    }}
                    className="bg-destructive hover:bg-destructive/90"
                >
                    {isDeleting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Deleting...
                        </>
                    ) : (
                        'Delete'
                    )}
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
);

// Actions Menu Component
const ActionsMenu = ({
    news,
    onEdit,
    onDelete,
    onView,
    currentUserId,
}: {
    news: News;
    onEdit: (news: News) => void;
    onDelete: (news: News) => Promise<void>;
    onView: (news: News) => void;
    currentUserId: string | null;
}) => {
    const isAuthor = news.user.clerkId === currentUserId;
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        await onDelete(news);
        setIsDeleting(false);
        setDeleteDialogOpen(false);
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[160px]">
                    <DropdownMenuItem onClick={() => onView(news)} className="cursor-pointer">
                        <Eye className="mr-2 h-4 w-4" />
                        View
                    </DropdownMenuItem>
                    {isAuthor && (
                        <>
                            <DropdownMenuItem onClick={() => onEdit(news)} className="cursor-pointer">
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => setDeleteDialogOpen(true)}
                                className="text-destructive cursor-pointer focus:text-destructive"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            <DeleteDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={handleDelete}
                isDeleting={isDeleting}
            />
        </>
    );
};

// News Card Component
const NewsCard = ({
    news,
    onEdit,
    onDelete,
    onView,
    currentUserId,
}: {
    news: News;
    onEdit: (news: News) => void;
    onDelete: (news: News) => Promise<void>;
    onView: (news: News) => void;
    currentUserId: string | null;
}) => {
    const { user: clerkUser } = useUser();
    const authorName = news.user.clerkId === clerkUser?.id ? 'You' : clerkUser?.fullName || 'Unknown';

    const formatDate = (date: string | Date): string => {
        return new Intl.DateTimeFormat('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        }).format(new Date(date));
    };

    return (
        <Card className="group h-full flex flex-col overflow-hidden hover:shadow-lg transition-all duration-300">
            <div className="relative h-48 overflow-hidden">
                <Image
                    src={news.thumbnailUrl || '/api/placeholder/400/300'}
                    alt={news.title}
                    fill
                    className="object-cover rounded-t-lg transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute top-2 right-2">
                        <ActionsMenu
                            news={news}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onView={onView}
                            currentUserId={currentUserId}
                        />
                    </div>
                </div>
            </div>
            <div
                className="p-4 flex flex-col flex-1 cursor-pointer"
                onClick={() => onView(news)}
            >
                <div className="mb-2 flex gap-2 flex-wrap">
                    <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted">
                        {news.subCategory.category.title}
                    </span>
                    <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted">
                        {news.subCategory.title}
                    </span>
                </div>
                <h3 className="text-lg font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {news.title}
                </h3>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {news.description}
                </p>
                <div className="mt-auto">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5" />
                            {authorName}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            {formatDate(news.createdAt)}
                        </span>
                    </div>
                </div>
            </div>
        </Card>
    );
};

// Main News Page Component
const NewsPage = () => {
    const router = useRouter();
    const { toast } = useToast();
    const { user: clerkUser } = useUser();
    const [news, setNews] = useState<News[]>([]);
    const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [isLoading, setIsLoading] = useState(true);

    // Fetch data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const [newsData, subCategoriesData] = await Promise.all([
                    getNews(selectedCategory === 'all' ? undefined : selectedCategory),
                    getSubCategories(),
                ]);
                setNews(newsData);
                setSubCategories(subCategoriesData);
            } catch (error) {
                toast({
                    title: 'Error fetching data',
                    description: error instanceof Error ? error.message : 'Unknown error',
                    variant: 'destructive',
                });
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [selectedCategory, toast]);

    // Handlers
    const handleEdit = (newsItem: News) => {
        if (newsItem.user.clerkId === clerkUser?.id) {
            router.push(`/admin/news/edit/${newsItem.id}`);
        }
    };

    const handleView = (newsItem: News) => {
        router.push(`/${newsItem.subCategory.category.path}/${newsItem.subCategory.path}/${newsItem.path}`);
    };

    const handleDelete = async (newsItem: News) => {
        if (!newsItem || newsItem.user.clerkId !== clerkUser?.id) {
            toast({
                title: 'Error',
                description: 'You do not have permission to delete this news item',
                variant: 'destructive',
            });
            return;
        }

        try {
            await deleteNews(newsItem.id);
            setNews(prev => prev.filter(item => item.id !== newsItem.id));
            toast({
                title: 'Success',
                description: 'News deleted successfully'
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: error instanceof Error ? error.message : 'Unknown error',
                variant: 'destructive',
            });
        }
    };

    // Filter news based on search term
    const filteredNews = news.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 min-h-screen pb-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold">News Management</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your news articles and contents
                    </p>
                </div>
                <Button
                    onClick={() => router.push('/admin/news/create')}
                    className="w-full sm:w-auto"
                >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add News
                </Button>
            </div>

            {/* Filters */}
            <Card className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by title or description..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Select
                        value={selectedCategory}
                        onValueChange={setSelectedCategory}
                    >
                        <SelectTrigger className="w-full sm:w-[200px]">
                            <SelectValue placeholder="Filter by Category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {subCategories.map((category) => (
                                <SelectItem key={category.id} value={category.id}>
                                    {category.title}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </Card>

            {/* News Grid */}
            {isLoading ? (
                <div className="flex justify-center items-center min-h-[200px]">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : filteredNews.length === 0 ? (
                <Card className="p-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Search className="h-8 w-8" />
                        <h3 className="font-semibold">No news found</h3>
                        <p>Try adjusting your search or filter to find what you&apos;re looking for.</p>
                    </div>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredNews.map((item) => (
                        <NewsCard
                            key={item.id}
                            news={item}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onView={handleView}
                            currentUserId={clerkUser?.id || null}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default NewsPage;
