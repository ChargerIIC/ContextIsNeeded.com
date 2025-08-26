# Firebase Migration Guide

This guide explains how to migrate your ContextIsNeeded.com application from using CSV data to Firebase Firestore.

## Prerequisites

1. **Firebase Project**: Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. **Firestore Database**: Enable Firestore Database in your Firebase project
3. **Environment Variables**: Set up your Firebase configuration

## Step 1: Set up Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Enable Firestore Database:
   - Go to "Firestore Database" in the left sidebar
   - Click "Create database"
   - Choose "Start in test mode" (you can configure security rules later)
   - Select a location for your database

## Step 2: Get Firebase Configuration

1. In your Firebase project, go to Project Settings (gear icon)
2. Scroll down to "Your apps" section
3. Click "Add app" and select "Web" (</>) if you haven't already
4. Register your app and copy the config object

## Step 3: Set up Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your Firebase configuration in `.env.local`:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your-actual-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-actual-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-actual-sender-id
   NEXT_PUBLIC_FIREBASE_APP_ID=your-actual-app-id
   
   # Keep this as false initially
   NEXT_PUBLIC_USE_FIREBASE=false
   ```

## Step 4: Run the Migration

1. **Install dependencies** (if not already done):
   ```bash
   npm install
   ```

2. **Run the migration script**:
   ```bash
   npm run migrate:firebase
   ```

   This will:
   - Fetch all questions from your CSV file
   - Add them to your Firestore database
   - Show progress and completion status

## Step 5: Switch to Firebase

1. **Update your environment variable** in `.env.local`:
   ```env
   NEXT_PUBLIC_USE_FIREBASE=true
   ```

2. **Test the application**:
   ```bash
   npm run dev
   ```

3. **Verify the data** by checking that questions are loading from Firebase

## Step 6: Deploy with Firebase

When deploying to production (Vercel, Netlify, etc.), make sure to:

1. Add all the Firebase environment variables to your deployment platform
2. Set `NEXT_PUBLIC_USE_FIREBASE=true` in production
3. Configure Firestore security rules for production use

## Security Rules (Important!)

For production, update your Firestore security rules. Go to Firestore Database > Rules in Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to questions
    match /questions/{questionId} {
      allow read: if true;
      // Only allow writes from your application (you may want to add authentication)
      allow write: if request.auth != null; // Requires authentication
    }
  }
}
```

## Troubleshooting

### Migration Issues

1. **"Permission denied" errors**: Check your Firestore rules
2. **"Project not found"**: Verify your `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
3. **Network errors**: Check your internet connection and Firebase status

### Application Issues

1. **Questions not loading**: Check browser console for errors
2. **"Firebase not initialized"**: Verify all environment variables are set
3. **Mixed content errors**: Ensure all Firebase URLs use HTTPS

## Rollback Plan

If you need to rollback to CSV:

1. Set `NEXT_PUBLIC_USE_FIREBASE=false` in your environment variables
2. The application will automatically fallback to the CSV data source

## Data Structure

Questions in Firestore are stored with this structure:

```javascript
{
  title: "Question title",
  url: "https://example.com/question",
  site: "Site name",
  createdAt: "2024-01-01T00:00:00Z"
}
```

## Performance Considerations

- **Random questions**: The current implementation loads all questions to get a random one. For large datasets, consider implementing a more efficient random selection method.
- **Caching**: Consider implementing client-side caching for better performance.
- **Pagination**: The app includes pagination utilities for large datasets.

## Support

If you encounter issues:

1. Check the Firebase Console for error messages
2. Verify your environment variables
3. Check browser developer console for JavaScript errors
4. Ensure your Firebase project billing is set up (if using paid features)
