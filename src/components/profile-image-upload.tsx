'use client';

import { useCallback, useState } from 'react';
import { Camera, Loader2, X } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { uploadImage, deleteProfileImage } from '@/actions/profile';

interface ImageUploadFieldProps {
    onUploadComplete: (url: string) => void;
    value?: string;
    label?: string;
}

export function ProfileImageUploadField({
    onUploadComplete,
    value,
    label = 'Image',
}: ImageUploadFieldProps) {
    const [isPending, setIsPending] = useState(false);
    const [preview, setPreview] = useState<string | null>(value || null);
    const [isDragging, setIsDragging] = useState(false);

    const handleUpload = useCallback(
        async (file: File) => {
            try {
                // Validate file type
                if (!file.type.startsWith('image/')) {
                    toast.error('Please upload an image file');
                    return;
                }

                // Validate file size (5MB)
                if (file.size > 5 * 1024 * 1024) {
                    toast.error('File size must be less than 5MB');
                    return;
                }

                setIsPending(true);

                // Create preview immediately
                const reader = new FileReader();
                reader.onload = () => {
                    setPreview(reader.result as string);
                };
                reader.readAsDataURL(file);

                // Upload file
                const formData = new FormData();
                formData.append('file', file);
                const result = await uploadImage(formData);

                if (!result.success) {
                    toast.error(result.error || 'Failed to upload image');
                    return;
                }

                // Call the callback with the new URL
                if (result.url) {
                    onUploadComplete(result.url);
                    setPreview(result.url);
                }
                toast.success('Image uploaded successfully');
            } catch (error) {
                console.error('Upload error:', error);
                toast.error('Failed to upload image');
            } finally {
                setIsPending(false);
            }
        },
        [onUploadComplete]
    );

    const handleRemove = useCallback(async () => {
        try {
            setIsPending(true);
            const result = await deleteProfileImage();

            if (!result.success) {
                toast.error(result.error || 'Failed to delete profile image');
                return;
            }

            // Clear the preview immediately
            setPreview(null);
            // Pass empty string to parent component
            onUploadComplete('');

            toast.success('Profile image removed successfully');
        } catch (error) {
            console.error('Remove error:', error);
            toast.error('Failed to remove profile image');
        } finally {
            setIsPending(false);
        }
    }, [onUploadComplete]);

    const handleDrop = useCallback(
        (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            setIsDragging(false);

            const file = e.dataTransfer.files[0];
            if (file) {
                handleUpload(file);
            }
        },
        [handleUpload]
    );

    return (
        <div className="space-y-2">
            {label && <Label>{label}</Label>}

            <div className="relative">
                {/* Main Image Preview */}
                <div
                    className={`relative h-64 w-64 overflow-hidden rounded-full border-4 border-zinc-200 dark:border-zinc-800 ${
                        !preview && 'bg-muted'
                    }`}
                >
                    {preview ? (
                        <Image
                            src={preview}
                            alt="Preview"
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center">
                            <Camera className="h-12 w-12 text-muted-foreground" />
                        </div>
                    )}
                </div>

                {/* Overlay Controls - Always Visible */}
                <div className="absolute bottom-0 right-0">
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="secondary"
                            size="icon"
                            className="h-10 w-10 rounded-full bg-white dark:bg-zinc-800 shadow-lg"
                            onClick={() =>
                                document.getElementById('file-upload')?.click()
                            }
                            disabled={isPending}
                        >
                            {isPending ? (
                                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                            ) : (
                                <Camera className="h-5 w-5 text-primary" />
                            )}
                        </Button>
                        {preview && (
                            <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="h-10 w-10 rounded-full shadow-lg"
                                onClick={handleRemove}
                                disabled={isPending}
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        )}
                    </div>
                </div>

                {/* Hidden File Input */}
                <input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                            handleUpload(file);
                            e.target.value = ''; // Reset input
                        }
                    }}
                />

                {/* Upload Status */}
                {isPending && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                        <div className="text-sm text-white flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            {preview ? 'Removing...' : 'Uploading...'}
                        </div>
                    </div>
                )}
            </div>

            {/* Hidden drag and drop target */}
            <div
                className={`fixed inset-0 z-50 flex items-center justify-center bg-black/80 ${
                    isDragging ? 'opacity-100' : 'opacity-0 pointer-events-none'
                } transition-opacity`}
                onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
            >
                <div className="rounded-lg border-2 border-dashed border-white p-8 text-center text-white">
                    <p className="text-lg font-medium">Drop your image here</p>
                    <p className="text-sm text-zinc-400">
                        PNG, JPG or JPEG (max 5MB)
                    </p>
                </div>
            </div>
        </div>
    );
}
