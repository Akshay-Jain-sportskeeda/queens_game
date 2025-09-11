import { initializeApp, getApps } from 'firebase/app'
import { getAuth, Auth } from 'firebase/auth'
import { getAnalytics, Analytics } from 'firebase/analytics'
import { getFirestore, Firestore, connectFirestoreEmulator } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || '',
}

// Only initialize Firebase if we have a valid API key
let app
if (firebaseConfig.apiKey && firebaseConfig.apiKey !== '') {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
} else {
  console.warn('Firebase configuration is missing. Please check your .env.local file.')
  // Create a mock app for development
  app = null
}

// Initialize Firebase Authentication and get a reference to the service
export const auth: Auth | null = app ? getAuth(app) : null

// Initialize Firestore and get a reference to the service with custom database
export const db: Firestore | null = app ? getFirestore(app, 'leaderboards') : null

// Initialize Firebase Analytics (only in browser environment)
export let analytics: Analytics | null = null
if (typeof window !== 'undefined' && app) {
  analytics = getAnalytics(app)
}

export default app