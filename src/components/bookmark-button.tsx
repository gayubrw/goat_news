"use client"

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Bookmark, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { addBookmark, removeBookmark, isNewsBookmarked } from '@/actions/bookmark';
import { createCollection, getUserCollections } from '@/actions/collection';

interface BookmarkButtonProps {
  newsId: string;
}

const BookmarkButton = ({ newsId }: BookmarkButtonProps) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkId, setBookmarkId] = useState<string | undefined>(undefined);
  const [currentCollectionId, setCurrentCollectionId] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCollection, setNewCollection] = useState({ name: '', description: '' });
  const [collections, setCollections] = useState<Array<{
    id: string;
    name: string;
    description: string;
    bookmarks: Array<{
      id: string;
      newsInteraction: {
        newsId: string;
      };
    }>;
  }>>([]);

  useEffect(() => {
    const initializeBookmarkStatus = async () => {
      try {
        const userCollections = await getUserCollections();
        setCollections(userCollections);

        const bookmarked = await isNewsBookmarked(newsId);
        setIsBookmarked(bookmarked);

        if (bookmarked) {
          for (const collection of userCollections) {
            const bookmark = collection.bookmarks.find(
              b => b.newsInteraction.newsId === newsId
            );
            if (bookmark) {
              setBookmarkId(bookmark.id);
              setCurrentCollectionId(collection.id);
              break;
            }
          }
        }
      } catch (error) {
        console.error('Failed to initialize bookmark status:', error);
        toast.error('Failed to load bookmark status');
      } finally {
        setIsLoading(false);
      }
    };

    initializeBookmarkStatus();
  }, [newsId, currentCollectionId]);

  const handleCreateCollection = async () => {
    try {
      setIsLoading(true);
      const collection = await createCollection(newCollection);

      if (isBookmarked && bookmarkId) {
        await removeBookmark(bookmarkId);
      }

      await addBookmark({ newsId, collectionId: collection.id });

      setIsBookmarked(true);
      setCurrentCollectionId(collection.id);
      setCollections(prev => [...prev, {
        ...collection,
        bookmarks: [{
          id: bookmarkId || 'temp-id',
          newsInteraction: { newsId }
        }]
      }]);

      setIsDialogOpen(false);
      setNewCollection({ name: '', description: '' });
      toast.success("Collection created and bookmark added");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create collection");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddBookmark = async (collectionId: string) => {
    try {
      setIsLoading(true);
      const collectionName = collections.find(c => c.id === collectionId)?.name || 'collection';

      if (isBookmarked && bookmarkId) {
        await removeBookmark(bookmarkId);
        await addBookmark({ newsId, collectionId });

        setCollections(prev => prev.map(collection => {
          if (collection.id === currentCollectionId) {
            return {
              ...collection,
              bookmarks: collection.bookmarks.filter(b => b.id !== bookmarkId)
            };
          }
          if (collection.id === collectionId) {
            return {
              ...collection,
              bookmarks: [...collection.bookmarks, { id: bookmarkId, newsInteraction: { newsId } }]
            };
          }
          return collection;
        }));

        setCurrentCollectionId(collectionId);
        toast.success(`Moved to ${collectionName}`);
      } else {
        const newBookmark = await addBookmark({ newsId, collectionId });
        if (newBookmark) {
            setIsBookmarked(true);
            setCurrentCollectionId(collectionId);
        }

        setCollections(prev => prev.map(collection => {
          if (collection.id === collectionId) {
            return {
              ...collection,
              bookmarks: [...collection.bookmarks, { id: 'temp-id', newsInteraction: { newsId } }]
            };
          }
          return collection;
        }));

        toast.success(`Added to ${collectionName}`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update bookmark");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveBookmark = async () => {
    try {
      setIsLoading(true);

      if (!bookmarkId) {
        throw new Error("Bookmark ID not found");
      }

      await removeBookmark(bookmarkId);

      setIsBookmarked(false);
      setBookmarkId(undefined);
      setCurrentCollectionId(undefined);
      setCollections(prev => prev.map(collection => ({
        ...collection,
        bookmarks: collection.bookmarks.filter(b => b.id !== bookmarkId)
      })));

      toast.success("Removed from collection");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to remove from collection");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return (
    <Button variant="ghost" size="icon" className="text-zinc-600 dark:text-zinc-400" disabled>
      <Bookmark className="h-5 w-5" />
      <span className="sr-only">Loading...</span>
    </Button>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400"
          disabled={isLoading}
        >
          <Bookmark
            className={`h-5 w-5 ${isBookmarked ? 'fill-current text-blue-600 dark:text-blue-400' : ''}`}
          />
          <span className="sr-only">Bookmark</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {isBookmarked && (
          <>
            <DropdownMenuItem
              onClick={handleRemoveBookmark}
              className="text-red-600 dark:text-red-400"
              disabled={isLoading}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Remove Bookmark
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <div className="px-2 py-1.5 text-sm font-semibold">
              Move to Collection
            </div>
          </>
        )}
        {collections.map((collection) => (
          <DropdownMenuItem
            key={collection.id}
            onClick={() => handleAddBookmark(collection.id)}
            disabled={isLoading || collection.id === currentCollectionId}
            className={collection.id === currentCollectionId ? "bg-zinc-100 dark:bg-zinc-800" : ""}
          >
            {collection.id === currentCollectionId && "✓ "}
            {collection.name}
          </DropdownMenuItem>
        ))}
        {collections.length > 0 && <DropdownMenuSeparator />}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <Plus className="mr-2 h-4 w-4" />
              Create New Collection
            </DropdownMenuItem>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Collection</DialogTitle>
              <DialogDescription>
                Create a new collection to organize your bookmarks.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newCollection.name}
                  onChange={(e) => setNewCollection(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="My Collection"
                  maxLength={100}
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newCollection.description}
                  onChange={(e) => setNewCollection(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your collection..."
                  maxLength={200}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={handleCreateCollection}
                disabled={isLoading || !newCollection.name || !newCollection.description}
              >
                Create & Bookmark
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default BookmarkButton;
