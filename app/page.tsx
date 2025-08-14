import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { QuestionDisplay } from "@/components/question-display"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />

      <main className="flex-1">
        <div className="text-center">
          <div className="container mx-auto px-4 py-4 sm:py-6">
            <h1 className="mb-4 text-3xl font-bold text-gray-900 sm:mb-6 sm:text-4xl md:text-5xl lg:text-6xl">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Context is Needed
              </span>
            </h1>
          </div>

          <QuestionDisplay />
        </div>
      </main>

      <Footer />
    </div>
  )
}
