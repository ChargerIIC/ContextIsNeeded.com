import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { SubmitQuestionForm } from "@/components/submit-question-form"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function SubmitPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />

      <main className="container mx-auto flex-1 px-4 py-8 sm:py-12">
        <div className="mx-auto max-w-2xl">
          {/* Back link */}
          <Link
            href="/"
            className="mb-6 inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors sm:mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to questions</span>
          </Link>

          {/* Header */}
          <div className="mb-8 text-center sm:mb-12">
            <h1 className="mb-3 text-3xl font-bold text-gray-900 sm:mb-4 sm:text-4xl md:text-5xl">
              Submit a
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {" "}
                Question
              </span>
            </h1>

            <p className="text-base text-gray-600 sm:text-lg">
              Found a question that makes you go "Wait, what's the context here?" Share it with the community!
            </p>
          </div>

          {/* Form */}
          <SubmitQuestionForm />
        </div>
      </main>

      <Footer />
    </div>
  )
}
