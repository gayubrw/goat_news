'use server'

import { writeFile } from 'fs/promises'
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
    const uploadDir = join(process.cwd(), 'public', 'uploads')
    const filepath = join(uploadDir, filename)

    // Convert File to Buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Write file
    await writeFile(filepath, buffer)

    // Return the public URL
    return {
      success: true as const,
      url: `/uploads/${filename}`
    }
  } catch (error) {
    console.error('[UPLOAD_ERROR]', error)
    return {
      success: false as const,
      error: error instanceof Error ? error.message : 'Failed to upload image'
    }
  }
}
