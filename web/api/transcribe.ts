import { VercelRequest, VercelResponse } from '@vercel/node'
import { supabaseService } from './lib/supabase'
import { getMimeTypeAndFilename, isAudioMimeType } from './lib/mime'
import { createClient } from '@deepgram/sdk'

const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20 MB

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { path, language = 'en' } = req.body

    if (!path) {
      return res.status(400).json({ error: 'missing_path' })
    }

    // Normalize path - remove 'media/' prefix if present
    const normalizedPath = path.startsWith('media/') ? path.substring(6) : path

    console.log('Transcription request for path:', normalizedPath)

    // Create signed URL for the audio file
    const { data: signedUrlData, error: signedUrlError } = await supabaseService.storage
      .from('media')
      .createSignedUrl(normalizedPath, 60) // 60 seconds TTL

    if (signedUrlError || !signedUrlData?.signedUrl) {
      console.error('Error creating signed URL:', signedUrlError)
      return res.status(404).json({ error: 'not_found' })
    }

    // Get MIME type and filename (for validation only)
    const { mime } = getMimeTypeAndFilename(normalizedPath)

    // Validate audio MIME type
    if (!isAudioMimeType(mime)) {
      return res.status(200).json({
        transcript: '',
        note: 'Unsupported audio format.'
      })
    }

    // Initialize Deepgram client
    if (!process.env.DEEPGRAM_API_KEY) {
      console.error('DEEPGRAM_API_KEY not configured')
      return res.status(200).json({
        transcript: '',
        note: 'Transcription service not configured.'
      })
    }

    const deepgram = createClient(process.env.DEEPGRAM_API_KEY)

    try {
      // Transcribe with Deepgram using URL source
      const { result, error: transcriptionError } = await deepgram.listen.prerecorded.transcribeUrl(
        {
          url: signedUrlData.signedUrl
        },
        {
          model: 'nova-2-general',
          smart_format: true,
          profanity_filter: false,
          language: language
        }
      )

      if (transcriptionError) {
        console.error('Deepgram transcription error:', transcriptionError)
        return res.status(200).json({
          transcript: '',
          note: 'Transcription failed: service error'
        })
      }

      // Extract transcript from the first channel/alternative
      const transcript = result.results?.channels?.[0]?.alternatives?.[0]?.transcript || ''

      console.log('Transcription successful, length:', transcript.length)

      return res.status(200).json({ transcript })

    } catch (deepgramError) {
      console.error('Deepgram API error:', deepgramError)
      return res.status(200).json({
        transcript: '',
        note: 'Transcription failed: API error'
      })
    }

  } catch (error) {
    console.error('Transcribe handler error:', error)
    return res.status(200).json({
      transcript: '',
      note: 'Transcription failed: unexpected error'
    })
  }
}
