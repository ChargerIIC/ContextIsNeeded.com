"use client"

import { useState, useEffect } from "react"
import { checkRateLimit } from "@/lib/firestore"

interface RateLimitStatus {
  isAllowed: boolean
  reason?: string
  retryAfter?: number
  isLoading: boolean
}

export function useRateLimit() {
  const [rateLimitStatus, setRateLimitStatus] = useState<RateLimitStatus>({
    isAllowed: true,
    isLoading: true
  })

  useEffect(() => {
    async function checkInitialRateLimit() {
      try {
        const result = await checkRateLimit()
        setRateLimitStatus({
          isAllowed: result.allowed,
          reason: result.reason,
          retryAfter: result.retryAfter,
          isLoading: false
        })
      } catch (error) {
        console.error('Error checking rate limit on mount:', error)
        // Default to allowed if there's an error
        setRateLimitStatus({
          isAllowed: true,
          isLoading: false
        })
      }
    }

    // Only check if Firebase is enabled
    if (process.env.NEXT_PUBLIC_USE_FIREBASE === 'true') {
      checkInitialRateLimit()
    } else {
      setRateLimitStatus({
        isAllowed: true,
        isLoading: false
      })
    }
  }, [])

  const recheckRateLimit = async () => {
    setRateLimitStatus(prev => ({ ...prev, isLoading: true }))
    
    try {
      const result = await checkRateLimit()
      setRateLimitStatus({
        isAllowed: result.allowed,
        reason: result.reason,
        retryAfter: result.retryAfter,
        isLoading: false
      })
    } catch (error) {
      console.error('Error rechecking rate limit:', error)
      setRateLimitStatus({
        isAllowed: true,
        isLoading: false
      })
    }
  }

  return {
    ...rateLimitStatus,
    recheckRateLimit
  }
}
