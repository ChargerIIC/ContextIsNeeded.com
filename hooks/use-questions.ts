"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { fetchAndParseCSV, type Question } from "@/lib/csv-parser"
import { fetchQuestionsFromFirestore } from "@/lib/firestore"
import { fetchSingleRandom } from "@/lib/random-question-api"

const CSV_URL =
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ContextIsNeeded-aRVPvaGSpJEhXQ7RKlXGxn9UxL769l.csv"

// Environment variable to control data source
const USE_FIREBASE = process.env.NEXT_PUBLIC_USE_FIREBASE === 'true'


// Fallback questions in case CSV fails to load
const fallbackQuestions: Question[] = [
  {
    title: "How can I tell the difference between a rabbit and a cat?",
    url: "http://cooking.stackexchange.com/questions/56418/how-can-i-tell-the-difference-between-a-rabbit-and-a-cat",
    site: "Cooking",
  },
  {
    title: "Why does my code work on Tuesdays but not on Wednesdays?",
    url: "https://stackoverflow.com/questions/example",
    site: "Stack Overflow",
  },
  {
    title: "Is it normal for my houseplant to start speaking French?",
    url: "https://gardening.stackexchange.com/questions/example",
    site: "Gardening",
  },
]

export function useQuestions() {
  // For non-hybrid legacy modes we keep full array in state
  const [questions, setQuestions] = useState<Question[]>(fallbackQuestions)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)




  useEffect(() => {
    async function initialLoad() {
      try {
        setIsLoading(true)
        setError(null)
        // legacy bulk load (Firestore or CSV)
        let loadedQuestions: Question[] = []
        if (USE_FIREBASE) {
          try {
            const question = await getNextQuestion();
            loadedQuestions = [question];
            console.log(`Loaded ${loadedQuestions.length} questions from Firebase`)
          } catch (firebaseError) {
            console.warn("Failed to load from Firebase, falling back to CSV:", firebaseError)
            loadedQuestions = await fetchAndParseCSV(CSV_URL)
          }
        } else {
          loadedQuestions = await fetchAndParseCSV(CSV_URL)
        }
        if (loadedQuestions.length > 0) {
          setQuestions(loadedQuestions)
        } else {
          setQuestions(fallbackQuestions)
        }
      } catch (err) {
        console.error('Failed to load questions', err)
        setError('Failed to load questions')
        setQuestions(fallbackQuestions)
      } finally {
        setIsLoading(false)
      }
    }
    initialLoad()
  }, [])

  const getNextQuestion = useCallback(async (): Promise<Question> => {
    // Otherwise, fetch a single question from the API
    try {
      const q = await fetchSingleRandom()
      if (q) return q
    } catch (e) {
      console.warn('API single fetch failed', e);
    }
    // Fallback
    const list = questions.length ? questions : fallbackQuestions
    const array = new Uint32Array(1)
    window.crypto.getRandomValues(array)
    return list[array[0] % list.length]
  }, [questions])

  return {
    questions,
    isLoading,
    error,
    getNextQuestion,
    totalQuestions: questions.length
  }
}
