import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'

export async function elementToPdfFile(element: HTMLElement, fileName: string): Promise<File> {
  // Mirrors the print stylesheet (hide editable/on-screen-only elements like the
  // notes textarea and "saved on this device" badge, show print-only elements like
  // the letterhead) so the exported PDF matches the printed layout, not the screen.
  element.classList.add('pdf-export')
  let canvas: HTMLCanvasElement
  try {
    canvas = await html2canvas(element, {
      scale: 1.5,
      backgroundColor: '#ffffff',
      useCORS: true,
    })
  } finally {
    element.classList.remove('pdf-export')
  }

  const pdf = new jsPDF({ unit: 'pt', format: 'letter' })
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 24
  const usableWidth = pageWidth - margin * 2
  const usableHeight = pageHeight - margin * 2
  const imgWidth = usableWidth
  const imgHeight = (canvas.height * imgWidth) / canvas.width
  // JPEG at high quality: the receipt is text/lines on a solid white background, so
  // lossy compression shrinks the file dramatically (MMS/messaging apps cap attachment
  // size, typically a few MB) without visible quality loss, unlike lossless PNG.
  const imgData = canvas.toDataURL('image/jpeg', 0.92)

  pdf.addImage(imgData, 'JPEG', margin, margin, imgWidth, imgHeight)

  let consumed = usableHeight
  while (consumed < imgHeight) {
    pdf.addPage()
    pdf.addImage(imgData, 'JPEG', margin, margin - consumed, imgWidth, imgHeight)
    consumed += usableHeight
  }

  const blob = pdf.output('blob') as Blob
  return new File([blob], fileName, { type: 'application/pdf' })
}
