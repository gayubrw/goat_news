"use client"

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bookmark, Plus, Trash2 } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';
import { addBookmark, removeBookmark } from '@/actions/bookmark';
import { createCollection } from '@/actions/collection';

interface BookmarkButtonProps {
    newsId: string;
    initialIsBookmarked?: boolean;
    initialBookmarkId?: string | null;  // Ubah ini untuk menerima null
    initialCollectionId?: string | null;  // Ubah ini untuk menerima null
    collections?: Array<{
      id: string;
      name: string;
      description: string;
    }>;
}

const BookmarkButton = ({
  newsId,
  initialIsBookmarked = false,
  initialBookmarkId,
  initialCollectionId,
  collections = []
}: BookmarkButtonProps) => {
  const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked);
  const [bookmarkId, setBookmarkId] = useState(initialBookmarkId);
  const [currentCollectionId, setCurrentCollectionId] = useState(initialCollectionId);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCollection, setNewCollection] = useState({ name: '', description: '' });
  const { toast } = useToast();

  const handleCreateCollection = async () => {
    try {
      setIsLoading(true);

      // Create new collection using server action
      const collection = await createCollection(newCollection);

      // If already bookmarked, remove old bookmark first
      if (isBookmarked && bookmarkId) {
        await handleRemoveBookmark();
      }

      // Add bookmark to the new collection
      await handleAddBookmark(collection.id);

      setIsDialogOpen(false);
      setNewCollection({ name: '', description: '' });
      toast({
        description: "Collection created and bookmark added",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create collection",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddBookmark = async (collectionId: string) => {
    try {
      setIsLoading(true);

      // If moving from one collection to another
      if (isBookmarked && bookmarkId) {
        await handleRemoveBookmark();
      }

      // Add to new collection
      await addBookmark({ newsId, collectionId });

      setIsBookmarked(true);
      setCurrentCollectionId(collectionId);
      toast({
        description: "Added to collection",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add to collection",
        variant: "destructive",
      });
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
      toast({
        description: "Removed from collection",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to remove from collection",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
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
    </>
  );
};

export default BookmarkButton;
