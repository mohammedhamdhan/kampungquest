export function getMimeTypeAndFilename(path: string): { mime: string; filename: string } {
  // Extract filename from path
  const filename = path.split('/').pop() || 'unknown'

  // Get file extension
  const extension = filename.split('.').pop()?.toLowerCase()

  // Determine MIME type based on extension
  let mime: string

  switch (extension) {
    case 'webm':
      mime = 'audio/webm'
      break
    case 'm4a':
    case 'mp4':
      mime = 'audio/mp4'
      break
    case 'wav':
      mime = 'audio/wav'
      break
    case 'mp3':
      mime = 'audio/mpeg'
      break
    case 'ogg':
      mime = 'audio/ogg'
      break
    default:
      mime = 'application/octet-stream'
  }

  return { mime, filename }
}

export function isAudioMimeType(mime: string): boolean {
  return mime.startsWith('audio/')
}