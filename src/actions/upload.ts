'use server'

import { writeFile, mkdir, rename } from 'fs/promises'
import { join } from 'path'

export async function uploadImage(formData: FormData) {
  try {
    const file = formData.get('file') as File
    if (!file) {
      throw new Error('No file uploaded')
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image')
    }

    // Create unique filename
    const timestamp = Date.now()
    const filename = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`

    // Use temp directory inside public
    const tempDir = join(process.cwd(), 'public', 'temp-uploads')
    const tempFilepath = join(tempDir, filename)

    // Ensure temp directory exists
    await mkdir(tempDir, { recursive: true })

    // Convert File to Buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Write file to temp directory
    await writeFile(tempFilepath, buffer)

    // Return the temp path and filename for later use
    return {
      success: true as const,
      tempPath: tempFilepath,
      filename,
      url: `/temp-uploads/${filename}` // now this will work since it's in public
    }
  } catch (error) {
    console.error('[UPLOAD_ERROR]', error)
    return {
      success: false as const,
      error: error instanceof Error ? error.message : 'Failed to upload image'
    }
  }
}

// Function to move files from temp-uploads to uploads
export async function moveToPublic(tempPath: string, filename: string) {
  const publicDir = join(process.cwd(), 'public', 'uploads')
  await mkdir(publicDir, { recursive: true })

  const publicPath = join(publicDir, filename)
  await rename(tempPath, publicPath)

  return `/uploads/${filename}`
}
