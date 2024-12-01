'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import type { Category, SubCategory } from '@/types';
import { Prisma } from '@prisma/client';
import { getCurrentUserData } from './user';
import { CATEGORY_ACTIONS, createLog } from '@/lib/log';

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
            case 'P2003':
                throw new Error('Cannot delete this item because it is referenced by other records. Please delete related items first.');
            default:
                console.error('Prisma Error:', error);
                throw new Error(`Database operation failed: ${error.message}`);
        }
    } else if (error instanceof z.ZodError) {
        throw new Error(`Validation error: ${error.errors[0].message}`);
    } else if (error instanceof Error) {
        throw new Error(error.message);
    } else {
        console.error('Unknown Error:', error);
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

        const currentUser = await getCurrentUserData();
        if (!currentUser) throw new Error('User not authenticated');

        const existingPaths = await getAllExistingPaths();
        const pathGenerator = new PathGenerator(existingPaths);
        const path = pathGenerator.generatePath(data.title);

        const category = await prisma.$transaction(async (tx) => {
            const newCategory = await tx.category.create({
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

            await createLog(tx, {
                userId: currentUser.id,
                action: CATEGORY_ACTIONS.CATEGORY_CREATED,
                description: `Category "${data.title}" created`,
                metadata: {
                    categoryId: newCategory.id,
                    categoryTitle: newCategory.title,
                    categoryPath: newCategory.path
                }
            });

            return newCategory;
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

        const currentUser = await getCurrentUserData();
        if (!currentUser) throw new Error('User not authenticated');

        const existingPaths = await getAllExistingPaths();
        const pathGenerator = new PathGenerator(existingPaths);
        const path = pathGenerator.generatePath(data.title);

        const subCategory = await prisma.$transaction(async (tx) => {
            const newSubCategory = await tx.subCategory.create({
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

            await createLog(tx, {
                userId: currentUser.id,
                action: CATEGORY_ACTIONS.SUBCATEGORY_CREATED,
                description: `Subcategory "${data.title}" created under category "${newSubCategory.category.title}"`,
                metadata: {
                    subCategoryId: newSubCategory.id,
                    subCategoryTitle: newSubCategory.title,
                    subCategoryPath: newSubCategory.path,
                    categoryId: newSubCategory.category.id,
                    categoryTitle: newSubCategory.category.title
                }
            });

            return newSubCategory;
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

        const currentUser = await getCurrentUserData();
        if (!currentUser) throw new Error('User not authenticated');

        const existingPaths = await getAllExistingPaths();
        const currentCategory = await prisma.category.findUnique({
            where: { id },
            select: { path: true, title: true }
        });

        if (!currentCategory) throw new Error('Category not found');

        const filteredPaths = existingPaths.filter(p => p !== currentCategory.path);
        const pathGenerator = new PathGenerator(filteredPaths);
        const path = pathGenerator.generatePath(data.title);

        const category = await prisma.$transaction(async (tx) => {
            const updatedCategory = await tx.category.update({
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

            await createLog(tx, {
                userId: currentUser.id,
                action: CATEGORY_ACTIONS.CATEGORY_UPDATED,
                description: `Category "${currentCategory.title}" updated to "${data.title}"`,
                metadata: {
                    categoryId: updatedCategory.id,
                    oldTitle: currentCategory.title,
                    newTitle: updatedCategory.title,
                    oldPath: currentCategory.path,
                    newPath: updatedCategory.path,
                    changes: {
                        title: currentCategory.title !== data.title,
                        description: true // Always true since we can't easily compare with old description
                    }
                }
            });

            return updatedCategory;
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

        const currentUser = await getCurrentUserData();
        if (!currentUser) throw new Error('User not authenticated');

        const existingPaths = await getAllExistingPaths();
        const currentSubCategory = await prisma.subCategory.findUnique({
            where: { id },
            select: {
                path: true,
                title: true,
                category: {
                    select: {
                        id: true,
                        title: true
                    }
                }
            }
        });

        if (!currentSubCategory) throw new Error('Subcategory not found');

        const filteredPaths = existingPaths.filter(p => p !== currentSubCategory.path);
        const pathGenerator = new PathGenerator(filteredPaths);
        const path = pathGenerator.generatePath(data.title);

        const subCategory = await prisma.$transaction(async (tx) => {
            const updatedSubCategory = await tx.subCategory.update({
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

            await createLog(tx, {
                userId: currentUser.id,
                action: CATEGORY_ACTIONS.SUBCATEGORY_UPDATED,
                description: `Subcategory "${currentSubCategory.title}" updated to "${data.title}" under category "${currentSubCategory.category.title}"`,
                metadata: {
                    subCategoryId: updatedSubCategory.id,
                    oldTitle: currentSubCategory.title,
                    newTitle: updatedSubCategory.title,
                    oldPath: currentSubCategory.path,
                    newPath: updatedSubCategory.path,
                    categoryId: currentSubCategory.category.id,
                    categoryTitle: currentSubCategory.category.title,
                    changes: {
                        title: currentSubCategory.title !== data.title,
                        description: true, // Always true since we can't easily compare with old description
                        categoryId: currentSubCategory.category.id !== data.categoryId
                    }
                }
            });

            return updatedSubCategory;
        });

        revalidatePath('/categories');
        return subCategory as SubCategory;
    } catch (error) {
        handleError(error);
    }
}

export async function deleteCategory(id: string): Promise<Category> {
    try {
        const currentUser = await getCurrentUserData();
        if (!currentUser) throw new Error('User not authenticated');

        const category = await prisma.$transaction(async (tx) => {
            const categoryToDelete = await tx.category.findUnique({
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

            if (!categoryToDelete) throw new Error('Category not found');

            const deletedCategory = await tx.category.delete({
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

            await createLog(tx, {
                userId: currentUser.id,
                action: CATEGORY_ACTIONS.CATEGORY_DELETED,
                description: `Category "${categoryToDelete.title}" deleted`,
                metadata: {
                    categoryId: deletedCategory.id,
                    categoryTitle: deletedCategory.title,
                    categoryPath: deletedCategory.path,
                    affectedSubCategories: deletedCategory.subCategories.map(sub => ({
                        id: sub.id,
                        title: sub.title
                    }))
                }
            });

            return deletedCategory;
        });

        revalidatePath('/categories');
        return category as Category;
    } catch (error) {
        handleError(error);
    }
}

export async function deleteSubCategory(id: string): Promise<SubCategory> {
    try {
        const currentUser = await getCurrentUserData();
        if (!currentUser) throw new Error('User not authenticated');

        const subCategory = await prisma.$transaction(async (tx) => {
            const subCategoryToDelete = await tx.subCategory.findUnique({
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

            if (!subCategoryToDelete) throw new Error('Subcategory not found');

            const deletedSubCategory = await tx.subCategory.delete({
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

            await createLog(tx, {
                userId: currentUser.id,
                action: CATEGORY_ACTIONS.SUBCATEGORY_DELETED,
                description: `Subcategory "${subCategoryToDelete.title}" deleted from category "${subCategoryToDelete.category.title}"`,
                metadata: {
                    subCategoryId: deletedSubCategory.id,
                    subCategoryTitle: deletedSubCategory.title,
                    subCategoryPath: deletedSubCategory.path,
                    categoryId: deletedSubCategory.category.id,
                    categoryTitle: deletedSubCategory.category.title,
                    affectedNews: deletedSubCategory.news.map(news => ({
                        id: news.id,
                        title: news.title
                    }))
                }
            });

            return deletedSubCategory;
        });

        revalidatePath('/categories');
        return subCategory as SubCategory;
    } catch (error) {
        handleError(error);
    }
}
