'use client'

import { useCallback, useState, useTransition } from 'react'
import { Upload, Loader2, X, ImageIcon } from 'lucide-react'
import Image from 'next/image'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { uploadImage } from '@/actions/upload'
import { cn } from '@/lib/utils'

interface ImageUploadFieldProps {
  onUploadComplete: (url: string) => void
  value?: string
  label?: string
}

export function ImageUploadField({ onUploadComplete, value, label = "Image" }: ImageUploadFieldProps) {
  const [isPending, startTransition] = useTransition()
  const [preview, setPreview] = useState<string | null>(value || null)
  const [isDragging, setIsDragging] = useState(false)

  const handleUpload = useCallback(
    async (file: File) => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file')
        return
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB')
        return
      }

      // Create preview immediately
      const reader = new FileReader()
      reader.onload = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)

      // Upload file
      startTransition(async () => {
        try {
          const formData = new FormData()
          formData.append('file', file)
          const result = await uploadImage(formData)

          if (!result.success) {
            toast.error(result.error)
            return
          }

          onUploadComplete(result.url)
          toast.success('Image uploaded successfully')
        } catch (error) {
          toast.error('Failed to upload image')
          console.error(error)
        }
      })
    },
    [onUploadComplete]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragging(false)

      const file = e.dataTransfer.files[0]
      if (file) {
        handleUpload(file)
      }
    },
    [handleUpload]
  )

  const handleRemove = useCallback(() => {
    setPreview(null)
    onUploadComplete('')
  }, [onUploadComplete])

  return (
    <div className="space-y-2">
      <Label>{label}</Label>

      <div
        className={cn(
          "relative rounded-lg border-2 border-dashed border-muted-foreground/25 transition-colors",
          isDragging && "border-primary/50 bg-muted/50",
          preview && "border-none"
        )}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        {preview ? (
          <div className="group relative aspect-video">
            <Image
              src={preview}
              alt="Preview"
              fill
              className="rounded-lg object-cover"
            />
            <div className="absolute inset-0 hidden items-center justify-center gap-2 rounded-lg bg-black/50 group-hover:flex">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="h-8 px-2"
                onClick={() => document.getElementById('file-upload')?.click()}
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Change
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="h-8 px-2"
                onClick={handleRemove}
                disabled={isPending}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
            <div className="rounded-full bg-muted p-4">
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="text-sm">
              <Button
                variant="link"
                className="p-0 text-primary"
                disabled={isPending}
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                Choose a file
              </Button>{' '}
              <span className="text-muted-foreground">
                or drag and drop
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              PNG, JPG or JPEG (max 5MB)
            </p>
            {isPending && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading...
              </div>
            )}
          </div>
        )}

        <input
          id="file-upload"
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) {
              handleUpload(file)
            }
          }}
        />
      </div>
    </div>
  )
}
