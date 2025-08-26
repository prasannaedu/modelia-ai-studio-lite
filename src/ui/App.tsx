import React, { useEffect, useMemo, useRef, useState } from 'react'
import { fileToImageDataUrl } from '../lib/image'
import { generateWithRetries, type GenerateResponse } from '../lib/mockApi'
import { loadHistory, saveToHistory } from '../lib/history'

const styles = ['Editorial', 'Streetwear', 'Vintage'] as const

export default function App() {
  const [imageDataUrl, setImageDataUrl] = useState<string>('')
  const [prompt, setPrompt] = useState('')
  const [style, setStyle] = useState<(typeof styles)[number]>('Editorial')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [history, setHistory] = useState<GenerateResponse[]>([])
  const [result, setResult] = useState<GenerateResponse | null>(null)

  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    setHistory(loadHistory())
  }, [])

  const canGenerate = useMemo(
    () => !!imageDataUrl && prompt.trim().length > 0,
    [imageDataUrl, prompt]
  )

  async function onUpload(file: File | null) {
    setError('')
    if (!file) return
    if (!/image\/(png|jpeg)/.test(file.type)) {
      setError('Please upload a PNG or JPG file.')
      return
    }
    try {
      const dataUrl = await fileToImageDataUrl(file)
      setImageDataUrl(dataUrl)
    } catch {
      setError('Failed to read image.')
    }
  }

  async function onGenerate() {
    if (!canGenerate) return
    setError('')
    setLoading(true)
    setResult(null)
    const ac = new AbortController()
    abortRef.current = ac
    try {
      const res = await generateWithRetries({ imageDataUrl, prompt, style }, { signal: ac.signal })
      setResult(res)
      saveToHistory(res)
      setHistory(loadHistory())
    } catch (err: unknown) {
      if ((err as any)?.name === 'AbortError') {
        setError('Generation aborted.')
      } else {
        setError((err as any)?.message || 'Generation failed.')
      }
    } finally {
      setLoading(false)
      abortRef.current = null
    }
  }

  function onAbort() {
    abortRef.current?.abort()
  }

  function restoreFromHistory(item: GenerateResponse) {
    setImageDataUrl(item.imageUrl)
    setPrompt(item.prompt)
    setStyle(item.style as (typeof styles)[number])
    setResult(item)
    setError('')
  }

  return (
    <div className="mx-auto max-w-5xl p-6">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Modelia — AI Studio Lite</h1>
        <a
          href="https://example.com"
          className="rounded-xl border px-3 py-2 text-sm hover:bg-slate-100 focus-visible:ring"
          aria-label="Project home link"
        >
          Docs
        </a>
      </header>

      <main className="grid gap-6 md:grid-cols-2">
        <section aria-label="Controls" className="space-y-4">
          {/* Upload */}
          <div>
            <label htmlFor="file" className="block text-sm font-medium">
              Upload PNG/JPG (≤10MB). Large images downscale to ≤1920px.
            </label>
            <input
              id="file"
              type="file"
              accept="image/png,image/jpeg"
              className="mt-2 block w-full cursor-pointer rounded-xl border bg-white p-2 focus-visible:ring"
              onChange={(event) => onUpload(event.target.files?.[0] ?? null)}
            />
          </div>

          {/* Prompt */}
          <div>
            <label htmlFor="prompt" className="block text-sm font-medium">
              Text prompt
            </label>
            <input
              id="prompt"
              className="mt-2 w-full rounded-xl border bg-white p-2 focus-visible:ring"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="e.g., 'high-contrast studio lighting'"
            />
          </div>

          {/* Style */}
          <div>
            <label htmlFor="style" className="block text-sm font-medium">
              Style
            </label>
            <select
              id="style"
              className="mt-2 w-full rounded-xl border bg-white p-2 focus-visible:ring"
              value={style}
              onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
                setStyle(event.target.value as (typeof styles)[number])
              }
            >
              {styles.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Live Summary */}
          <div className="rounded-xl border bg-white p-4" aria-live="polite">
            <h2 className="mb-2 text-sm font-semibold">Live Summary</h2>
            <div className="flex items-start gap-4">
              <div className="aspect-square h-24 w-24 overflow-hidden rounded-lg bg-slate-100 ring-1 ring-slate-200">
                {imageDataUrl ? (
                  <img
                    src={imageDataUrl}
                    alt="Uploaded preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center text-xs text-slate-500">
                    No image
                  </div>
                )}
              </div>
              <div className="text-sm">
                <div>
                  <span className="font-medium">Prompt:</span>{' '}
                  {prompt || <em className="text-slate-500">—</em>}
                </div>
                <div>
                  <span className="font-medium">Style:</span> {style}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onGenerate}
              disabled={!canGenerate || loading}
              className="rounded-xl bg-sky-600 px-4 py-2 text-white disabled:opacity-50 focus-visible:ring"
              aria-disabled={!canGenerate || loading}
            >
              {loading ? 'Generating…' : 'Generate'}
            </button>
            <button
              onClick={onAbort}
              disabled={!loading}
              className="rounded-xl border px-4 py-2 disabled:opacity-50 focus-visible:ring"
              aria-disabled={!loading}
            >
              Abort
            </button>
            {error && (
              <span
                role="status"
                className="self-center text-sm text-rose-600"
                aria-live="assertive"
              >
                {error}
              </span>
            )}
          </div>

          {/* Loading */}
          {loading && (
            <div role="status" aria-live="polite" className="flex items-center gap-2 text-sm">
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-sky-600"></span>
              <span>Calling mocked API with retries…</span>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="rounded-xl border bg-white p-4">
              <h2 className="mb-2 text-sm font-semibold">Result</h2>
              <img
                src={result.imageUrl}
                alt="Generated result"
                className="w-full rounded-lg object-contain"
              />
              <div className="mt-2 text-xs text-slate-600">
                <div>
                  <span className="font-medium">ID:</span> {result.id}
                </div>
                <div>
                  <span className="font-medium">Prompt:</span> {result.prompt}
                </div>
                <div>
                  <span className="font-medium">Style:</span> {result.style}
                </div>
                <div>
                  <span className="font-medium">Created:</span>{' '}
                  {new Date(result.createdAt).toLocaleString()}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* History */}
        <section aria-label="History" className="space-y-4">
          <h2 className="text-lg font-semibold">History (last 5)</h2>
          <ul className="grid grid-cols-2 gap-4 md:grid-cols-1">
            {history.length === 0 && (
              <li className="col-span-full rounded-xl border bg-white p-4 text-sm text-slate-500">
                Empty state — generate something to see it here.
              </li>
            )}
            {history.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => restoreFromHistory(item)}
                  className="flex w-full items-center gap-3 rounded-xl border bg-white p-2 text-left hover:bg-slate-50 focus-visible:ring"
                  aria-label={`Restore generation ${item.id}`}
                >
                  <img
                    src={item.imageUrl}
                    alt="History thumbnail"
                    className="h-16 w-16 rounded-lg object-cover ring-1 ring-slate-200"
                  />
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{item.prompt}</div>
                    <div className="text-xs text-slate-500">{item.style}</div>
                    <div className="text-[10px] text-slate-400">
                      {new Date(item.createdAt).toLocaleString()}
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer className="mt-10 text-center text-xs text-slate-500">
        Built for the Modelia Front-End Assignment.
      </footer>
    </div>
  )
}
