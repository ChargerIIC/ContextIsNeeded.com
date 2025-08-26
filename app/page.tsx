import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { QuestionDisplay } from "@/components/question-display"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />

      <main className="flex-1">
        <div className="text-center">
          <QuestionDisplay />
        </div>
      </main>

      <Footer />
    </div>
  )
}
