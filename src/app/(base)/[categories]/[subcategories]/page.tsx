import { Metadata } from 'next';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from "@/components/ui/badge";
import { Clock, ChevronRight } from "lucide-react";
import { notFound } from 'next/navigation';
import { memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getSubCategories } from '@/actions/subcategory';
import type { SubCategory } from '@/types';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

type NewsStory = Readonly<{
    title: string;
    content: string;
    image?: string;
    publishDate: string;
}>;

type StoryCardProps = Readonly<{
    story: NewsStory;
    category: string;
    subcategory: string;
    featured?: boolean;
}>;

const StoryCard = memo(({ story, category, subcategory, featured = false }: StoryCardProps) => {
    const newsSlug = encodeURIComponent(
        story.title.toLowerCase().replace(/\s+/g, '-')
    );

    if (featured) {
        return (
            <Link href={`/${category}/${subcategory}/${newsSlug}`}>
                <Card className={`group relative h-[600px] overflow-hidden`}>
                    <CardContent className="p-0 h-full">
                        <div className="relative h-full">
                            <Image
                                src={story.image || '/api/placeholder/1200/600'}
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
                                    Latest News
                                </Badge>
                                <h2 className="text-4xl font-bold text-white mb-4 group-hover:text-primary transition-colors">
                                    {story.title}
                                </h2>
                                <p className="text-zinc-200 text-lg mb-4 line-clamp-2">
                                    {story.content}
                                </p>
                                <div className="flex items-center gap-2 text-zinc-300">
                                    <Clock className="w-4 h-4" />
                                    <span className="text-sm">{story.publishDate}</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </Link>
        );
    }

    return (
        <Link href={`/${category}/${subcategory}/${newsSlug}`}>
            <Card className="group overflow-hidden">
                <CardContent className="p-0">
                    <div className="relative h-[400px]">
                        <Image
                            src={story.image || '/api/placeholder/400/400'}
                            alt={story.title}
                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700"
                            width={400}
                            height={400}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                        <div className="absolute inset-x-0 bottom-0 p-6">
                            <h3 className="text-xl font-bold text-white mb-3 group-hover:text-primary transition-colors line-clamp-2">
                                {story.title}
                            </h3>
                            <p className="text-zinc-200 text-sm mb-3 line-clamp-2">
                                {story.content}
                            </p>
                            <div className="flex items-center justify-between text-zinc-300">
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    <span className="text-sm">{story.publishDate}</span>
                                </div>
                                <ChevronRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
});

StoryCard.displayName = 'StoryCard';

type Params = {
    categories: string;
    subcategories: string;
};

async function getData(
    category: string,
    subcategory: string
): Promise<{ subCategory: SubCategory; stories: NewsStory[] }> {
    // Get all subcategories to validate the path
    const subCategories = await getSubCategories();
    const decodedPath = decodeURIComponent(subcategory);

    // Find the matching subcategory
    const subCategory = subCategories.find(sub => sub.path === decodedPath);

    if (!subCategory) {
        notFound();
    }

    // Validate that the subcategory belongs to the correct category
    if (subCategory.category.path !== category.toLowerCase()) {
        notFound();
    }

    // Generate dummy stories for now
    const stories = Array.from({ length: 9 }, (_, i) => ({
        title: `${subCategory.title} Story ${i + 1}`,
        content:
            'Lorem ipsum dolor sit amet consectetur adipisicing elit. Breaking news and latest updates from around the world. Stay informed with our comprehensive coverage.',
        image: '/api/placeholder/400/400',
        publishDate: new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        }),
    }));

    return {
        subCategory,
        stories,
    };
}

export async function generateMetadata({
    params: paramsPromise,
}: {
    params: Promise<Params>;
}): Promise<Metadata> {
    try {
        const params = await paramsPromise;
        const { subCategory } = await getData(params.categories, params.subcategories);

        return {
            title: `${subCategory.title} News - ${subCategory.category.title} - GOAT`,
            description: subCategory.description,
        };
    } catch {
        return {
            title: 'Not Found - GOAT',
            description: 'The requested page could not be found.',
        };
    }
}

export default async function SubcategoryPage({
    params: paramsPromise,
}: {
    params: Promise<Params>;
}) {
    const params = await paramsPromise;
    const { subCategory, stories } = await getData(params.categories, params.subcategories);
    const [featuredStory, ...otherStories] = stories;

    return (
        <div className="min-h-screen py-24">
            <header className="container mx-auto mb-8">
                <Breadcrumb className="mb-4">
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/">Home</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink href={`/${subCategory.category.path}`}>
                                {subCategory.category.title}
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>{subCategory.title}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                <h1 className="text-4xl font-bold mb-2">
                    {subCategory.title}
                </h1>
                <p className="text-lg text-muted-foreground">
                    {subCategory.description}
                </p>
            </header>

            <main className="container mx-auto">
                <StoryCard
                    story={featuredStory}
                    category={subCategory.category.path}
                    subcategory={subCategory.path}
                    featured={true}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
                    {otherStories.map((story, index) => (
                        <StoryCard
                            key={index}
                            story={story}
                            category={subCategory.category.path}
                            subcategory={subCategory.path}
                        />
                    ))}
                </div>
            </main>
        </div>
    );
}
