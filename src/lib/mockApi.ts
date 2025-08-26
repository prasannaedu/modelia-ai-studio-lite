export type GeneratePayload = {
  imageDataUrl: string
  prompt: string
  style: string
}

export type GenerateResponse = {
  id: string
  imageUrl: string
  prompt: string
  style: string
  createdAt: string
}

function sleep(ms: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const t = setTimeout(() => resolve(), ms)
    if (signal) {
      signal.addEventListener(
        'abort',
        () => {
          clearTimeout(t)
          reject(new DOMException('Aborted', 'AbortError'))
        },
        { once: true }
      )
    }
  })
}

async function mockGenerateOnce(
  body: GeneratePayload,
  signal?: AbortSignal
): Promise<GenerateResponse> {
  // Simulate 1–2s latency
  const delay = 1000 + Math.random() * 1000
  await sleep(delay, signal)
  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')

  // 20% chance of transient "Model overloaded" error
  if (Math.random() < 0.2) {
    const err: any = new Error('Model overloaded')
    err.code = 'MODEL_OVERLOADED'
    throw err
  }

  // For demo, "process" image by echoing same data URL
  const id = Math.random().toString(36).slice(2)
  return {
    id,
    imageUrl: body.imageDataUrl,
    prompt: body.prompt,
    style: body.style,
    createdAt: new Date().toISOString(),
  }
}

export async function generateWithRetries(
  body: GeneratePayload,
  opts: { signal?: AbortSignal } = {}
): Promise<GenerateResponse> {
  const { signal } = opts
  const maxAttempts = 3
  let attempt = 0
  let lastErr: unknown

  while (attempt < maxAttempts) {
    try {
      return await mockGenerateOnce(body, signal)
    } catch (err: any) {
      if (err?.name === 'AbortError') throw err
      lastErr = err
      attempt++
      if (attempt >= maxAttempts) break
      // Exponential backoff: 500ms, 1000ms
      const backoff = 500 * Math.pow(2, attempt - 1)
      await sleep(backoff, signal)
    }
  }
  throw lastErr
}
