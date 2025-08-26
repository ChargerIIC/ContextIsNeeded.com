import { fetchAndParseCSV } from '../lib/csv-parser'
import { addQuestionToFirestore } from '../lib/firestore'

const CSV_URL = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ContextIsNeeded-aRVPvaGSpJEhXQ7RKlXGxn9UxL769l.csv"

/**
 * Migration script to move data from CSV to Firebase Firestore
 * Run this once to migrate your existing data
 */
async function migrateDataToFirebase() {
  try {
    console.log('Starting data migration from CSV to Firebase...')
    
    // Fetch questions from CSV
    console.log('Fetching questions from CSV...')
    const questions = await fetchAndParseCSV(CSV_URL)
    console.log(`Found ${questions.length} questions in CSV`)
    
    if (questions.length === 0) {
      console.log('No questions found in CSV file')
      return
    }
    
    // Add each question to Firestore
    console.log('Adding questions to Firestore...')
    let successCount = 0
    let errorCount = 0
    const failedQuestions: Array<{ index: number; question: any; error: string }> = []
    
    for (const [index, question] of questions.entries()) {
      try {
        // Log the question data for debugging
        console.log(`Processing question ${index + 1}: ${JSON.stringify(question)}`)
        
        // Validate question data before attempting to add
        if (!question.title || !question.url || !question.site) {
          throw new Error(`Missing required fields: title=${!!question.title}, url=${!!question.url}, site=${!!question.site}`)
        }
        
        const docId = await addQuestionToFirestore(question)
        successCount++
        console.log(`✅ Added question ${index + 1}/${questions.length}: "${question.title.substring(0, 50)}..." (ID: ${docId})`)
      } catch (error) {
        errorCount++
        const errorMessage = error instanceof Error ? error.message : String(error)
        failedQuestions.push({ index: index + 1, question, error: errorMessage })
        console.error(`❌ Failed to add question ${index + 1}: "${question.title}"`)
        console.error(`   Error: ${errorMessage}`)
        console.error(`   Data: ${JSON.stringify(question)}`)
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
      failedQuestions.forEach(({ index, question, error }) => {
        console.log(`Question ${index}: ${error}`)
        console.log(`  Title: "${question.title}"`)
        console.log(`  URL: "${question.url}"`)
        console.log(`  Site: "${question.site}"`)
        console.log('')
      })
    }
    
    if (errorCount === 0) {
      console.log('\n🎉 Migration completed successfully!')
    } else {
      console.log('\n⚠️ Migration completed with some errors. Please check the logs above.')
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

// Run the migration if this file is executed directly
if (require.main === module) {
  migrateDataToFirebase()
    .then(() => {
      console.log('Migration script finished')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Migration script failed:', error)
      process.exit(1)
    })
}

export { migrateDataToFirebase }
