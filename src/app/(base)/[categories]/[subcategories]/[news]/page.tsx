import { Metadata } from 'next';
import { Card } from '@/components/ui/card';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { getNews } from '@/actions/news';
import { getClerkUser, getCurrentUserData } from '@/actions/user';
import { format } from 'date-fns';
import {
    CopyLinkButton,
    ShareNativeButton,
    TwitterShareButton,
} from '@/components/share-button';
import { isNewsLiked } from '@/actions/like';
import LikeButton from '@/components/like-button';
import BookmarkButton from '@/components/bookmark-button';
import { getUserCollections } from '@/actions/collection';

type Params = {
    categories: string;
    subcategories: string;
    news: string;
};

async function getNewsData(
    categories: string,
    subcategories: string,
    news: string
) {
    try {
        const allNews = await getNews();
        const newsItem = allNews.find((n) => n.path === news);

        if (!newsItem) {
            notFound();
        }

        if (
            newsItem.subCategory.category.path !== categories ||
            newsItem.subCategory.path !== subcategories
        ) {
            notFound();
        }

        return newsItem;
    } catch (error) {
        console.error('Error fetching news data:', error);
        notFound();
    }
}

export async function generateMetadata({
    params: paramsPromise,
}: {
    params: Promise<Params>;
}): Promise<Metadata> {
    try {
        const params = await paramsPromise;
        const newsData = await getNewsData(
            params.categories,
            params.subcategories,
            params.news
        );
        let authorName = newsData.user.role || 'Author';

        try {
            const authorData = await getClerkUser(newsData.user.clerkId);
            if (authorData) {
                authorName = `${authorData.firstName} ${authorData.lastName}`;
            }
        } catch (error) {
            console.error('Failed to fetch author data:', error);
        }

        return {
            title: `${newsData.title} - ${newsData.subCategory.category.title} News - GOAT`,
            description: newsData.description,
            openGraph: {
                title: newsData.title,
                description: newsData.description,
                type: 'article',
                authors: [authorName],
                publishedTime: newsData.createdAt.toISOString(),
                section: newsData.subCategory.category.title,
            },
        };
    } catch {
        return {
            title: 'Not Found - GOAT NEWS',
            description: 'The requested article could not be found.',
        };
    }
}

