import { VercelRequest, VercelResponse } from '@vercel/node'
import { supabaseService } from './lib/supabase'
import { randomUUID } from 'crypto'

const ALLOWED_TYPES = {
  'audio/webm': 'webm',
  'audio/webm;codecs=opus': 'webm',
  'audio/m4a': 'm4a',
  'audio/mp4': 'mp4',
  'image/jpeg': 'jpg',
  'image/png': 'png'
}

const MAX_SIZE = 15 * 1024 * 1024 // 15 MB

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const contentType = req.headers['content-type'] || ''

    if (!contentType.includes('multipart/form-data')) {
      return res.status(400).json({ error: 'Content-Type must be multipart/form-data' })
    }

    // Parse multipart form data using Vercel's built-in support
    const chunks: Buffer[] = []

    await new Promise<void>((resolve, reject) => {
      req.on('data', (chunk: Buffer) => {
        chunks.push(chunk)
      })

      req.on('end', () => {
        resolve()
      })

      req.on('error', (err) => {
        reject(err)
      })
    })

    const buffer = Buffer.concat(chunks)

    // Simple multipart parser
    const boundary = contentType.split('boundary=')[1]
    if (!boundary) {
      return res.status(400).json({ error: 'No boundary found in multipart data' })
    }

    const parts = buffer.toString('binary').split(`--${boundary}`)

    let fileBuffer: Buffer | null = null
    let fileType = ''
    let kind = 'audio'

    for (const part of parts) {
      if (part.includes('Content-Disposition')) {
        // Extract kind if present
        const kindMatch = part.match(/name="kind"[\r\n]+([^\r\n]+)/)
        if (kindMatch) {
          kind = kindMatch[1].trim()
        }

        // Extract file
        const fileMatch = part.match(/name="file"/)
        if (fileMatch) {
          const contentTypeMatch = part.match(/Content-Type: ([^\r\n]+)/)
          if (contentTypeMatch) {
            fileType = contentTypeMatch[1].trim()
          }

          const dataStart = part.indexOf('\r\n\r\n') + 4
          const dataEnd = part.lastIndexOf('\r\n')

          if (dataStart > 0 && dataEnd > dataStart) {
            const binaryData = part.substring(dataStart, dataEnd)
            fileBuffer = Buffer.from(binaryData, 'binary')
          }
        }
      }
    }

    if (!fileBuffer) {
      return res.status(400).json({ error: 'No file found in request' })
    }

    // Check file size
    if (fileBuffer.length > MAX_SIZE) {
      return res.status(413).json({ error: 'file_too_large' })
    }

    // Determine file extension
    const extension = ALLOWED_TYPES[fileType as keyof typeof ALLOWED_TYPES]
    if (!extension) {
      return res.status(415).json({ error: 'unsupported_type' })
    }

    // Generate unique filename
    const filename = `${randomUUID()}.${extension}`
    const storagePath = `tiles/tmp/${filename}`

    // Upload to Supabase Storage
    const { data, error } = await supabaseService.storage
      .from('media')
      .upload(storagePath, fileBuffer, {
        contentType: fileType,
        upsert: false
      })

    if (error) {
      console.error('Supabase upload error:', error)
      return res.status(500).json({ error: 'upload_failed' })
    }

    // Return the path with media/ prefix for consistency
    return res.status(200).json({ path: `media/${storagePath}` })

  } catch (error) {
    console.error('Upload handler error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}