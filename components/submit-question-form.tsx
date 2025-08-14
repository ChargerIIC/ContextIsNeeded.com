"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle, Send, AlertCircle } from "lucide-react"

interface FormData {
  question: string
  url: string
  email: string
  site: string
}

interface FormErrors {
  question?: string
  url?: string
  email?: string
  site?: string
}

export function SubmitQuestionForm() {
  const [formData, setFormData] = useState<FormData>({
    question: "",
    url: "",
    email: "",
    site: "",
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.question.trim()) {
      newErrors.question = "Question is required"
    } else if (formData.question.length < 10) {
      newErrors.question = "Question must be at least 10 characters long"
    }

    if (!formData.url.trim()) {
      newErrors.url = "URL is required"
    } else {
      try {
        new URL(formData.url)
      } catch {
        newErrors.url = "Please enter a valid URL"
      }
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (!formData.site.trim()) {
      newErrors.site = "Site name is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      // Simulate API call - replace with actual submission logic
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Here you would typically send the data to your backend
      console.log("Submitting question:", formData)

      setIsSubmitted(true)
    } catch (error) {
      console.error("Error submitting question:", error)
      // Handle error state here
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  if (isSubmitted) {
    return (
      <Card className="glass-card p-6 text-center sm:p-8">
        <div className="space-y-4 sm:space-y-6">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 sm:h-16 sm:w-16">
            <CheckCircle className="h-6 w-6 text-green-600 sm:h-8 sm:w-8" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-gray-900 sm:text-2xl">Question Submitted!</h3>
            <p className="text-sm text-gray-600 sm:text-base">
              Thank you for contributing to ContextIsNeeded.com. We'll review your submission and may reach out via
              email if we need more information.
            </p>
          </div>

          <Button
            onClick={() => {
              setIsSubmitted(false)
              setFormData({ question: "", url: "", email: "", site: "" })
            }}
            variant="outline"
            className="w-full sm:w-auto"
          >
            Submit Another Question
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card className="glass-card p-6 sm:p-8">
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* Question field */}
        <div className="space-y-2">
          <Label htmlFor="question" className="text-sm font-medium text-gray-700">
            Question Title *
          </Label>
          <Textarea
            id="question"
            placeholder="e.g., How can I tell the difference between a rabbit and a cat?"
            value={formData.question}
            onChange={(e) => handleInputChange("question", e.target.value)}
            className={`min-h-[80px] resize-none bg-white/50 backdrop-blur-sm sm:min-h-[100px] ${
              errors.question ? "border-red-300 focus:border-red-500" : ""
            }`}
          />
          {errors.question && (
            <div className="flex items-center space-x-1 text-sm text-red-600">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{errors.question}</span>
            </div>
          )}
        </div>

        {/* URL field */}
        <div className="space-y-2">
          <Label htmlFor="url" className="text-sm font-medium text-gray-700">
            Original Question URL *
          </Label>
          <Input
            id="url"
            type="url"
            placeholder="https://example.com/questions/12345"
            value={formData.url}
            onChange={(e) => handleInputChange("url", e.target.value)}
            className={`bg-white/50 backdrop-blur-sm ${errors.url ? "border-red-300 focus:border-red-500" : ""}`}
          />
          {errors.url && (
            <div className="flex items-center space-x-1 text-sm text-red-600">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{errors.url}</span>
            </div>
          )}
        </div>

        {/* Site field */}
        <div className="space-y-2">
          <Label htmlFor="site" className="text-sm font-medium text-gray-700">
            Site Name *
          </Label>
          <Input
            id="site"
            placeholder="e.g., Stack Overflow, Reddit, Cooking"
            value={formData.site}
            onChange={(e) => handleInputChange("site", e.target.value)}
            className={`bg-white/50 backdrop-blur-sm ${errors.site ? "border-red-300 focus:border-red-500" : ""}`}
          />
          {errors.site && (
            <div className="flex items-center space-x-1 text-sm text-red-600">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{errors.site}</span>
            </div>
          )}
        </div>

        {/* Email field */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-gray-700">
            Your Email Address *
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="your.email@example.com"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            className={`bg-white/50 backdrop-blur-sm ${errors.email ? "border-red-300 focus:border-red-500" : ""}`}
          />
          {errors.email && (
            <div className="flex items-center space-x-1 text-sm text-red-600">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{errors.email}</span>
            </div>
          )}
          <p className="text-xs text-gray-500">We'll only use this to follow up if we need clarification.</p>
        </div>

        {/* Submit button */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-2.5 text-base font-semibold disabled:opacity-50 sm:py-3 sm:text-lg"
        >
          <div className="flex items-center justify-center space-x-2">
            <Send className={`h-4 w-4 sm:h-5 sm:w-5 ${isSubmitting ? "animate-pulse" : ""}`} />
            <span>{isSubmitting ? "Submitting..." : "Submit Question"}</span>
          </div>
        </Button>

        <p className="text-center text-xs text-gray-500">
          By submitting, you agree that your question may be featured on ContextIsNeeded.com
        </p>
      </form>
    </Card>
  )
}
