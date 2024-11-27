'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import type { News } from '@/types';
import { Prisma } from '@prisma/client';

// Validation schemas for each content type
const SectionImageSchema = z.object({
    imageUrl: z.string().min(1).max(1000),
    alt: z.string().min(1).max(50),
    description: z.string().min(1).max(150)
});

const SectionTextSchema = z.object({
    text: z.string().min(1)
});

const SectionSchema = z.object({
    id: z.string().optional(),
    order: z.number().min(0),
    isSeparator: z.boolean(),
    content: z.discriminatedUnion('type', [
        z.object({ type: z.literal('text'), data: SectionTextSchema }),
        z.object({ type: z.literal('image'), data: SectionImageSchema })
    ])
});

const NewsSchema = z.object({
    title: z.string().min(1).max(200),
    description: z.string().min(1).max(200),
    thumbnailUrl: z.string().max(1000).optional(),
    subCategoryId: z.string().min(1),
    userId: z.string().min(1),
    sections: z.array(SectionSchema)
});

// Path generator utility
class PathGenerator {
    private readonly maxLength: number;
    private readonly separator: string;
    private existingPaths: Set<string>;

    constructor(existingPaths: string[] = [], maxLength = 100) {
        this.maxLength = maxLength;
        this.separator = '-';
        this.existingPaths = new Set(existingPaths);
    }

    private slugify(text: string): string {
        return text
            .toString()
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_]+/g, this.separator)
            .replace(new RegExp(`${this.separator}+`, 'g'), this.separator)
            .replace(new RegExp(`^${this.separator}|${this.separator}$`, 'g'), '');
    }

    private makeUnique(basePath: string): string {
        let path = basePath;
        let counter = 1;

        if (path.length > this.maxLength) {
            path = path.substring(0, this.maxLength - 3);
        }

        let finalPath = path;
        while (this.existingPaths.has(finalPath)) {
            finalPath = `${path}${this.separator}${counter}`;
            counter++;

            if (finalPath.length > this.maxLength) {
                const suffix = `${this.separator}${counter}`;
                path = path.substring(0, this.maxLength - suffix.length);
                finalPath = path + suffix;
            }
        }

        return finalPath;
    }

    generatePath(title: string): string {
        const slugged = this.slugify(title);
        const uniquePath = this.makeUnique(slugged);
        this.existingPaths.add(uniquePath);
        return uniquePath;
    }
}

async function getAllExistingPaths(): Promise<string[]> {
    const news = await prisma.news.findMany({ select: { path: true } });
    return news.map(n => n.path);
}

function handleError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
            case 'P2002':
                throw new Error('A news with this path already exists');
            case 'P2025':
                throw new Error('News not found');
            case 'P2003':
                throw new Error('Referenced record not found');
            default:
                throw new Error(`Database error: ${error.code}`);
        }
    } else if (error instanceof z.ZodError) {
        throw new Error(`Validation error: ${error.errors[0].message}`);
    } else if (error instanceof Error) {
        throw new Error(error.message);
    } else {
        throw new Error('An unexpected error occurred');
    }
}

async function createSections(newsId: string, sections: z.infer<typeof SectionSchema>[]) {
    const createdSections = await Promise.all(
        sections.map(async (section) => {
            const createdSection = await prisma.section.create({
                data: {
                    order: section.order,
                    isSeparator: section.isSeparator,
                    newsId,
                },
            });

            if (section.content.type === 'text') {
                await prisma.sectionText.create({
                    data: {
                        text: section.content.data.text,
                        sectionId: createdSection.id,
                    },
                });
            } else if (section.content.type === 'image') {
                await prisma.sectionImage.create({
                    data: {
                        imageUrl: section.content.data.imageUrl,
                        alt: section.content.data.alt,
                        description: section.content.data.description,
                        sectionId: createdSection.id,
                    },
                });
            }

            return createdSection;
        })
    );

    return createdSections;
}

