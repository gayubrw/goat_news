import { Prisma } from "@prisma/client";

export type User = {
    id: string;
    clerkId: string | null;
    role: string | null;
    createdAt: Date;
    updatedAt: Date;
    news: News[];
    userInteractions: UserInteraction[];
    logs: Log[];
};

export type Log = {
    id: string;
    userId: string;
    action: string;
    description: string;
    metadata: Prisma.JsonValue;
    createdAt: Date;
    updatedAt: Date;
    user: User;
};

export type News = {
    id: string;
    path: string;
    title: string;
    thumbnailUrl: string | null;
    description: string;
    updatedAt: Date;
    createdAt: Date;
    subCategoryId: string;
    userId: string;
    user: User;
    subCategory: SubCategory;
    sections: Section[];
    newsInteractions: NewsInteraction[];
};

export type Section = {
    id: string;
    order: number;
    title: string | null;
    isSeparator: boolean;
    updatedAt: Date;
    createdAt: Date;
    newsId: string;
    news: News;
    sectionImages: SectionImage[];
    sectionTexts: SectionText[];
};

export type SectionImage = {
    id: string;
    imageUrl: string;
    alt: string;
    description: string;
    updatedAt: Date;
    createdAt: Date;
    sectionId: string;
    section: Section;
};

export type SectionText = {
    id: string;
    text: string;
    updatedAt: Date;
    createdAt: Date;
    sectionId: string;
    section: Section;
};

export type Category = {
    id: string;
    path: string;
    title: string;
    description: string;
    updatedAt: Date;
    createdAt: Date;
    subCategories: SubCategory[];
};

export type SubCategory = {
    id: string;
    path: string;
    title: string;
    description: string;
    updatedAt: Date;
    createdAt: Date;
    categoryId: string;
    category: Category;
    news: News[];
};

export type UserInteraction = {
    id: string;
    contributionScore: number;
    updatedAt: Date;
    createdAt: Date;
    userId: string;
    user: User;
    likes: Like[];
    collections: Collection[];
    comments: Comment[];
};

export type NewsInteraction = {
    id: string;
    popularityScore: number;
    updatedAt: Date;
    createdAt: Date;
    newsId: string;
    news: News;
    likes: Like[];
    bookmarks: Bookmark[];
    comments: Comment[];
};

export type Like = {
    id: string;
    updatedAt: Date;
    createdAt: Date;
    newsInteractionId: string;
    userInteractionId: string;
    newsInteraction: NewsInteraction;
    userInteraction: UserInteraction;
};

export type Collection = {
    id: string;
    name: string;
    description: string;
    updatedAt: Date;
    createdAt: Date;
    userInteractionId: string;
    userInteraction: UserInteraction;
    bookmarks: Bookmark[];
};

export type Bookmark = {
    id: string;
    updatedAt: Date;
    createdAt: Date;
    newsInteractionId: string;
    collectionId: string;
    newsInteraction: NewsInteraction;
    collection: Collection;
};

export type Comment = {
    id: string;
    text: string;
    updatedAt: Date;
    createdAt: Date;
    newsInteractionId: string;
    userInteractionId: string;
    newsInteraction: NewsInteraction;
    userInteraction: UserInteraction;
};
