"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface SubmissionRecord {
  id: string
  clientId: string
  timestamp: Date
  questionTitle: string
  success: boolean
  userAgent?: string
}

export function AdminSubmissions() {
  const [submissions, setSubmissions] = useState<SubmissionRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadSubmissions() {
      try {
        const submissionsQuery = query(
          collection(db, 'submissions'),
          orderBy('timestamp', 'desc'),
          limit(50)
        )
        
        const snapshot = await getDocs(submissionsQuery)
        const submissionData: SubmissionRecord[] = []
        
        snapshot.forEach((doc) => {
          const data = doc.data()
          submissionData.push({
            id: doc.id,
            clientId: data.clientId,
            timestamp: data.timestamp.toDate(),
            questionTitle: data.questionTitle,
            success: data.success,
            userAgent: data.userAgent
          })
        })
        
        setSubmissions(submissionData)
      } catch (error) {
        console.error('Error loading submissions:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadSubmissions()
  }, [])

  if (isLoading) {
    return <div className="p-4">Loading submissions...</div>
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-2xl font-bold">Recent Submissions</h2>
      
      <div className="grid gap-4">
        {submissions.map((submission) => (
          <Card key={submission.id} className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    submission.success 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {submission.success ? 'Success' : 'Failed'}
                  </span>
                  <span className="text-sm text-gray-500">
                    {submission.timestamp.toLocaleString()}
                  </span>
                </div>
                
                <h3 className="font-medium mt-2">{submission.questionTitle}</h3>
                
                <div className="text-xs text-gray-500 mt-2 space-y-1">
                  <div>Client ID: {submission.clientId}</div>
                  {submission.userAgent && (
                    <div>User Agent: {submission.userAgent.substring(0, 100)}...</div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
      
      {submissions.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          No submissions found
        </div>
      )}
    </div>
  )
}
