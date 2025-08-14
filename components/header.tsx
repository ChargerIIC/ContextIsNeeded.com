"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/20 bg-white/10 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500" />
          <span className="text-lg font-bold text-gray-900 sm:text-xl">
            <span className="hidden sm:inline">ContextIsNeeded.com</span>
            <span className="sm:hidden">ContextIsNeeded</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center space-x-6 md:flex">
          <Link href="/" className="text-gray-700 hover:text-gray-900 transition-colors">
            Home
          </Link>
          <Link
            href="/submit"
            className="rounded-full bg-white/20 px-4 py-2 text-gray-900 backdrop-blur-sm hover:bg-white/30 transition-all"
          >
            Submit Question
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="border-t border-white/20 bg-white/10 backdrop-blur-md md:hidden">
          <nav className="container mx-auto flex flex-col space-y-2 px-4 py-4">
            <Link
              href="/"
              className="rounded-lg px-3 py-2 text-gray-700 hover:bg-white/20 hover:text-gray-900 transition-all"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/submit"
              className="rounded-lg bg-white/20 px-3 py-2 text-gray-900 hover:bg-white/30 transition-all"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Submit Question
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
