/**
 * Standalone Firebase Migration Script
 * This script can be run with Node.js directly and includes improved error handling
 */

import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc } from 'firebase/firestore'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') })

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Validate configuration
function validateFirebaseConfig() {
  const requiredFields = [
    'apiKey', 'authDomain', 'projectId', 
    'storageBucket', 'messagingSenderId', 'appId'
  ]
  
  for (const field of requiredFields) {
    if (!firebaseConfig[field as keyof typeof firebaseConfig]) {
      throw new Error(`Missing required Firebase config: ${field}`)
    }
  }
}

// Initialize Firebase
let app: any
let db: any

try {
  validateFirebaseConfig()
  app = initializeApp(firebaseConfig)
  db = getFirestore(app)
  console.log('✅ Firebase initialized successfully')
} catch (error) {
  console.error('❌ Failed to initialize Firebase:', error)
  process.exit(1)
}

const CSV_URL = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ContextIsNeeded-aRVPvaGSpJEhXQ7RKlXGxn9UxL769l.csv"

interface Question {
  title: string
  url: string
  site: string
}

/**
 * Fetch and parse CSV data
 */
async function fetchAndParseCSV(url: string): Promise<Question[]> {
  try {
    console.log('Fetching CSV from:', url)
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.statusText}`)
    }

    const csvText = await response.text()
    console.log(`CSV text length: ${csvText.length} characters`)
    
    return parseCSV(csvText)
  } catch (error) {
    console.error("Error fetching CSV:", error)
    throw error
  }
}

function parseCSV(csvText: string): Question[] {
  const lines = csvText.trim().split("\n")
  console.log(`CSV has ${lines.length} lines`)
  
  if (lines.length < 2) {
    console.log('CSV appears to be empty or only has headers')
    return []
  }
  
  const headers = lines[0].split(",").map((header) => header.trim().replace(/"/g, ""))
  console.log('CSV headers:', headers)

  const questions: Question[] = []

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    if (!line.trim()) continue

    // Parse CSV line handling quoted values
    const values = parseCSVLine(line)

    if (values.length >= 3) {
      const question = {
        title: values[0]?.trim().replace(/"/g, "") || "",
        url: values[1]?.trim().replace(/"/g, "") || "",
        site: values[2]?.trim().replace(/"/g, "") || "",
      }
      
      // Only add questions with all required fields
      if (question.title && question.url && question.site) {
        questions.push(question)
      } else {
        console.log(`Skipping invalid question on line ${i + 1}:`, question)
      }
    } else {
      console.log(`Skipping line ${i + 1} - insufficient values:`, values)
    }
  }

  return questions
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === "," && !inQuotes) {
      result.push(current)
      current = ""
    } else {
      current += char
    }
  }

  result.push(current)
  return result
}

/**
 * Sanitize string values for Firestore
 */
function sanitizeString(value: string): string {
  if (!value || typeof value !== 'string') {
    return ''
  }
  
  return value
    .trim()
    .replace(/\0/g, '') // Remove null bytes
    .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters except newline and tab
    .replace(/[\x0B\x0C]/g, '') // Remove vertical tab and form feed
    .substring(0, 1500) // Limit length to avoid Firestore limits
}

/**
 * Sanitize URL values for Firestore
 */
function sanitizeUrl(value: string): string {
  if (!value || typeof value !== 'string') {
    return ''
  }
  
  const sanitized = sanitizeString(value)
  
  // Basic URL validation
  try {
    new URL(sanitized)
    return sanitized
  } catch {
    // If it's not a valid URL, try adding https://
    if (!sanitized.startsWith('http://') && !sanitized.startsWith('https://')) {
      try {
        new URL(`https://${sanitized}`)
        return `https://${sanitized}`
      } catch {
        // If still invalid, return empty string
        console.warn(`Invalid URL detected: ${sanitized}`)
        return ''
      }
    }
    return ''
  }
}

/**
 * Add a question to Firestore with validation
 */
