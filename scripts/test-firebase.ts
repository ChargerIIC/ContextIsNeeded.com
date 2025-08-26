/**
 * Firebase Connection Test Script
 * This script tests the Firebase connection and Firestore permissions
 */

import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc, getDocs } from 'firebase/firestore'
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

console.log('🔧 Firebase Configuration Test')
console.log('================================')

// Validate configuration
function validateFirebaseConfig() {
  const requiredFields = [
    'apiKey', 'authDomain', 'projectId', 
    'storageBucket', 'messagingSenderId', 'appId'
  ]
  
  console.log('📋 Checking Firebase Configuration:')
  let allValid = true
  
  for (const field of requiredFields) {
    const value = firebaseConfig[field as keyof typeof firebaseConfig]
    if (!value) {
      console.log(`❌ Missing: ${field}`)
      allValid = false
    } else {
      console.log(`✅ ${field}: ${field === 'apiKey' ? value.substring(0, 10) + '...' : value}`)
    }
  }
  
  if (!allValid) {
    throw new Error('Incomplete Firebase configuration')
  }
  
  return true
}

// Initialize Firebase
let app: any
let db: any

async function testFirebaseConnection() {
  try {
    console.log('\n🚀 Initializing Firebase...')
    validateFirebaseConfig()
    
    app = initializeApp(firebaseConfig)
    db = getFirestore(app)
    console.log('✅ Firebase initialized successfully')
    
    // Test read permissions
    console.log('\n📖 Testing read permissions...')
    try {
      const questionsCollection = collection(db, 'questions')
      const snapshot = await getDocs(questionsCollection)
      console.log(`✅ Read test successful - found ${snapshot.size} existing documents`)
    } catch (readError) {
      console.error('❌ Read test failed:', readError)
      throw readError
    }
    
    // Test write permissions
    console.log('\n✍️ Testing write permissions...')
    try {
      const testDoc = {
        title: 'Test Question - ' + new Date().toISOString(),
        url: 'https://example.com/test',
        site: 'Test Site',
        createdAt: new Date(),
        isTest: true
      }
      
      const docRef = await addDoc(collection(db, 'questions'), testDoc)
      console.log(`✅ Write test successful - created document with ID: ${docRef.id}`)
      
      return true
    } catch (writeError: any) {
      console.error('❌ Write test failed:', writeError)
      
      // Provide specific guidance based on the error
      if (writeError?.code === 'permission-denied') {
        console.log('\n🔒 PERMISSION DENIED ERROR DETECTED')
        console.log('=====================================')
        console.log('This means your Firestore security rules are blocking writes.')
        console.log('\nTo fix this:')
        console.log('1. Go to Firebase Console: https://console.firebase.google.com/')
        console.log(`2. Select your project: ${firebaseConfig.projectId}`)
        console.log('3. Go to "Firestore Database" → "Rules"')
        console.log('4. Replace the rules with:')
        console.log('\n   rules_version = \'2\';')
        console.log('   service cloud.firestore {')
        console.log('     match /databases/{database}/documents {')
        console.log('       match /{document=**} {')
        console.log('         allow read, write: if true;')
        console.log('       }')
        console.log('     }')
        console.log('   }')
        console.log('\n5. Click "Publish"')
        console.log('\n⚠️  NOTE: These rules allow public access. For production,')
        console.log('   implement proper authentication and more restrictive rules.')
      }
      
      throw writeError
    }
    
  } catch (error: any) {
    console.error('\n💥 Firebase connection test failed:', error)
    
    if (error?.code === 'auth/invalid-api-key') {
      console.log('\n🔑 Invalid API Key')
      console.log('Please check your NEXT_PUBLIC_FIREBASE_API_KEY in .env.local')
    } else if (error?.code === 'auth/project-not-found') {
      console.log('\n🏗️ Project Not Found')
      console.log('Please check your NEXT_PUBLIC_FIREBASE_PROJECT_ID in .env.local')
    }
    
    return false
  }
}

// Run the test
async function main() {
  console.log('Starting Firebase connection test...\n')
  
  const success = await testFirebaseConnection()
  
  if (success) {
    console.log('\n🎉 All tests passed! Your Firebase setup is working correctly.')
    console.log('You can now run: npm run migrate:standalone')
  } else {
    console.log('\n❌ Tests failed. Please fix the issues above before running migration.')
  }
  
  process.exit(success ? 0 : 1)
}

main().catch(console.error)