export default async function NewsPage({
    params: paramsPromise,
}: {
    params: Promise<Params>;
}) {
    const params = await paramsPromise;
    const newsData = await getNewsData(
        params.categories,
        params.subcategories,
        params.news
    );
    let authorData = null;

    // Get user and bookmark data
    const user = await getCurrentUserData();
    const collections = await getUserCollections();

    // Get bookmark details
    const bookmarkDetails = await (async () => {
        if (!user) return { isBookmarked: false, bookmarkId: undefined, collectionId: undefined };

        const userInteraction = await prisma.userInteraction.findFirst({
            where: { userId: user.id },
            include: {
                collections: {
                    include: {
                        bookmarks: {
                            include: {
                                newsInteraction: true
                            }
                        }
                    }
                }
            }
        });

        if (!userInteraction) {
            return { isBookmarked: false, bookmarkId: undefined, collectionId: undefined };
        }

        for (const collection of userInteraction.collections) {
            const bookmark = collection.bookmarks.find(
                b => b.newsInteraction.newsId === newsData.id
            );
            if (bookmark) {
                return {
                    isBookmarked: true,
                    bookmarkId: bookmark.id,
                    collectionId: collection.id
                };
            }
        }

        return { isBookmarked: false, bookmarkId: undefined, collectionId: undefined };
    })();

    try {
        authorData = await getClerkUser(newsData.user.clerkId);
    } catch (error) {
        console.error('Failed to fetch author data:', error);
    }

    // Get related news from the same subcategory
    const relatedNews = (await getNews(newsData.subCategoryId))
        .filter((news) => news.id !== newsData.id)
        .slice(0, 3);

    const isLiked = await isNewsLiked(newsData.id);

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
                                <BreadcrumbLink
                                    href={`/${newsData.subCategory.category.path}`}
                                >
                                    {newsData.subCategory.category.title}
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbLink
                                    href={`/${newsData.subCategory.category.path}/${newsData.subCategory.path}`}
                                >
                                    {newsData.subCategory.title}
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>
                                    {newsData.title}
                                </BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>

                {/* Article Header */}
                <header className="max-w-4xl mx-auto mb-8">
                    <div className="space-y-4">
                        {/* Title */}
                        <h1 className="text-4xl md:text-5xl font-bold text-black dark:text-white leading-tight">
                            {newsData.title}
                        </h1>

                        {/* Author and Date */}
                        <div className="flex flex-wrap items-center gap-4 text-zinc-600 dark:text-zinc-400">
                            <div className="flex items-center gap-2">
                                {authorData?.imageUrl ? (
                                    <Image
                                        src={authorData.imageUrl}
                                        alt={`${authorData.firstName} ${authorData.lastName}`}
                                        width={40}
                                        height={40}
                                        className="rounded-full h-[40px] w-[40px] object-cover"
                                    />
                                ) : (
                                    <div className="h-10 w-10 rounded-full bg-zinc-200 dark:bg-zinc-700" />
                                )}
                                <div className="flex flex-col">
                                    <span className="font-medium">
                                        {authorData
                                            ? `${authorData.firstName} ${authorData.lastName}`
                                            : newsData.user.role || 'Author'}
                                    </span>
                                    {authorData?.email && (
                                        <span className="text-sm text-zinc-500 dark:text-zinc-400">
                                            {authorData.email}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <span>•</span>
                            <time dateTime={newsData.createdAt.toISOString()}>
                                {format(newsData.createdAt, 'PPpp')}
                            </time>
                        </div>
                    </div>
                </header>

                {/* Main Image */}
                {newsData.thumbnailUrl && (
                    <div className="max-w-4xl mx-auto mb-8">
                        <div className="aspect-video relative rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                            <Image
                                src={newsData.thumbnailUrl}
                                alt={newsData.title}
                                className="w-full h-full object-cover"
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                        </div>
                    </div>
                )}

                {/* Article Content */}
                <div className="max-w-4xl mx-auto mb-16">
                    {/* Description */}
                    <div className="prose prose-lg prose-zinc dark:prose-invert max-w-none mb-8">
                        <p>{newsData.description}</p>
                    </div>

                    {/* Sections */}
                    <div className="space-y-8">
                        {newsData.sections
                            .sort((a, b) => a.order - b.order)
                            .map((section) => (
                                <div key={section.id}>
                                    {section.isSeparator ? (
                                        <hr className="border-zinc-200 dark:border-zinc-800" />
                                    ) : (
                                        <>
                                            {section.title && (
                                                <h2 className="text-2xl font-semibold mb-4 text-foreground">
                                                    {section.title}
                                                </h2>
                                            )}
                                            {section.sectionTexts.map(
                                                (text) => (
                                                    <div
                                                        key={text.id}
                                                        className="prose prose-lg prose-zinc dark:prose-invert max-w-none"
                                                    >
                                                        <div
                                                            dangerouslySetInnerHTML={{
                                                                __html: text.text,
                                                            }}
                                                        />
                                                    </div>
                                                )
                                            )}
                                            {section.sectionImages.map(
                                                (image) => (
                                                    <figure
                                                        key={image.id}
                                                        className="my-8"
                                                    >
                                                        <div className="aspect-video relative rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                                                            <Image
                                                                src={image.imageUrl}
                                                                alt={image.alt}
                                                                className="w-full h-full object-cover"
                                                                fill
                                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                            />
                                                        </div>
                                                        {image.description && (
                                                            <figcaption className="mt-2 text-center text-sm text-zinc-600 dark:text-zinc-400">
                                                                {image.description}
                                                            </figcaption>
                                                        )}
                                                    </figure>
                                                )
                                            )}
                                        </>
                                    )}
                                </div>
                            ))}
                    </div>

                    {/* Share Section */}
                    <div className="mt-8 pt-8 border-t border-zinc-200 dark:border-zinc-800">
                        <div className="flex justify-between items-center gap-2">
                            <div className="flex gap-2">
                                <LikeButton newsId={newsData.id} initialIsLiked={isLiked} />
                                <BookmarkButton
                                    newsId={newsData.id}
                                    initialIsBookmarked={bookmarkDetails.isBookmarked}
                                    initialBookmarkId={bookmarkDetails.bookmarkId ?? undefined}
                                    initialCollectionId={bookmarkDetails.collectionId ?? undefined}
                                    collections={collections}
                                />
                            </div>
                            <div>
                                <ShareNativeButton
                                    title={newsData.title}
                                    description={newsData.description}
                                />
                                <TwitterShareButton title={newsData.title} />
                                <CopyLinkButton />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related Stories */}
                {relatedNews.length > 0 && (
                    <section className="max-w-4xl mx-auto">
                        <h2 className="text-2xl font-bold mb-6 text-black dark:text-white">
                            Related Stories
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {relatedNews.map((story) => (
                                <Link
                                    key={story.id}
                                    href={`/${story.subCategory.category.path}/${story.subCategory.path}/${story.path}`}
                                >
                                    <Card className="group h-full p-4 hover:shadow-lg transition-all duration-300 bg-zinc-50 dark:bg-zinc-900">
                                        {story.thumbnailUrl ? (
                                            <div className="aspect-video relative bg-zinc-200 dark:bg-zinc-800 rounded-lg mb-4">
                                                <Image
                                                    src={story.thumbnailUrl}
                                                    alt={story.title}
                                                    className="object-cover rounded-lg"
                                                    fill
                                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                                                />
                                            </div>
                                        ) : (
                                            <div className="aspect-video bg-zinc-200 dark:bg-zinc-800 rounded-lg mb-4" />
                                        )}
                                        <h3 className="font-bold text-black dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                            {story.title}
                                        </h3>
                                        <p className="text-zinc-600 dark:text-zinc-400 mt-2 text-sm">
                                            {story.description}
                                        </p>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}
            </article>
        </div>
    );
}
