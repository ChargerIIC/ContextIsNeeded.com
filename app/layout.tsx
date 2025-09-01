import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"

export const metadata: Metadata = {
  title: "ContextIsNeeded.com - Questions That Need Context",
  description: "Discover interesting questions from around the web that need more context.",
  generator: "v0.app",
  keywords: [
    "context questions", "funny questions", "out of context", "Stack Overflow", "Reddit", "Gardening", "Cooking", "question database", "weird questions", "community questions"
  ],
  authors: [{ name: "ContextIsNeeded.com Team", url: "https://contextisneeded.com" }],
  openGraph: {
    title: "ContextIsNeeded.com - Questions That Need Context",
    description: "Discover interesting questions from around the web that need more context.",
    url: "https://contextisneeded.com",
    siteName: "ContextIsNeeded.com",
    images: [
      {
        url: "/thinking-person-icon.png",
        width: 512,
        height: 512,
        alt: "ContextIsNeeded.com Logo"
      }
    ],
    locale: "en_US",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    site: "@contextisneeded",
    title: "ContextIsNeeded.com - Questions That Need Context",
    description: "Discover interesting questions from around the web that need more context.",
    images: [
      {
        url: "/thinking-person-icon.png",
        alt: "ContextIsNeeded.com Logo"
      }
    ]
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': "large",
      'max-snippet': -1
    }
  },
  alternates: {
    canonical: "https://contextisneeded.com/"
  },
  metadataBase: new URL("https://contextisneeded.com")
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="robots" content="index, follow" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <link rel="canonical" href="https://contextisneeded.com/" />
        <link rel="icon" href="/thinking-person-icon.png" type="image/png" />
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  )
}
