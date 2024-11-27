'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import type { Category, SubCategory } from '@/types';
import { Prisma } from '@prisma/client';

// Updated schemas to remove path since it will be auto-generated
const CategorySchema = z.object({
    title: z.string().min(1).max(100),
    description: z.string().min(1).max(200),
});

const SubCategorySchema = CategorySchema.extend({
    categoryId: z.string().min(1),
});

// Path generator utility class
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

// Helper function to get all existing paths
async function getAllExistingPaths(): Promise<string[]> {
    const [categories, subCategories] = await Promise.all([
        prisma.category.findMany({ select: { path: true } }),
        prisma.subCategory.findMany({ select: { path: true } })
    ]);

    return [
        ...categories.map(c => c.path),
        ...subCategories.map(s => s.path)
    ];
}

function handleError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
            case 'P2002':
                throw new Error('A category with this path already exists');
            case 'P2025':
                throw new Error('Category not found');
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

export async function getCategories(): Promise<Category[]> {
    try {
        const categories = await prisma.category.findMany({
            include: {
                subCategories: {
                    include: {
                        news: true,
                        category: true,
                    },
                },
            },
        });
        return categories as Category[];
    } catch (error) {
        handleError(error);
    }
}

export async function createCategory(
    data: z.infer<typeof CategorySchema>
): Promise<Category> {
    try {
        const validation = CategorySchema.safeParse(data);
        if (!validation.success) {
            throw new z.ZodError(validation.error.errors);
        }

        const existingPaths = await getAllExistingPaths();
        const pathGenerator = new PathGenerator(existingPaths);
        const path = pathGenerator.generatePath(data.title);

        const category = await prisma.category.create({
            data: {
                ...validation.data,
                path,
            },
            include: {
                subCategories: {
                    include: {
                        news: true,
                        category: true,
                    },
                },
            },
        });

        revalidatePath('/categories');
        return category as Category;
    } catch (error) {
        handleError(error);
    }
}

export async function createSubCategory(
    data: z.infer<typeof SubCategorySchema>
): Promise<SubCategory> {
    try {
        const validation = SubCategorySchema.safeParse(data);
        if (!validation.success) {
            throw new z.ZodError(validation.error.errors);
        }

        const existingPaths = await getAllExistingPaths();
        const pathGenerator = new PathGenerator(existingPaths);
        const path = pathGenerator.generatePath(data.title);

        const subCategory = await prisma.subCategory.create({
            data: {
                ...validation.data,
                path,
            },
            include: {
                news: true,
                category: {
                    include: {
                        subCategories: true,
                    },
                },
            },
        });

        revalidatePath('/categories');
        return subCategory as SubCategory;
    } catch (error) {
        handleError(error);
    }
}

export async function updateCategory(
    id: string,
    data: z.infer<typeof CategorySchema>
): Promise<Category> {
    try {
        const validation = CategorySchema.safeParse(data);
        if (!validation.success) {
            throw new z.ZodError(validation.error.errors);
        }

        const existingPaths = await getAllExistingPaths();
        const currentCategory = await prisma.category.findUnique({
            where: { id },
            select: { path: true }
        });

        // Remove current path from existing paths to allow keeping same path if title hasn't changed
        const filteredPaths = existingPaths.filter(p => p !== currentCategory?.path);
        const pathGenerator = new PathGenerator(filteredPaths);
        const path = pathGenerator.generatePath(data.title);

        const category = await prisma.category.update({
            where: { id },
            data: {
                ...validation.data,
                path,
            },
            include: {
                subCategories: {
                    include: {
                        news: true,
                        category: true,
                    },
                },
            },
        });

        revalidatePath('/categories');
        return category as Category;
    } catch (error) {
        handleError(error);
    }
}

export async function updateSubCategory(
    id: string,
    data: z.infer<typeof SubCategorySchema>
): Promise<SubCategory> {
    try {
        const validation = SubCategorySchema.safeParse(data);
        if (!validation.success) {
            throw new z.ZodError(validation.error.errors);
        }

        const existingPaths = await getAllExistingPaths();
        const currentSubCategory = await prisma.subCategory.findUnique({
            where: { id },
            select: { path: true }
        });

        // Remove current path from existing paths to allow keeping same path if title hasn't changed
        const filteredPaths = existingPaths.filter(p => p !== currentSubCategory?.path);
        const pathGenerator = new PathGenerator(filteredPaths);
        const path = pathGenerator.generatePath(data.title);

        const subCategory = await prisma.subCategory.update({
            where: { id },
            data: {
                ...validation.data,
                path,
            },
            include: {
                news: true,
                category: {
                    include: {
                        subCategories: true,
                    },
                },
            },
        });

        revalidatePath('/categories');
        return subCategory as SubCategory;
    } catch (error) {
        handleError(error);
    }
}

export async function deleteCategory(id: string): Promise<Category> {
    try {
        const category = await prisma.category.delete({
            where: { id },
            include: {
                subCategories: {
                    include: {
                        news: true,
                        category: true,
                    },
                },
            },
        });

        revalidatePath('/categories');
        return category as Category;
    } catch (error) {
        handleError(error);
    }
}

export async function deleteSubCategory(id: string): Promise<SubCategory> {
    try {
        const subCategory = await prisma.subCategory.delete({
            where: { id },
            include: {
                news: true,
                category: {
                    include: {
                        subCategories: true,
                    },
                },
            },
        });

        revalidatePath('/categories');
        return subCategory as SubCategory;
    } catch (error) {
        handleError(error);
    }
}
