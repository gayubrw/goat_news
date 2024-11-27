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
} from '@/components/ui/dropdown-menu';
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
    User
} from 'lucide-react';
import type { News, SubCategory } from '@/types';
import { getNews, deleteNews } from '@/actions/news';
import { getSubCategories } from '@/actions/subcategory';

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
    onDelete: (id: string) => Promise<void>;
    onView: (news: News) => void;
    currentUserId: string | null;
}) => {
    const isAuthor = news.user.clerkId === currentUserId;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem className="flex gap-2" onSelect={() => onView(news)}>
                    <Eye className="h-4 w-4" />
                    View
                </DropdownMenuItem>
                {isAuthor && (
                    <>
                        <DropdownMenuItem className="flex gap-2" onSelect={() => onEdit(news)}>
                            <Pencil className="h-4 w-4" />
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex gap-2 text-destructive" onSelect={() => onDelete(news.id)}>
                            <Trash2 className="h-4 w-4" />
                            Delete
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
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
    onDelete: (id: string) => Promise<void>;
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
        <Card className="h-full flex flex-col">
            <div className="relative h-48">
                <Image
                    src={news.thumbnailUrl || '/api/placeholder/400/300'}
                    alt={news.title}
                    fill
                    className="object-cover rounded-t-lg"
                />
            </div>
            <div className="p-4 flex flex-col flex-1">
                <div className="mb-2">
                    <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted">
                        {news.subCategory.title}
                    </span>
                </div>
                <h3 className="text-lg font-semibold mb-2 line-clamp-2">{news.title}</h3>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{news.description}</p>
                <div className="mt-auto">
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                        <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {authorName}
                        </span>
                        <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(news.createdAt)}
                        </span>
                    </div>
                    <div className="flex justify-end">
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

    // Fetch data
    useEffect(() => {
        const fetchData = async () => {
            try {
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
        router.push(`/news/${newsItem.path}`);
    };

    const handleDelete = async (id: string) => {
        const newsItem = news.find(item => item.id === id);
        if (!newsItem || newsItem.user.clerkId !== clerkUser?.id) {
            toast({
                title: 'Error',
                description: 'You do not have permission to delete this news item',
                variant: 'destructive',
            });
            return;
        }

        try {
            await deleteNews(id);
            setNews(prev => prev.filter(item => item.id !== id));
            toast({ title: 'News deleted successfully' });
        } catch (error) {
            toast({
                title: 'Error',
                description: error instanceof Error ? error.message : 'Unknown error',
                variant: 'destructive',
            });
        }
    };

    // Filter news based on search term
    const filteredNews = news.filter(
        (item) =>
            item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold">News Management</h1>
                <Button
                    onClick={() => router.push('/admin/news/create')}
                    className="w-full sm:w-auto flex items-center gap-2"
                >
                    <PlusCircle className="h-4 w-4" />
                    Add News
                </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search news..."
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

            {/* News Grid */}
            {filteredNews.length === 0 ? (
                <Card className="p-6 text-center text-muted-foreground">
                    No news found.
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
