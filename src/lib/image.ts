export async function fileToImageDataUrl(file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  const blob = new Blob([buffer], { type: file.type })
  const url = URL.createObjectURL(blob)
  try {
    const img = await loadImage(url)
    const needsResize = img.width > 1920 || img.height > 1920
    const tooBigBytes = file.size > 10 * 1024 * 1024 // 10MB
    if (needsResize || tooBigBytes) {
      const max = 1920
      const scale = Math.min(1, max / Math.max(img.width, img.height))
      const w = Math.round(img.width * scale)
      const h = Math.round(img.height * scale)
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, w, h)
      // Downscale to JPEG to keep size small
      return canvas.toDataURL('image/jpeg', 0.9)
    } else {
      // Return original as DataURL
      return await blobToDataUrl(blob)
    }
  } finally {
    URL.revokeObjectURL(url)
  }
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = url
  })
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}
