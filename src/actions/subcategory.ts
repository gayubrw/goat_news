'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import type { SubCategory } from '@/types';
import { Prisma } from '@prisma/client';

// Validation schema for subcategory
const SubCategorySchema = z.object({
    title: z.string().min(1).max(100),
    description: z.string().min(1).max(200),
    categoryId: z.string().min(1)
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
    const subCategories = await prisma.subCategory.findMany({
        select: { path: true }
    });
    return subCategories.map(s => s.path);
}

function handleError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
            case 'P2002':
                throw new Error('A subcategory with this path already exists');
            case 'P2025':
                throw new Error('Subcategory not found');
            case 'P2003':
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

export async function getSubCategories(categoryId?: string): Promise<SubCategory[]> {
    try {
        const where = categoryId ? { categoryId } : undefined;
        const subCategories = await prisma.subCategory.findMany({
            where,
            include: {
                category: true,
                news: true
            }
        });
        return subCategories as SubCategory[];
    } catch (error) {
        handleError(error);
    }
}

export async function getSubCategory(id: string): Promise<SubCategory | null> {
    try {
        const subCategory = await prisma.subCategory.findUnique({
            where: { id },
            include: {
                category: true,
                news: true
            }
        });
        return subCategory as SubCategory;
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

        // Verify that the category exists
        const category = await prisma.category.findUnique({
            where: { id: data.categoryId }
        });
        if (!category) {
            throw new Error('Category not found');
        }

        const existingPaths = await getAllExistingPaths();
        const pathGenerator = new PathGenerator(existingPaths);
        const path = pathGenerator.generatePath(data.title);

        const subCategory = await prisma.subCategory.create({
            data: {
                ...validation.data,
                path
            },
            include: {
                category: true,
                news: true
            }
        });

        revalidatePath('/subcategories');
        return subCategory as SubCategory;
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

        // Verify that the category exists
        const category = await prisma.category.findUnique({
            where: { id: data.categoryId }
        });
        if (!category) {
            throw new Error('Category not found');
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
                path
            },
            include: {
                category: true,
                news: true
            }
        });

        revalidatePath('/subcategories');
        return subCategory as SubCategory;
    } catch (error) {
        handleError(error);
    }
}

export async function deleteSubCategory(id: string): Promise<SubCategory> {
    try {
        const subCategory = await prisma.subCategory.delete({
            where: { id },
            include: {
                category: true,
                news: true
            }
        });

        revalidatePath('/subcategories');
        return subCategory as SubCategory;
    } catch (error) {
        handleError(error);
    }
}
