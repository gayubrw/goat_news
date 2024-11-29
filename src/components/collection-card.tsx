// components/collection-card.tsx
'use client'

import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'
import { Clock, MoreVertical, BookmarkPlus } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useState } from 'react'
import { DeleteCollectionDialog } from './delete-collection-dialog'
import type { CollectionWithBookmarks } from '@/app/(base)/collections/page'
import { EditCollectionDialog } from './edit-collection-dialog'

interface NewsCardProps {
  bookmark: CollectionWithBookmarks['bookmarks'][0]
}

function NewsCard({ bookmark }: NewsCardProps) {
  const news = bookmark.newsInteraction.news
  const category = news.subCategory.category
  const subcategory = news.subCategory

  return (
    <Link
      href={`/${category.path}/${subcategory.path}/${news.path}`}
      className="block"
    >
      <Card className="group overflow-hidden h-full">
        <CardContent className="p-0">
          <div className="relative h-[200px]">
            <Image
              src={news.thumbnailUrl || '/api/placeholder/400/200'}
              alt={news.title}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700"
              width={400}
              height={200}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-4">
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-primary transition-colors line-clamp-2">
                {news.title}
              </h3>
              <div className="flex items-center gap-2 text-zinc-300">
                <Clock className="w-4 h-4" />
                <span className="text-sm">
                  {formatDistanceToNow(new Date(news.createdAt), { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

export default function CollectionCard({ collection }: { collection: CollectionWithBookmarks }) {
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const previewBookmarks = collection.bookmarks.slice(0, 4)
  const remainingCount = Math.max(0, collection.bookmarks.length - 4)

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">{collection.name}</h2>
            <p className="text-muted-foreground mt-1">{collection.description}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
                Edit Collection
                </DropdownMenuItem>
                <DropdownMenuItem
                className="text-destructive"
                onClick={() => setDeleteDialogOpen(true)}
                >
                Delete Collection
                </DropdownMenuItem>
            </DropdownMenuContent>
            </DropdownMenu>
        </div>

        {collection.bookmarks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground border-2 border-dashed rounded-lg">
            <BookmarkPlus className="w-12 h-12 mb-4" />
            <p>No bookmarks yet</p>
            <p className="text-sm">Start saving news to this collection</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4">
              {previewBookmarks.map((bookmark) => (
                <NewsCard key={bookmark.id} bookmark={bookmark} />
              ))}
            </div>
            {remainingCount > 0 && (
              <CardFooter className="px-0 pt-4 pb-0">
                <Button variant="outline" className="w-full">
                  View {remainingCount} more items
                </Button>
              </CardFooter>
            )}
          </>
        )}
      </CardContent>

      <EditCollectionDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        collection={collection}
    />

      <DeleteCollectionDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        collectionId={collection.id}
        collectionName={collection.name}
      />
    </Card>
  )
}
