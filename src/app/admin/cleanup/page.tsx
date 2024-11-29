// src/app/admin/cleanup/page.tsx
'use client'

import { useState, useEffect } from 'react'
import {
  FolderIcon,
  Trash2Icon,
  RefreshCwIcon,
  HardDriveIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  Loader2Icon
} from 'lucide-react'
import prettyBytes from 'pretty-bytes'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import { getCleanupStats, cleanupOrphanedFiles } from '@/actions/storage-cleanup'
import { toast } from 'sonner'

interface FileCardProps {
  title: string
  description: string
  totalFiles: number
  totalSize: number
  icon: React.ReactNode
  className?: string
}

const FileCard = ({ title, description, totalFiles, totalSize, icon, className = '' }: FileCardProps) => (
  <Card className={className}>
    <CardHeader>
      <div className="flex items-center space-x-4">
        {icon}
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Total Files</p>
          <p className="text-2xl font-bold">{totalFiles}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Total Size</p>
          <p className="text-2xl font-bold">{prettyBytes(totalSize)}</p>
        </div>
      </div>
    </CardContent>
  </Card>
)

export default function CleanupPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isCleaning, setIsCleaning] = useState(false)
  const [stats, setStats] = useState<Awaited<ReturnType<typeof getCleanupStats>> | null>(null)

  const fetchStats = async () => {
    setIsLoading(true)
    try {
      const data = await getCleanupStats()
      setStats(data)
    } catch (error) {
      toast.error('Failed to fetch cleanup stats')
      console.error('[CLEANUP_STATS_ERROR]', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const handleCleanup = async () => {
    if (!stats?.orphanedFiles.length) return

    setIsCleaning(true)
    try {
      const result = await cleanupOrphanedFiles(stats.orphanedFiles)
      if (result.success) {
        toast.success(`Successfully deleted ${result.deletedCount} files`)
        // Refresh stats
        await fetchStats()
      } else {
        toast.error('Failed to cleanup files')
      }
    } catch (error) {
      toast.error('Failed to cleanup files')
      console.error('[CLEANUP_ERROR]', error)
    } finally {
      setIsCleaning(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2Icon className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-lg text-muted-foreground">Loading storage information...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container pt-16 mx-auto py-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Storage Cleanup</h1>
          <p className="text-muted-foreground">Manage and cleanup unused files in your storage</p>
        </div>
        <Button variant="outline" onClick={fetchStats} disabled={isCleaning}>
          <RefreshCwIcon className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FileCard
          title="Temporary Uploads"
          description="Files in temporary storage"
          totalFiles={stats?.tempUploads.totalFiles || 0}
          totalSize={stats?.tempUploads.totalSize || 0}
          icon={<FolderIcon className="h-8 w-8 text-blue-500" />}
          className="border-blue-200 dark:border-blue-900"
        />
        <FileCard
          title="Permanent Uploads"
          description="Files in permanent storage"
          totalFiles={stats?.uploads.totalFiles || 0}
          totalSize={stats?.uploads.totalSize || 0}
          icon={<HardDriveIcon className="h-8 w-8 text-green-500" />}
          className="border-green-200 dark:border-green-900"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertCircleIcon className="h-5 w-5 text-orange-500" />
            <span>Orphaned Files</span>
          </CardTitle>
          <CardDescription>
            Files that are not referenced in the database and can be safely removed
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stats?.orphanedFiles.length === 0 ? (
            <Alert className="bg-green-500/10 border-green-500/20">
              <CheckCircleIcon className="h-4 w-4 text-green-500" />
              <AlertTitle>All Clear!</AlertTitle>
              <AlertDescription>
                No orphaned files found. Your storage is clean.
              </AlertDescription>
            </Alert>
          ) : (
            <ScrollArea className="h-[300px] rounded-md border p-4">
              <div className="space-y-4">
                {stats?.orphanedFiles.map((file) => (
                  <div
                    key={file}
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                  >
                    <span className="text-sm font-mono">{file}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleCleanup}
            disabled={!stats?.orphanedFiles.length || isCleaning}
            className="w-full"
            variant={stats?.orphanedFiles.length ? "destructive" : "outline"}
          >
            {isCleaning ? (
              <>
                <Loader2Icon className="h-4 w-4 mr-2 animate-spin" />
                Cleaning...
              </>
            ) : (
              <>
                <Trash2Icon className="h-4 w-4 mr-2" />
                Cleanup {stats?.orphanedFiles.length} Orphaned Files
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
