// src/actions/cleanup.ts
'use server'

import { readdir, unlink, stat } from 'fs/promises'
import { join } from 'path'
import { prisma } from '@/lib/prisma'

interface FileInfo {
  path: string
  size: number
  lastModified: Date
  isOrphaned: boolean
}

interface DirectoryStats {
  totalFiles: number
  totalSize: number
  files: FileInfo[]
}

interface CleanupStats {
  tempUploads: DirectoryStats
  uploads: DirectoryStats
  orphanedFiles: string[]
}

async function getFilesInDirectory(dirPath: string, isTemp: boolean): Promise<FileInfo[]> {
  const files = await readdir(dirPath)
  const fileStats = await Promise.all(
    files
      .filter(file => file !== '.gitkeep')
      .map(async (file) => {
        const filePath = join(dirPath, file)
        const stats = await stat(filePath)

        // Check if file exists in database
        const fileUrl = `/${isTemp ? 'temp-uploads' : 'uploads'}/${file}`
        const existsInNews = await prisma.news.findFirst({
          where: { thumbnailUrl: fileUrl }
        })

        const existsInSection = await prisma.sectionImage.findFirst({
          where: { imageUrl: fileUrl }
        })

        return {
          path: fileUrl,
          size: stats.size,
          lastModified: stats.mtime,
          isOrphaned: !existsInNews && !existsInSection
        }
      })
  )

  return fileStats
}

export async function getCleanupStats(): Promise<CleanupStats> {
  const tempDir = join(process.cwd(), 'public', 'temp-uploads')
  const uploadsDir = join(process.cwd(), 'public', 'uploads')

  const tempFiles = await getFilesInDirectory(tempDir, true)
  const uploadFiles = await getFilesInDirectory(uploadsDir, false)

  return {
    tempUploads: {
      totalFiles: tempFiles.length,
      totalSize: tempFiles.reduce((acc, file) => acc + file.size, 0),
      files: tempFiles
    },
    uploads: {
      totalFiles: uploadFiles.length,
      totalSize: uploadFiles.reduce((acc, file) => acc + file.size, 0),
      files: uploadFiles
    },
    orphanedFiles: [
      ...tempFiles.filter(f => f.isOrphaned).map(f => f.path),
      ...uploadFiles.filter(f => f.isOrphaned).map(f => f.path)
    ]
  }
}

export async function cleanupOrphanedFiles(files: string[]): Promise<{ success: boolean; deletedCount: number }> {
  try {
    let deletedCount = 0

    await Promise.all(
      files.map(async (filePath) => {
        const fullPath = join(process.cwd(), 'public', filePath)
        try {
          await unlink(fullPath)
          deletedCount++
        } catch (error) {
          console.error(`Failed to delete ${filePath}:`, error)
        }
      })
    )

    return {
      success: true,
      deletedCount
    }
  } catch (error) {
    console.error('Cleanup failed:', error)
    return {
      success: false,
      deletedCount: 0
    }
  }
}
