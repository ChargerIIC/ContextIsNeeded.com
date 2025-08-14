"use client"

import { useState, useEffect } from "react"
import { fetchAndParseCSV, type Question } from "@/lib/csv-parser"

const CSV_URL =
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ContextIsNeeded-aRVPvaGSpJEhXQ7RKlXGxn9UxL769l.csv"

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

        const csvQuestions = await fetchAndParseCSV(CSV_URL)

        if (csvQuestions.length > 0) {
          setQuestions(csvQuestions)
        } else {
          console.warn("No questions found in CSV, using fallback data")
          setQuestions(fallbackQuestions)
        }
      } catch (err) {
        console.error("Failed to load questions from CSV:", err)
        setError("Failed to load questions from CSV")
        setQuestions(fallbackQuestions)
      } finally {
        setIsLoading(false)
      }
    }

    loadQuestions()
  }, [])

  const getRandomQuestion = (): Question => {
    if (questions.length === 0) return fallbackQuestions[0]
    return questions[Math.floor(Math.random() * questions.length)]
  }

  return {
    questions,
    isLoading,
    error,
    getRandomQuestion,
    totalQuestions: questions.length,
  }
}