async function addQuestionToFirestore(question: Question): Promise<string> {
  try {
    // Sanitize and validate the data before adding to Firestore
    const sanitizedQuestion = {
      title: sanitizeString(question.title),
      url: sanitizeUrl(question.url),
      site: sanitizeString(question.site),
      createdAt: new Date(),
    }
    
    // Validate that all required fields are present and valid
    if (!sanitizedQuestion.title || !sanitizedQuestion.url || !sanitizedQuestion.site) {
      throw new Error(`Invalid question data after sanitization: ${JSON.stringify(sanitizedQuestion)}`)
    }
    
    const docRef = await addDoc(collection(db, 'questions'), sanitizedQuestion)
    
    return docRef.id
  } catch (error) {
    console.error('Error adding question to Firestore:', error)
    throw error
  }
}

/**
 * Main migration function
 */
async function migrateDataToFirebase() {
  try {
    console.log('🚀 Starting data migration from CSV to Firebase...')
    console.log('📋 Configuration:')
    console.log(`   Project ID: ${firebaseConfig.projectId}`)
    console.log(`   Auth Domain: ${firebaseConfig.authDomain}`)
    
    // Fetch questions from CSV
    console.log('\n📥 Fetching questions from CSV...')
    const questions = await fetchAndParseCSV(CSV_URL)
    console.log(`📊 Found ${questions.length} valid questions in CSV`)
    
    if (questions.length === 0) {
      console.log('❌ No questions found in CSV file')
      return
    }
    
    // Show first few questions for verification
    console.log('\n🔍 Sample questions:')
    questions.slice(0, 3).forEach((q, i) => {
      console.log(`   ${i + 1}. ${q.title.substring(0, 60)}...`)
      console.log(`      URL: ${q.url}`)
      console.log(`      Site: ${q.site}`)
    })
    
    // Add each question to Firestore
    console.log('\n⬆️  Adding questions to Firestore...')
    let successCount = 0
    let errorCount = 0
    const failedQuestions: Array<{ index: number; question: Question; error: string }> = []
    
    for (const [index, question] of questions.entries()) {
      try {
        const docId = await addQuestionToFirestore(question)
        successCount++
        console.log(`✅ ${index + 1}/${questions.length}: Added "${question.title.substring(0, 50)}..." (ID: ${docId})`)
      } catch (error) {
        errorCount++
        const errorMessage = error instanceof Error ? error.message : String(error)
        failedQuestions.push({ index: index + 1, question, error: errorMessage })
        console.error(`❌ ${index + 1}/${questions.length}: Failed "${question.title.substring(0, 50)}..."`)
        console.error(`   Error: ${errorMessage}`)
      }
      
      // Add a small delay to avoid overwhelming Firestore
      if (index % 10 === 9) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }
    
    console.log('\n📊 Migration Summary:')
    console.log(`✅ Successfully migrated: ${successCount} questions`)
    console.log(`❌ Failed to migrate: ${errorCount} questions`)
    console.log(`🔥 Total questions in Firebase: ${successCount}`)
    
    if (failedQuestions.length > 0) {
      console.log('\n❌ Failed Questions Details:')
      failedQuestions.slice(0, 10).forEach(({ index, question, error }) => {
        console.log(`   Question ${index}: ${error}`)
        console.log(`     Title: "${question.title}"`)
        console.log(`     URL: "${question.url}"`)
        console.log(`     Site: "${question.site}"`)
      })
      
      if (failedQuestions.length > 10) {
        console.log(`   ... and ${failedQuestions.length - 10} more`)
      }
    }
    
    if (errorCount === 0) {
      console.log('\n🎉 Migration completed successfully!')
    } else {
      console.log('\n⚠️ Migration completed with some errors. Check the details above.')
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

// Run the migration
migrateDataToFirebase()
  .then(() => {
    console.log('\n✨ Migration script finished')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Migration script failed:', error)
    process.exit(1)
  })
