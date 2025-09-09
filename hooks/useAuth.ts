import { useState, useEffect } from 'react'
import { 
  User, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth'
import { auth } from '../utils/firebase'

export interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null
  })

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthState({
        user,
        loading: false,
        error: null
      })
    })

    return () => unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }))
      await signInWithEmailAndPassword(auth, email, password)
    } catch (error: any) {
      setAuthState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message || 'An error occurred during sign in' 
      }))
    }
  }

  const signUp = async (email: string, password: string, displayName?: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }))
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      
      // Update the user's display name if provided
      if (displayName && userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: displayName
        })
      }
    } catch (error: any) {
      let errorMessage = 'An error occurred during sign up'
      
      // Handle specific Firebase auth errors
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'An account with this email already exists'
          break
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address'
          break
        case 'auth/operation-not-allowed':
          errorMessage = 'Email/password accounts are not enabled'
          break
        case 'auth/weak-password':
          errorMessage = 'Password should be at least 6 characters'
          break
        default:
          errorMessage = error.message || errorMessage
      }
      
      setAuthState(prev => ({ 
        ...prev, 
        loading: false, 
        error: errorMessage
      }))
    }
  }

  const signInWithGoogle = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }))
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
    } catch (error: any) {
      let errorMessage = 'Failed to sign in with Google'
      
      // Handle specific Google sign-in errors
      switch (error.code) {
        case 'auth/popup-blocked':
          errorMessage = 'Pop-up was blocked by your browser. Please allow pop-ups for this site and try again.'
          break
        case 'auth/popup-closed-by-user':
          errorMessage = 'Sign-in was cancelled. Please try again.'
          break
        case 'auth/cancelled-popup-request':
          errorMessage = 'Sign-in was cancelled. Please try again.'
          break
        default:
          errorMessage = error.message || errorMessage
      }
      
      setAuthState(prev => ({ 
        ...prev, 
        loading: false, 
        error: errorMessage
      }))
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
    } catch (error: any) {
      setAuthState(prev => ({ 
        ...prev, 
        error: error.message || 'An error occurred during sign out' 
      }))
    }
  }

  return {
    ...authState,
    signIn,
    signUp,
    signInWithGoogle,
    logout
  }
}