export function Footer() {
  return (
    <footer className="mt-auto border-t border-white/20 bg-white/10 backdrop-blur-md">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700">ContextIsNeeded.com</span>
          </div>

          <div className="flex space-x-6 text-sm text-gray-600">
            <span>Discover questions that need context</span>
          </div>

          <div className="text-sm text-gray-500">© 2024 ContextIsNeeded.com</div>
        </div>
      </div>
    </footer>
  )
}
