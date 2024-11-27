import { Metadata } from 'next';
import { Card } from '@/components/ui/card';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

const VALID_CATEGORIES = [
    'politics',
    'business',
    'tech',
    'sports',
    'entertainment',
    'lifestyle',
] as const;

const CATEGORY_SUBCATEGORIES: Record<CategoryType, ReadonlyArray<string>> = {
    politics: ['National', 'International'],
    business: ['Macro', 'Financial Exchange', 'Real Sector'],
    tech: ['Gadgets', 'Electronics', 'Telco'],
    sports: ['Soccer', 'Boxing', 'All Sport'],
    entertainment: ['Movies', 'Music', 'Celebrity'],
    lifestyle: ['Health', 'Travel', 'Food'],
};

const slugify = (text: string): string => {
    return text.toLowerCase().replace(/\s+/g, '-');
};

const deslugify = (slug: string): string => {
    return decodeURIComponent(slug)
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

const normalizeSubcategory = (
    category: CategoryType,
    subcategorySlug: string
): string | null => {
    const validSubcategories = CATEGORY_SUBCATEGORIES[category];
    const normalizedInput = deslugify(subcategorySlug);

    return (
        validSubcategories.find(
            (sub) => sub.toLowerCase() === normalizedInput.toLowerCase()
        ) || null
    );
};

type CategoryType = (typeof VALID_CATEGORIES)[number];

type NewsDetail = Readonly<{
    title: string;
    content: string;
    category: string;
    subcategory: string;
    author: string;
    publishDate: string;
    image?: string;
    tags: ReadonlyArray<string>;
    relatedStories: ReadonlyArray<{
        title: string;
        slug: string;
        subcategory: string;
    }>;
}>;

type Params = {
    categories: string;
    subcategories: string;
    news: string;
};

async function getNewsData(params: Promise<Params>): Promise<NewsDetail> {
    const resolvedParams = await params;
    const { categories: category, subcategories, news: slug } = resolvedParams;
    const lowerCategory = category.toLowerCase() as CategoryType;

    if (!VALID_CATEGORIES.includes(lowerCategory)) {
        notFound();
    }

    const normalizedSubcategory = normalizeSubcategory(
        lowerCategory,
        subcategories
    );
    if (!normalizedSubcategory) {
        notFound();
    }

    const title = deslugify(slug);
    const getRandomSubcategory = () => {
        const subcategories = CATEGORY_SUBCATEGORIES[lowerCategory];
        return subcategories[Math.floor(Math.random() * subcategories.length)];
    };

    return {
        title,
        content: `Lorem ipsum dolor sit amet consectetur adipisicing elit. Maxime mollitia,
        molestiae quas vel sint commodi repudiandae consequuntur voluptatum laborum
        numquam blanditiis harum quisquam eius sed odit fugiat iusto fuga praesentium
        optio, eaque rerum! Provident similique accusantium nemo autem...`,
        category: category.charAt(0).toUpperCase() + category.slice(1),
        subcategory: normalizedSubcategory,
        author: 'John Doe',
        publishDate: new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }),
        image: '/api/placeholder/1200/600',
        tags: [
            normalizedSubcategory,
            category.charAt(0).toUpperCase() + category.slice(1),
            'Featured',
            'Latest News',
        ],
        relatedStories: Array.from({ length: 3 }, (_, i) => {
            const subcategory = getRandomSubcategory();
            return {
                title: `Related ${category} Story ${i + 1}`,
                slug: slugify(`Related ${category} Story ${i + 1}`),
                subcategory: slugify(subcategory),
            };
        }),
    };
}

export async function generateMetadata({
    params: paramsPromise,
}: {
    params: Promise<Params>;
}): Promise<Metadata> {
    try {
        const newsData = await getNewsData(paramsPromise);
        const description = newsData.content.substring(0, 160) + '...';

        return {
            title: `${newsData.title} - ${newsData.category} News - GOAT`,
            description,
            openGraph: {
                title: newsData.title,
                description,
                type: 'article',
                authors: [newsData.author],
                publishedTime: new Date().toISOString(),
                section: newsData.category
            },
        };
    } catch {
        return {
            title: 'Not Found - GOAT NEWS',
            description: 'The requested article could not be found.',
        };
    }
}

