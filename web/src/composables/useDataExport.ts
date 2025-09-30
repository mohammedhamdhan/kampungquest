import { ref } from 'vue'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import { supabase } from '@/lib/supabase'

interface Tile {
  id: string
  title: string
  summary: string
  steps_json: string[]
  media: Array<{ type: string; path: string }>
  created_at: string
}

export function useDataExport() {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const progress = ref(0)

  /**
   * Export full data as ZIP (JSON + media files)
   */
  const exportPairData = async (pairId: string) => {
    loading.value = true
    error.value = null
    progress.value = 0

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      const response = await fetch('/api/exportData', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ pairId })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to export data')
      }

      // Download the ZIP file
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `kampungquest_data_${pairId}.zip`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      progress.value = 100
      return true
    } catch (err: any) {
      error.value = err.message || 'Failed to export data'
      console.error('Export error:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Generate PDF zine from selected tiles
   */
  const generateZine = async (
    tiles: Tile[],
    pairName: string,
    partnerName: string
  ) => {
    loading.value = true
    error.value = null
    progress.value = 0

    try {
      if (tiles.length === 0) {
        throw new Error('No tiles selected')
      }

      if (tiles.length < 4 || tiles.length > 8) {
        throw new Error('Please select 4-8 tiles for the zine')
      }

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })

      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const margin = 15
      const contentWidth = pageWidth - (margin * 2)

      // Cover page
      pdf.setFontSize(28)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Our Memory Zine', pageWidth / 2, 40, { align: 'center' })

      pdf.setFontSize(16)
      pdf.setFont('helvetica', 'normal')
      pdf.text(pairName, pageWidth / 2, 55, { align: 'center' })

      pdf.setFontSize(14)
      pdf.text(`Created by: ${partnerName}`, pageWidth / 2, 70, { align: 'center' })

      pdf.setFontSize(10)
      const dateStr = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
      pdf.text(dateStr, pageWidth / 2, 80, { align: 'center' })

      // Add decorative element
      pdf.setDrawColor(16, 185, 129) // emerald-600
      pdf.setLineWidth(0.5)
      pdf.line(margin, 90, pageWidth - margin, 90)

      progress.value = 20

      // Generate tiles
      for (let i = 0; i < tiles.length; i++) {
        const tile = tiles[i]

        pdf.addPage()

        let yOffset = margin

        // Title
        pdf.setFontSize(20)
        pdf.setFont('helvetica', 'bold')
        const titleLines = pdf.splitTextToSize(tile.title, contentWidth)
        pdf.text(titleLines, margin, yOffset)
        yOffset += (titleLines.length * 8) + 5

        // Date
        pdf.setFontSize(9)
        pdf.setFont('helvetica', 'italic')
        pdf.setTextColor(100, 100, 100)
        const tileDate = new Date(tile.created_at).toLocaleDateString()
        pdf.text(tileDate, margin, yOffset)
        yOffset += 10
        pdf.setTextColor(0, 0, 0)

        // Media (if photo exists)
        if (tile.media && tile.media.length > 0) {
          const photoMedia = tile.media.find(m => m.type === 'photo')
          if (photoMedia) {
            try {
              const { data: urlData } = await supabase.storage
                .from('tiles')
                .createSignedUrl(photoMedia.path, 3600)

              if (urlData?.signedUrl) {
                // Create temporary image element
                const img = new Image()
                img.crossOrigin = 'anonymous'

                await new Promise((resolve, reject) => {
                  img.onload = resolve
                  img.onerror = reject
                  img.src = urlData.signedUrl
                })

                const imgWidth = contentWidth
                const imgHeight = (img.height / img.width) * imgWidth

                // Check if image fits on page
                if (yOffset + imgHeight > pageHeight - margin) {
                  pdf.addPage()
                  yOffset = margin
                }

                pdf.addImage(img, 'JPEG', margin, yOffset, imgWidth, imgHeight)
                yOffset += imgHeight + 8
              }
            } catch (imgError) {
              console.error('Error loading image:', imgError)
              // Continue without image
            }
          }
        }

        // Summary
        pdf.setFontSize(11)
        pdf.setFont('helvetica', 'normal')
        const summaryLines = pdf.splitTextToSize(tile.summary, contentWidth)

        if (yOffset + (summaryLines.length * 5) > pageHeight - margin) {
          pdf.addPage()
          yOffset = margin
        }

        pdf.text(summaryLines, margin, yOffset)
        yOffset += (summaryLines.length * 5) + 8

        // Steps (limit to 5)
        const steps = tile.steps_json.slice(0, 5)
        pdf.setFontSize(12)
        pdf.setFont('helvetica', 'bold')

        if (yOffset + 10 > pageHeight - margin) {
          pdf.addPage()
          yOffset = margin
        }

        pdf.text('Steps:', margin, yOffset)
        yOffset += 8

        pdf.setFontSize(10)
        pdf.setFont('helvetica', 'normal')

        for (let j = 0; j < steps.length; j++) {
          const stepText = `${j + 1}. ${steps[j]}`
          const stepLines = pdf.splitTextToSize(stepText, contentWidth - 5)

          if (yOffset + (stepLines.length * 5) > pageHeight - margin) {
            pdf.addPage()
            yOffset = margin
          }

          pdf.text(stepLines, margin + 5, yOffset)
          yOffset += (stepLines.length * 5) + 3
        }

        progress.value = 20 + ((i + 1) / tiles.length) * 70
      }

      // Footer on last page
      pdf.setFontSize(8)
      pdf.setTextColor(150, 150, 150)
      pdf.text(
        'Created with KampungQuest - Connecting Generations',
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      )

      progress.value = 95

      // Save PDF
      const filename = `kampungquest_zine_${new Date().getTime()}.pdf`
      pdf.save(filename)

      progress.value = 100
      return true
    } catch (err: any) {
      error.value = err.message || 'Failed to generate zine'
      console.error('Zine generation error:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    progress,
    exportPairData,
    generateZine
  }
}