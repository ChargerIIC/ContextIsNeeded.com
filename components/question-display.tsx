"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ExternalLink, RefreshCw, AlertCircle } from "lucide-react"
import { useQuestions } from "@/hooks/use-questions"
import type { Question } from "@/lib/csv-parser"

const thoughtImages = ["/thoughtful-person.png", "/focused-laptop-worker.png", "/animated-conversation.png"]

export function QuestionDisplay() {
  const { questions, isLoading: dataLoading, error, getRandomQuestion, totalQuestions } = useQuestions()
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [currentImage, setCurrentImage] = useState(thoughtImages[0])
  const [isChanging, setIsChanging] = useState(false)
  const [fadeClass, setFadeClass] = useState("opacity-100")

  const handleNewQuestion = async () => {
    setIsChanging(true)
    setFadeClass("opacity-0")

    // Simulate loading time for smooth transition
    await new Promise((resolve) => setTimeout(resolve, 300))

    const newQuestion = getRandomQuestion()
    const randomImage = thoughtImages[Math.floor(Math.random() * thoughtImages.length)]

    setCurrentQuestion(newQuestion)
    setCurrentImage(randomImage)

    setFadeClass("opacity-100")
    setIsChanging(false)
  }

  // Initialize with random question when data is loaded
  useEffect(() => {
    if (!dataLoading && questions.length > 0 && !currentQuestion) {
      const initialQuestion = getRandomQuestion()
      setCurrentQuestion(initialQuestion)
    }
  }, [dataLoading, questions, currentQuestion, getRandomQuestion])

  // Show loading state while data is being fetched
  if (dataLoading) {
    return (
      <div className="space-y-6 sm:space-y-8">
        <div className="relative w-full">
          <div className="h-80 w-full sm:h-96 lg:h-[28rem] xl:h-[36rem] bg-white/20 animate-pulse" />
        </div>
        <div className="flex justify-center">
          <div className="h-12 w-48 bg-white/20 rounded-full animate-pulse" />
        </div>
      </div>
    )
  }

  // Show error state if data failed to load
  if (error && !currentQuestion) {
    return (
      <div className="space-y-8 container mx-auto px-4">
        <Card className="glass-card p-6 sm:p-8 text-center">
          <div className="flex flex-col items-center space-y-4">
            <AlertCircle className="h-12 w-12 text-red-500" />
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Unable to Load Questions</h3>
            <p className="text-sm sm:text-base text-gray-600">
              We're having trouble loading the question database. Please try again later.
            </p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Retry
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  if (!currentQuestion) return null

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className={`transition-opacity duration-300 ${fadeClass}`}>
        <div className="relative">
          <div className="relative w-full">
            <img
              src={currentImage || "/placeholder.svg?height=600&width=800&query=realistic person thinking deeply"}
              alt="Person in thought"
              className="h-80 w-full sm:h-96 lg:h-[28rem] xl:h-[36rem] object-cover shadow-xl sm:shadow-2xl"
            />
            {/* Subtle glow effect */}
            <div className="absolute inset-0 bg-gradient-to-t from-blue-500/10 to-transparent" />
          </div>

          <div className="absolute -bottom-8 left-1/2 w-full max-w-2xl -translate-x-1/2 px-4 sm:-bottom-12 sm:px-6 lg:-bottom-16 lg:max-w-3xl">
            <Card className="relative glass-card p-3 sm:p-4 shadow-xl sm:shadow-2xl backdrop-blur-md bg-white/90 border border-white/50">
              {/* Additional backdrop for extra contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-white/10 rounded-lg" />

              <div className="relative space-y-2 sm:space-y-3">
                {/* Site badge */}
                <div className="inline-flex items-center rounded-full bg-gradient-to-r from-blue-500/30 to-purple-500/30 px-3 py-1.5 text-xs font-medium text-gray-800 backdrop-blur-sm sm:px-4 sm:py-2 sm:text-sm border border-white/30">
                  <div className="mr-2 h-1.5 w-1.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 sm:h-2 sm:w-2" />
                  From {currentQuestion.site}
                </div>

                {/* Question text */}
                <div className="space-y-2 sm:space-y-3">
                  <blockquote className="text-lg font-semibold leading-relaxed text-gray-900 sm:text-xl lg:text-2xl drop-shadow-sm">
                    "{currentQuestion.title}"
                  </blockquote>

                  <a
                    href={currentQuestion.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 rounded-lg bg-white/50 px-3 py-2 text-xs font-medium text-gray-800 backdrop-blur-sm transition-all hover:bg-white/60 hover:text-gray-900 sm:px-4 sm:text-sm border border-white/30 drop-shadow-sm"
                  >
                    <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>View original question</span>
                  </a>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <div className="flex justify-center pt-16 sm:pt-20 lg:pt-24 container mx-auto px-4">
        <Button
          onClick={handleNewQuestion}
          disabled={isChanging}
          size="lg"
          className="group relative overflow-hidden bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-3 text-base font-semibold text-white shadow-lg transition-all hover:from-blue-600 hover:to-purple-600 hover:shadow-xl disabled:opacity-50 sm:px-8 sm:py-4 sm:text-lg"
        >
          <div className="flex items-center space-x-2">
            <RefreshCw
              className={`h-4 w-4 transition-transform sm:h-5 sm:w-5 ${isChanging ? "animate-spin" : "group-hover:rotate-180"}`}
            />
            <span>{isChanging ? "Loading..." : "Another Question"}</span>
          </div>

          {/* Shimmer effect */}
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
        </Button>
      </div>

      {/* Stats */}
      <div className="text-center space-y-1 sm:space-y-2 container mx-auto px-4">
        <p className="text-xs sm:text-sm text-gray-500">
          Discover questions from across the web that make you go "Wait, what?"
        </p>
        {totalQuestions > 0 && (
          <p className="text-xs text-gray-400">{totalQuestions} questions loaded from the database</p>
        )}
      </div>
    </div>
  )
}
