import { Metadata } from 'next';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Clock, ChevronRight } from "lucide-react";
import { notFound } from 'next/navigation';
import { memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import type { Category, SubCategory } from '@/types';

type NewsStory = Readonly<{
    title: string;
    content: string;
    image?: string;
    slug?: string;
    subcategory: string;
}>;

type NewsData = Readonly<{
    category: string;
    categoryPath: string;
    featuredStory: NewsStory;
    latestNews: ReadonlyArray<NewsStory>;
    subcategories: SubCategory[];
}>;

type StoryCardProps = Readonly<{
    story: NewsStory;
    className?: string;
    categoryPath: string;
    featured?: boolean;
}>;

const StoryCard = memo(
    ({ story, className = '', categoryPath, featured = false }: StoryCardProps) => {
        const newsSlug = encodeURIComponent(
            story.title.toLowerCase().replace(/\s+/g, '-')
        );
        const subcategorySlug = encodeURIComponent(
            story.subcategory.toLowerCase().replace(/\s+/g, '-')
        );

        if (featured) {
            return (
                <Link href={`/${categoryPath}/${subcategorySlug}/${newsSlug}`}>
                    <Card className={`group relative h-[600px] overflow-hidden ${className}`}>
                        <CardContent className="p-0 h-full">
                            {story.image && (
                                <div className="relative h-full">
                                    <Image
                                        src={story.image}
                                        alt={story.title}
                                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700"
                                        width={1200}
                                        height={600}
                                        priority={true}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                                    <div className="absolute inset-x-0 bottom-0 p-8">
                                        <Badge
                                            className="mb-4 bg-primary/90 backdrop-blur-sm text-primary-foreground"
                                        >
                                            {story.subcategory}
                                        </Badge>
                                        <h2 className="text-4xl font-bold text-white mb-4 transition-colors">
                                            {story.title}
                                        </h2>
                                        <p className="text-zinc-200 text-lg mb-4 line-clamp-2">
                                            {story.content}
                                        </p>
                                        <div className="flex items-center gap-2 text-zinc-300">
                                            <Clock className="w-4 h-4" />
                                            <span className="text-sm">3 hours ago</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </Link>
            );
        }

        return (
            <Link href={`/${categoryPath}/${subcategorySlug}/${newsSlug}`}>
                <Card className={`group overflow-hidden ${className}`}>
                    <CardContent className="p-0">
                        {story.image && (
                            <div className="relative h-[400px]">
                                <Image
                                    src={story.image}
                                    alt={story.title}
                                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700"
                                    width={400}
                                    height={400}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                                <div className="absolute inset-x-0 bottom-0 p-6">
                                    <Badge
                                        className="mb-3 bg-primary/90 backdrop-blur-sm text-primary-foreground"
                                    >
                                        {story.subcategory}
                                    </Badge>
                                    <h3 className="text-xl font-bold text-white mb-2 transition-colors line-clamp-2">
                                        {story.title}
                                    </h3>
                                    <p className="text-zinc-200 text-sm mb-3 line-clamp-2">
                                        {story.content}
                                    </p>
                                    <div className="flex items-center justify-between text-zinc-300">
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4" />
                                            <span className="text-sm">3 hours ago</span>
                                        </div>
                                        <ChevronRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </Link>
        );
    }
);

StoryCard.displayName = 'StoryCard';

async function validateCategory(categoryPath: string): Promise<Category> {
    const category = await prisma.category.findUnique({
        where: { path: categoryPath },
        include: {
            subCategories: {
                include: {
                    category: true,
                    news: true
                }
            }
        }
    });

    if (!category) {
        notFound();
    }

    return category as Category;
}

async function getData(categoryPath: string): Promise<NewsData> {
    const category = await validateCategory(categoryPath);

    const getRandomSubcategory = () => {
        if (!category.subCategories?.length) {
            return "Uncategorized";
        }

        const randomIndex = Math.floor(Math.random() * category.subCategories.length);
        return category.subCategories[randomIndex].title;
    };

    return {
        category: category.title,
        categoryPath: category.path,
        featuredStory: {
            title: `Featured ${category.title} Story`,
            content:
                'Lorem ipsum dolor sit amet consectetur adipisicing elit. Breaking news and latest updates from around the world. Stay informed with our comprehensive coverage.',
            image: '/api/placeholder/1200/600',
            subcategory: getRandomSubcategory(),
        },
        latestNews: Array.from({ length: 6 }, (_, i) => ({
            title: `${category.title} Story ${i + 1}`,
            content:
                'Ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat...',
            image: '/api/placeholder/400/400',
            subcategory: getRandomSubcategory(),
        })),
        subcategories: category.subCategories,
    };
}

export async function generateStaticParams() {
    const categories = await prisma.category.findMany({
        select: { path: true }
    });
    return categories.map((category) => ({
        categories: category.path,
    }));
}

type Params = {
    categories: string;
};

export async function generateMetadata({
    params: paramsPromise,
}: {
    params: Promise<Params>;
}): Promise<Metadata> {
    try {
        const params = await paramsPromise;
        const category = await validateCategory(params.categories);

        return {
            title: `${category.title} News - Latest Updates | GOAT`,
            description: `Stay updated with the latest ${category.title.toLowerCase()} news, breaking stories, and in-depth coverage.`,
        };
    } catch {
        return {
            title: 'Not Found - GOAT',
            description: 'The requested page could not be found.',
        };
    }
}

export default async function CategoryPage({
    params: paramsPromise,
}: {
    params: Promise<Params>;
}) {
    const params = await paramsPromise;
    const data = await getData(params.categories);

    return (
        <div className="min-h-screen py-24">
            <header className="container mx-auto mb-4">
                <Breadcrumb className="mb-4">
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/">Home</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>{data.category}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-3">
                    <h1 className="text-4xl font-bold">
                        {data.category}
                    </h1>
                </div>

                <ScrollArea className="w-full whitespace-nowrap pb-3">
                    <div className="flex gap-2">
                        {data.subcategories.map((subcategory) => (
                            <Link
                                key={subcategory.id}
                                href={`/${data.categoryPath}/${subcategory.path}`}
                            >
                                <Badge
                                    variant="outline"
                                    className="px-4 py-2 font-medium text-xm tracking-wide hover:bg-primary hover:text-primary-foreground cursor-pointer transition-colors"
                                >
                                    {subcategory.title}
                                </Badge>
                            </Link>
                        ))}
                    </div>
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>
            </header>

            <main className="container mx-auto">
                <StoryCard
                    story={data.featuredStory}
                    className="mb-12"
                    categoryPath={data.categoryPath}
                    featured={true}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {data.latestNews.map((story, index) => (
                        <StoryCard
                            key={index}
                            story={story}
                            categoryPath={data.categoryPath}
                        />
                    ))}
                </div>
            </main>
        </div>
    );
}
