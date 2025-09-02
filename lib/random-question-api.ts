import type { Question } from "@/lib/csv-parser"

const API_URL = "https://us-central1-contextisneeded.cloudfunctions.net/getRandomQuestion";
const BATCH_SIZE = Number(process.env.NEXT_PUBLIC_QUESTION_BATCH_SIZE || 12)

export interface FetchResult {
  questions: Question[]
  errors: number
}

function isValidQuestion(obj: any): obj is Question {
  return obj && typeof obj.title === 'string' && typeof obj.url === 'string' && typeof obj.site === 'string'
}

export async function fetchSingleRandom(signal?: AbortSignal): Promise<Question | null> {
  if (!API_URL) throw new Error("Random question API URL missing (NEXT_PUBLIC_RANDOM_QUESTION_API)")
  const res = await fetch(API_URL, { signal, cache: 'no-store' })
  if (!res.ok) throw new Error(`Random question API failed: ${res.status}`)
  const data = await res.json()
  if (isValidQuestion(data)) return data
  return null
}

export async function fetchBatch(desired: number = BATCH_SIZE, timeoutMs = 8000): Promise<FetchResult> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  const promises: Promise<Question | null>[] = []

  for (let i = 0; i < desired; i++) {
    promises.push(
      fetchSingleRandom(controller.signal).catch(() => null)
    )
  }

  const results = await Promise.all(promises)
  clearTimeout(timer)

  const uniqMap = new Map<string, Question>()
  let errors = 0
  for (const q of results) {
    if (!q) { errors++; continue }
    const key = `${q.title}|${q.url}`
    if (!uniqMap.has(key)) uniqMap.set(key, q)
  }

  return { questions: Array.from(uniqMap.values()), errors }
}
