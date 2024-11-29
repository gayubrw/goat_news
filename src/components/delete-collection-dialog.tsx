'use client'

import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'
import { deleteCollection } from '@/actions/collection'

interface DeleteCollectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  collectionId: string
  collectionName: string
}

export function DeleteCollectionDialog({
  open,
  onOpenChange,
  collectionId,
  collectionName,
}: DeleteCollectionDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  async function handleDelete() {
    try {
      setIsDeleting(true)
      await deleteCollection(collectionId)
      toast({
        title: 'Collection deleted',
        description: `"${collectionName}" has been deleted successfully.`
      })
      onOpenChange(false)
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete collection',
        variant: 'destructive'
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Collection</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete &quot;{collectionName}&quot;? This action cannot be undone,
            and all bookmarks in this collection will be removed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? 'Deleting...' : 'Delete Collection'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
