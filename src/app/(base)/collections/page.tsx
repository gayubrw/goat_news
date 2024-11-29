export const dynamic = 'force-dynamic'

import { Metadata } from 'next'
import { getUserCollections } from '@/actions/collection'
import { Card, CardContent } from '@/components/ui/card'
import { Bookmark } from 'lucide-react'
import type { Bookmark as BookmarkType, Collection, News, Category, SubCategory } from '@/types'
import CreateCollectionDialog from '@/components/create-collection-dialog'
import CollectionCard from '@/components/collection-card'

export const metadata: Metadata = {
  title: 'My Collections - GOAT',
  description: 'View and manage your saved news collections',
}

type NewsWithRelations = News & {
  subCategory: SubCategory & {
    category: Category
  }
}

type BookmarkWithNews = BookmarkType & {
  newsInteraction: {
    news: NewsWithRelations
  }
}

export type CollectionWithBookmarks = Collection & {
  bookmarks: BookmarkWithNews[]
}

export default async function CollectionsPage() {
  const collections = await getUserCollections() as CollectionWithBookmarks[]

  if (collections.length === 0) {
    return (
      <div className="container mx-auto py-24">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">My Collections</h1>
          <CreateCollectionDialog />
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
            <Bookmark className="w-16 h-16 mb-4" />
            <h2 className="text-2xl font-bold mb-2">No Collections Yet</h2>
            <p>You haven&apos;t created any collections yet.</p>
            <p className="text-sm">Collections help you organize your saved news articles.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-24">
      <header className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-4xl font-bold">My Collections</h1>
          <CreateCollectionDialog />
        </div>
        <p className="text-lg text-muted-foreground">
          Browse and manage your saved news collections
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6">
        {collections.map((collection) => (
          <CollectionCard key={collection.id} collection={collection} />
        ))}
      </div>
    </div>
  )
}
