"use client"

import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, Upload, X, PencilIcon, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface NewsImageUploadFieldProps {
  value: string | File;
  onUploadComplete: (value: string | File) => void;
  label?: string;
}

const NewsImageUploadField = ({
  value,
  onUploadComplete,
  label = "Image"
}: NewsImageUploadFieldProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Create preview URL when value changes
  useEffect(() => {
    if (value instanceof File && !previewUrl) {
      const objectUrl = URL.createObjectURL(value);
      setPreviewUrl(objectUrl);
    }
  }, [value, previewUrl]);

  const validateFile = (file: File): string | null => {
    if (!file.type.startsWith('image/')) {
      return 'Please select an image file';
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return 'File size must be less than 5MB';
    }

    return null;
  };

  const handleFile = useCallback(async (file: File) => {
    setError('');
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      toast.error(validationError);
      return;
    }

    setIsProcessing(true);
    try {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      onUploadComplete(file);

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to process image');
      toast.error(error instanceof Error ? error.message : 'Failed to process image');
    } finally {
      setIsProcessing(false);
    }
  }, [onUploadComplete, previewUrl]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const handleRemove = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl('');
    }
    setError('');
    onUploadComplete('');
  };

  const displayUrl = typeof value === 'string' ? value : previewUrl;

  return (
    <div className="space-y-4">
      <Label className="font-medium">{label}</Label>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {displayUrl ? (
        <div
          className="relative aspect-video w-full overflow-hidden rounded-lg border group"
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Image
            src={displayUrl}
            alt="Selected image"
            className="object-cover"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="relative">
              <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8 bg-white hover:bg-white/90 shadow-md"
                disabled={isProcessing}
              >
                <PencilIcon className="h-4 w-4 text-primary" />
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 cursor-pointer opacity-0"
                  onChange={handleUpload}
                  disabled={isProcessing}
                />
              </Button>
            </div>
            <Button
              variant="destructive"
              size="icon"
              onClick={handleRemove}
              className="h-8 w-8 shadow-md"
              disabled={isProcessing}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          {isProcessing && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
          )}
        </div>
      ) : (
        <div
          className={`flex items-center justify-center rounded-lg border-2 ${
            dragActive ? 'border-primary border-dashed bg-muted/50' : 'border-dashed border-muted-foreground/25'
          } p-8 transition-colors duration-200 ease-in-out`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="space-y-4 text-center">
            <div className="flex flex-col items-center gap-2">
              <Upload className={`h-8 w-8 ${dragActive ? 'text-primary' : 'text-muted-foreground'} transition-colors`} />
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  {dragActive ? 'Drop image here' : 'Drop your image here or click to upload'}
                </p>
                <p className="text-xs text-muted-foreground">Maximum file size: 5MB</p>
              </div>
            </div>
            <Button
              variant="secondary"
              disabled={isProcessing}
              className="relative overflow-hidden transition-transform hover:scale-105"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="ml-2">Processing...</span>
                </>
              ) : (
                'Choose Image'
              )}
              <input
                type="file"
                accept="image/*"
                className="absolute inset-0 cursor-pointer opacity-0"
                onChange={handleUpload}
                disabled={isProcessing}
              />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsImageUploadField;
