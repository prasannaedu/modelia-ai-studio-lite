import type { GenerateResponse } from './mockApi'

const KEY = 'modelia-history'

export function loadHistory(): GenerateResponse[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as GenerateResponse[]) : []
  } catch {
    return []
  }
}

export function saveToHistory(item: GenerateResponse) {
  const list = loadHistory()
  const next = [item, ...list].slice(0, 5)
  localStorage.setItem(KEY, JSON.stringify(next))
}
