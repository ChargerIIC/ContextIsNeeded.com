import { 
  collection, 
  getDocs, 
  addDoc, 
  query,
  orderBy,
  limit,
  startAfter,
  where,
  Timestamp,
  QueryDocumentSnapshot
} from 'firebase/firestore'
import { db } from './firebase'
import type { Question } from './csv-parser'

// Collection name in Firestore
const QUESTIONS_COLLECTION = 'questions'
const PENDING_QUESTIONS_COLLECTION = 'pending_questions' //we use a temp collection so they can be hand-reviewed first
const SUBMISSIONS_COLLECTION = 'submissions' // Track submission attempts for rate limiting

// Rate limiting configuration
const RATE_LIMITS = {
  MAX_SUBMISSIONS_PER_HOUR: 3,
  MAX_SUBMISSIONS_PER_DAY: 10,
  COOLDOWN_MINUTES: 5 // Minimum time between submissions
}

interface SubmissionRecord {
  ipAddress?: string
  userAgent?: string
  timestamp: Date
  questionTitle: string
  success: boolean
}

/**
 * Generate a client identifier (simplified approach for demo)
 * In production, consider using more sophisticated fingerprinting
 */
function generateClientId(): string {
  // For client-side rate limiting, we'll use a combination of factors
  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'
  const language = typeof navigator !== 'undefined' ? navigator.language : 'unknown'
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  
  // Create a simple hash (not cryptographically secure, but good enough for rate limiting)
  const clientString = `${userAgent}_${language}_${timezone}`
  let hash = 0
  for (let i = 0; i < clientString.length; i++) {
    const char = clientString.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  
  return `client_${Math.abs(hash).toString(36)}`
}

/**
 * Check if a client has exceeded rate limits
 */
export async function checkRateLimit(clientId?: string): Promise<{ allowed: boolean; reason?: string; retryAfter?: number }> {
  try {
    const id = clientId || generateClientId()
    const now = new Date()
    
    // Check submissions in the last hour
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
    const hourQuery = query(
      collection(db, SUBMISSIONS_COLLECTION),
      where('clientId', '==', id),
      where('timestamp', '>=', Timestamp.fromDate(oneHourAgo)),
      orderBy('timestamp', 'desc')
    )
    
    const hourSnapshot = await getDocs(hourQuery)
    const hourSubmissions = hourSnapshot.size
    
    if (hourSubmissions >= RATE_LIMITS.MAX_SUBMISSIONS_PER_HOUR) {
      const nextAllowedTime = new Date(oneHourAgo.getTime() + 60 * 60 * 1000)
      const retryAfter = Math.ceil((nextAllowedTime.getTime() - now.getTime()) / 1000 / 60) // minutes
      
      return {
        allowed: false,
        reason: `Too many submissions in the last hour. You can submit ${RATE_LIMITS.MAX_SUBMISSIONS_PER_HOUR} questions per hour.`,
        retryAfter
      }
    }
    
    // Check submissions in the last day
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const dayQuery = query(
      collection(db, SUBMISSIONS_COLLECTION),
      where('clientId', '==', id),
      where('timestamp', '>=', Timestamp.fromDate(oneDayAgo))
    )
    
    const daySnapshot = await getDocs(dayQuery)
    const daySubmissions = daySnapshot.size
    
    if (daySubmissions >= RATE_LIMITS.MAX_SUBMISSIONS_PER_DAY) {
      const nextAllowedTime = new Date(oneDayAgo.getTime() + 24 * 60 * 60 * 1000)
      const retryAfter = Math.ceil((nextAllowedTime.getTime() - now.getTime()) / 1000 / 60) // minutes
      
      return {
        allowed: false,
        reason: `Daily submission limit reached. You can submit ${RATE_LIMITS.MAX_SUBMISSIONS_PER_DAY} questions per day.`,
        retryAfter
      }
    }
    
    // Check cooldown period (minimum time between submissions)
    if (hourSnapshot.size > 0) {
      const lastSubmission = hourSnapshot.docs[0].data()
      const lastSubmissionTime = lastSubmission.timestamp.toDate()
      const cooldownEnd = new Date(lastSubmissionTime.getTime() + RATE_LIMITS.COOLDOWN_MINUTES * 60 * 1000)
      
      if (now < cooldownEnd) {
        const retryAfter = Math.ceil((cooldownEnd.getTime() - now.getTime()) / 1000 / 60) // minutes
        
        return {
          allowed: false,
          reason: `Please wait ${RATE_LIMITS.COOLDOWN_MINUTES} minutes between submissions.`,
          retryAfter
        }
      }
    }
    
    return { allowed: true }
    
  } catch (error) {
    console.error('Error checking rate limit:', error)
    // In case of error, allow the submission (fail open)
    return { allowed: true }
  }
}

/**
 * Record a submission attempt for rate limiting
 */
async function recordSubmission(clientId: string, questionTitle: string, success: boolean): Promise<void> {
  try {
    await addDoc(collection(db, SUBMISSIONS_COLLECTION), {
      clientId,
      timestamp: Timestamp.fromDate(new Date()),
      questionTitle: questionTitle.substring(0, 100), // Store first 100 chars for tracking
      success,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent.substring(0, 200) : 'unknown'
    })
  } catch (error) {
    console.error('Error recording submission:', error)
    // Don't throw here - submission tracking shouldn't block the main operation
  }
}

/**
 * Fetch all questions from Firestore
 */
export async function fetchQuestionsFromFirestore(): Promise<Question[]> {
  try {
    const questionsCollection = collection(db, QUESTIONS_COLLECTION)
    const questionsSnapshot = await getDocs(questionsCollection)
    
    const questions: Question[] = []
    questionsSnapshot.forEach((doc) => {
      const data = doc.data()
      questions.push({
        title: data.title || '',
        url: data.url || '',
        site: data.site || '',
      })
    })
    
    return questions
  } catch (error) {
    console.error('Error fetching questions from Firestore:', error)
    throw error
  }
}

/**
 * Add a new question to Firestore with rate limiting
 */
export async function addQuestionToFirestore(question: Question, clientId?: string): Promise<string> {
  const id = clientId || generateClientId()
  
  try {
    // Check rate limits first
    const rateLimitCheck = await checkRateLimit(id)
    if (!rateLimitCheck.allowed) {
      const error = new Error(rateLimitCheck.reason) as any
      error.code = 'rate-limit-exceeded'
      error.retryAfter = rateLimitCheck.retryAfter
      throw error
    }
    
    // Sanitize and validate the data before adding to Firestore
    const sanitizedQuestion = {
      title: sanitizeString(question.title),
      url: sanitizeUrl(question.url),
      site: sanitizeString(question.site),
      createdAt: new Date(),
      clientId: id, // Store client ID for tracking
    }
    
    // Validate that all required fields are present and valid
    if (!sanitizedQuestion.title || !sanitizedQuestion.url || !sanitizedQuestion.site) {
      await recordSubmission(id, question.title || 'invalid', false)
      throw new Error(`Invalid question data: ${JSON.stringify(question)}`)
    }
    
    const docRef = await addDoc(collection(db, PENDING_QUESTIONS_COLLECTION), sanitizedQuestion)
    
    // Record successful submission
    await recordSubmission(id, sanitizedQuestion.title, true)
    
    return docRef.id
  } catch (error) {
    console.error('Error adding question to Firestore:', error)
    
    // Record failed submission (unless it's a rate limit error)
    if (!(error as any).code?.includes('rate-limit')) {
      await recordSubmission(id, question.title || 'error', false)
    }
    
    throw error
  }
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
    .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
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
        return ''
      }
    }
    return ''
  }
}