const ShareButton = ({ children }: { children: React.ReactNode }) => (
    <button className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
        {children}
    </button>
);

export default async function NewsPage({
    params: paramsPromise,
}: {
    params: Promise<Params>;
}) {
    const params = await paramsPromise;
    const newsData = await getNewsData(paramsPromise);

    return (
        <div className="min-h-screen pt-24 pb-8">
            <article className="container mx-auto px-4">
                {/* Breadcrumb Navigation */}
                <div className="max-w-4xl mx-auto mb-8">
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/">Home</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbLink href={`/${newsData.category.toLowerCase()}`}>
                                    {newsData.category}
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbLink href={`/${newsData.category.toLowerCase()}/${params.subcategories}`}>
                                    {newsData.subcategory}
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>{newsData.title}</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>

                {/* Article Header */}
                <header className="max-w-4xl mx-auto mb-8">
                    <div className="space-y-4">
                        {/* Tags */}
                        <div className="flex flex-wrap gap-2">
                            {newsData.tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-3 py-1 rounded-full text-sm"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>

                        {/* Title */}
                        <h1 className="text-4xl md:text-5xl font-bold text-black dark:text-white leading-tight">
                            {newsData.title}
                        </h1>

                        {/* Author and Date */}
                        <div className="flex flex-wrap items-center gap-4 text-zinc-600 dark:text-zinc-400">
                            <div className="flex items-center gap-2">
                                <div className="h-10 w-10 rounded-full bg-zinc-200 dark:bg-zinc-700" />
                                <span className="font-medium">
                                    {newsData.author}
                                </span>
                            </div>
                            <span>•</span>
                            <time dateTime={new Date().toISOString()}>
                                {newsData.publishDate}
                            </time>
                        </div>
                    </div>
                </header>

                {/* Main Image */}
                <div className="max-w-4xl mx-auto mb-8">
                    <div className="aspect-video relative rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                        <Image
                            src="/api/placeholder/1200/600"
                            alt={newsData.title}
                            className="w-full h-full object-cover"
                            fill
                        />
                    </div>
                </div>

                {/* Article Content */}
                <div className="max-w-4xl mx-auto mb-16">
                    <div className="prose prose-lg prose-zinc dark:prose-invert max-w-none">
                        {newsData.content
                            .split('\n\n')
                            .map((paragraph, index) => (
                                <p key={index}>{paragraph.trim()}</p>
                            ))}
                    </div>

                    {/* Tags and Share Section */}
                    <div className="mt-8 pt-8 border-t border-zinc-200 dark:border-zinc-800">
                        <div className="flex flex-wrap justify-between items-center gap-4">
                            {/* Tags */}
                            <div className="flex flex-wrap gap-2">
                                {newsData.tags.map((tag) => (
                                    <Link
                                        key={tag}
                                        href="#"
                                        className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400"
                                    >
                                        #{tag.toLowerCase().replace(/\s+/g, '')}
                                    </Link>
                                ))}
                            </div>

                            {/* Share buttons */}
                            <div className="flex items-center gap-2">
                                <ShareButton>Share</ShareButton>
                                <ShareButton>Tweet</ShareButton>
                                <ShareButton>Copy Link</ShareButton>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related Stories */}
                <section className="max-w-4xl mx-auto">
                    <h2 className="text-2xl font-bold mb-6 text-black dark:text-white">
                        Related Stories
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {newsData.relatedStories.map((story) => (
                            <Link
                                key={story.slug}
                                href={`/${newsData.category.toLowerCase()}/${story.subcategory}/${story.slug}`}
                            >
                                <Card className="group h-full p-4 hover:shadow-lg transition-all duration-300 bg-zinc-50 dark:bg-zinc-900">
                                    <div className="aspect-video bg-zinc-200 dark:bg-zinc-800 rounded-lg mb-4" />
                                    <h3 className="font-bold text-black dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                        {story.title}
                                    </h3>
                                    <p className="text-zinc-600 dark:text-zinc-400 mt-2 text-sm">
                                        Read full story
                                    </p>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </section>
            </article>
        </div>
    );
}
