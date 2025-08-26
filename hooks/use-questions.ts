"use client"

import { useState, useEffect } from "react"
import { fetchAndParseCSV, type Question } from "@/lib/csv-parser"
import { fetchQuestionsFromFirestore } from "@/lib/firestore"

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
  const [questions, setQuestions] = useState<Question[]>(fallbackQuestions)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadQuestions() {
      try {
        setIsLoading(true)
        setError(null)

        let loadedQuestions: Question[] = []
        
        if (USE_FIREBASE) {
          try {
            loadedQuestions = await fetchQuestionsFromFirestore()
            console.log(`Loaded ${loadedQuestions.length} questions from Firebase`)
          } catch (firebaseError) {
            console.warn("Failed to load from Firebase, falling back to CSV:", firebaseError)
            // Fallback to CSV if Firebase fails
            loadedQuestions = await fetchAndParseCSV(CSV_URL)
          }
        } else {
          loadedQuestions = await fetchAndParseCSV(CSV_URL)
        }

        if (loadedQuestions.length > 0) {
          setQuestions(loadedQuestions)
        } else {
          console.warn("No questions found, using fallback data")
          setQuestions(fallbackQuestions)
        }
      } catch (err) {
        console.error("Failed to load questions:", err)
        setError("Failed to load questions")
        setQuestions(fallbackQuestions)
      } finally {
        setIsLoading(false)
      }
    }

    loadQuestions()
  }, [])

  function getRandomInt(max: number) {
    const array = new Uint32Array(1)
    window.crypto.getRandomValues(array)
    return array[0] % max
  }
  const getRandomQuestion = (): Question => {
    if (questions.length === 0) return fallbackQuestions[0]
    return questions[getRandomInt(questions.length)]
  }

  return {
    questions,
    isLoading,
    error,
    getRandomQuestion,
    totalQuestions: questions.length,
  }
}