/**
 * Get a random question from Firestore
 * Note: This is a simplified approach. For better performance with large datasets,
 * consider using a dedicated random field or other optimization strategies
 */
export async function getRandomQuestionFromFirestore(): Promise<Question | null> {
  try {
    const questionsCollection = collection(db, QUESTIONS_COLLECTION)
    const questionsSnapshot = await getDocs(questionsCollection)
    
    if (questionsSnapshot.empty) {
      return null
    }
    
    const questions: Question[] = []
    questionsSnapshot.forEach((doc) => {
      const data = doc.data()
      questions.push({
        title: data.title || '',
        url: data.url || '',
        site: data.site || '',
      })
    })
    
    const randomIndex = Math.floor(Math.random() * questions.length)
    return questions[randomIndex]
  } catch (error) {
    console.error('Error fetching random question from Firestore:', error)
    throw error
  }
}

/**
 * Get paginated questions from Firestore
 */
export async function getPaginatedQuestions(
  pageSize: number = 20,
  lastDoc?: QueryDocumentSnapshot
): Promise<{ questions: Question[]; lastDoc: QueryDocumentSnapshot | null }> {
  try {
    const questionsCollection = collection(db, QUESTIONS_COLLECTION)
    let q = query(questionsCollection, orderBy('createdAt', 'desc'), limit(pageSize))
    
    if (lastDoc) {
      q = query(questionsCollection, orderBy('createdAt', 'desc'), startAfter(lastDoc), limit(pageSize))
    }
    
    const questionsSnapshot = await getDocs(q)
    
    const questions: Question[] = []
    let lastDocument: QueryDocumentSnapshot | null = null
    
    questionsSnapshot.forEach((doc) => {
      const data = doc.data()
      questions.push({
        title: data.title || '',
        url: data.url || '',
        site: data.site || '',
      })
      lastDocument = doc
    })
    
    return { questions, lastDoc: lastDocument }
  } catch (error) {
    console.error('Error fetching paginated questions:', error)
    throw error
  }
}

/**
 * Get the total count of questions (approximate)
 * Note: Firestore doesn't provide efficient count operations,
 * so this is a simplified approach
 */
export async function getQuestionsCount(): Promise<number> {
  try {
    const questionsCollection = collection(db, QUESTIONS_COLLECTION)
    const questionsSnapshot = await getDocs(questionsCollection)
    return questionsSnapshot.size
  } catch (error) {
    console.error('Error getting questions count:', error)
    return 0
  }
}