export async function updateSections(sections: z.infer<typeof SectionSchema>[]) {
    const updatedSections = await Promise.all(
        sections.map(async (section) => {
            if (!section.id) {
                throw new Error('Section ID is required for updates');
            }

            const updatedSection = await prisma.section.update({
                where: { id: section.id },
                data: {
                    order: section.order,
                    isSeparator: section.isSeparator,
                },
            });

            if (section.content.type === 'text') {
                await prisma.sectionText.updateMany({
                    where: { sectionId: section.id },
                    data: { text: section.content.data.text },
                });
            } else if (section.content.type === 'image') {
                await prisma.sectionImage.updateMany({
                    where: { sectionId: section.id },
                    data: {
                        imageUrl: section.content.data.imageUrl,
                        alt: section.content.data.alt,
                        description: section.content.data.description,
                    },
                });
            }

            return updatedSection;
        })
    );

    return updatedSections;
}

export async function getNews(subCategoryId?: string): Promise<News[]> {
    try {
        const where = subCategoryId ? { subCategoryId } : undefined;
        const news = await prisma.news.findMany({
            where,
            include: {
                user: true,
                subCategory: true,
                sections: {
                    include: {
                        sectionImages: true,
                        sectionTexts: true,
                    },
                    orderBy: {
                        order: 'asc',
                    },
                },
                newsInteractions: {
                    include: {
                        likes: true,
                        bookmarks: true,
                        comments: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        return news as News[];
    } catch (error) {
        handleError(error);
    }
}

export async function getNewsById(id: string): Promise<News | null> {
    try {
        const news = await prisma.news.findUnique({
            where: { id },
            include: {
                user: true,
                subCategory: true,
                sections: {
                    include: {
                        sectionImages: true,
                        sectionTexts: true,
                    },
                    orderBy: {
                        order: 'asc',
                    },
                },
                newsInteractions: {
                    include: {
                        likes: true,
                        bookmarks: true,
                        comments: true,
                    },
                },
            },
        });
        return news as News;
    } catch (error) {
        handleError(error);
    }
}

export async function createNews(data: z.infer<typeof NewsSchema>): Promise<News> {
    try {
        const validation = NewsSchema.safeParse(data);
        if (!validation.success) {
            throw new z.ZodError(validation.error.errors);
        }

        const existingPaths = await getAllExistingPaths();
        const pathGenerator = new PathGenerator(existingPaths);
        const path = pathGenerator.generatePath(data.title);

        const { sections, ...newsData } = validation.data;

        // Create news with basic data first
        const news = await prisma.news.create({
            data: {
                ...newsData,
                path,
                newsInteractions: {
                    create: {
                        popularityScore: 0,
                    },
                },
            },
        });

        // Create sections with their content
        await createSections(news.id, sections);

        // Fetch and return the complete news with all relations
        const completeNews = await getNewsById(news.id);
        if (!completeNews) throw new Error('Failed to create news');

        revalidatePath('/news');
        return completeNews;
    } catch (error) {
        handleError(error);
    }
}

export async function updateNews(id: string, data: z.infer<typeof NewsSchema>): Promise<News> {
    try {
        const validation = NewsSchema.safeParse(data);
        if (!validation.success) {
            throw new z.ZodError(validation.error.errors);
        }

        const existingPaths = await getAllExistingPaths();
        const currentNews = await prisma.news.findUnique({
            where: { id },
            select: { path: true }
        });

        const filteredPaths = existingPaths.filter(p => p !== currentNews?.path);
        const pathGenerator = new PathGenerator(filteredPaths);
        const path = pathGenerator.generatePath(data.title);

        const { sections, ...newsData } = validation.data;

        // Update the news basic data
        await prisma.news.update({
            where: { id },
            data: {
                ...newsData,
                path,
            },
        });

        // Delete existing sections and their content
        await prisma.section.deleteMany({
            where: { newsId: id },
        });

        // Create new sections with their content
        await createSections(id, sections);

        // Fetch and return the updated news with all relations
        const updatedNews = await getNewsById(id);
        if (!updatedNews) throw new Error('Failed to update news');

        revalidatePath('/news');
        return updatedNews;
    } catch (error) {
        handleError(error);
    }
}

export async function deleteNews(id: string): Promise<News> {
    try {
        const news = await prisma.news.delete({
            where: { id },
            include: {
                user: true,
                subCategory: true,
                sections: {
                    include: {
                        sectionImages: true,
                        sectionTexts: true,
                    },
                },
                newsInteractions: {
                    include: {
                        likes: true,
                        bookmarks: true,
                        comments: true,
                    },
                },
            },
        });

        revalidatePath('/news');
        return news as News;
    } catch (error) {
        handleError(error);
    }
}
