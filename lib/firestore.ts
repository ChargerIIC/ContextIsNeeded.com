import { 
  collection, 
  getDocs, 
  addDoc, 
  doc, 
  getDoc,
  query,
  orderBy,
  limit,
  startAfter,
  DocumentSnapshot,
  QueryDocumentSnapshot
} from 'firebase/firestore'
import { db } from './firebase'
import type { Question } from './csv-parser'

// Collection name in Firestore
const QUESTIONS_COLLECTION = 'questions'

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
 * Add a new question to Firestore
 */
export async function addQuestionToFirestore(question: Question): Promise<string> {
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
      throw new Error(`Invalid question data: ${JSON.stringify(question)}`)
    }
    
    const docRef = await addDoc(collection(db, QUESTIONS_COLLECTION), sanitizedQuestion)
    
    return docRef.id
  } catch (error) {
    console.error('Error adding question to Firestore:', error)
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
