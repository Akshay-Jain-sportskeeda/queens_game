import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs, 
  addDoc, 
  runTransaction,
  doc,
  Timestamp,
  QuerySnapshot,
  DocumentData
} from 'firebase/firestore'
import { db } from './firebase'
import { User } from 'firebase/auth'

export interface GameResult {
  id?: string
  userId: string
  displayName: string
  moves: number
  hintsUsed: number
  totalTime: number
  score: number
  puzzleDate: string
  completedAt: Date
}

export const COLLECTION_NAME = 'nfl-field-puzzle'

// Save game result to Firestore (with no overwrite protection)
export async function saveGameResult(
  user: User,
  puzzleDate: string,
  moves: number,
  hintsUsed: number,
  totalTime: number,
  score: number
): Promise<boolean> {
  if (!db) {
    console.error('❌ [saveGameResult] Firestore is not initialized')
    console.error('❌ [saveGameResult] Firestore is not initialized')
    return false
  }

  console.log('🎯 [saveGameResult] Starting save operation:', {
    userId: user.uid,
    displayName: user.displayName || user.email?.split('@')[0] || 'Anonymous',
    puzzleDate,
    moves,
    hintsUsed,
    totalTime,
    score
  })
  console.log('🎯 [saveGameResult] Starting save operation:', {
    userId: user.uid,
    displayName: user.displayName || user.email?.split('@')[0] || 'Anonymous',
    puzzleDate,
    moves,
    hintsUsed,
    totalTime,
    score
  })

  try {
    const result = await runTransaction(db, async (transaction) => {
      console.log('🔄 [saveGameResult] Starting transaction...')
      
      console.log('🔄 [saveGameResult] Starting transaction...')
      
      // Check if a record already exists for this user and puzzle date
      const existingQuery = query(
        collection(db!, COLLECTION_NAME),
        where('userId', '==', user.uid),
        where('puzzleDate', '==', puzzleDate)
      )
      
      console.log('🔍 [saveGameResult] Checking for existing records...')
      console.log('🔍 [saveGameResult] Checking for existing records...')
      const existingDocs = await getDocs(existingQuery)
      
      if (!existingDocs.empty) {
        console.log('⚠️ [saveGameResult] Game result already exists for this user and date, not overwriting')
        console.log('📄 [saveGameResult] Existing document ID:', existingDocs.docs[0].id)
        console.log('⚠️ [saveGameResult] Game result already exists for this user and date, not overwriting')
        console.log('📄 [saveGameResult] Existing document ID:', existingDocs.docs[0].id)
        return false
      }

      console.log('✅ [saveGameResult] No existing record found, creating new document...')
      
      console.log('✅ [saveGameResult] No existing record found, creating new document...')
      
      // Create new document
      const gameResult: Omit<GameResult, 'id'> = {
        userId: user.uid,
        displayName: user.displayName || user.email?.split('@')[0] || 'Anonymous',
        moves,
        hintsUsed,
        totalTime,
        score,
        puzzleDate,
        completedAt: new Date()
      }

      console.log('📝 [saveGameResult] Document data to save:', gameResult)
      
      console.log('📝 [saveGameResult] Document data to save:', gameResult)
      
      await addDoc(collection(db!, COLLECTION_NAME), gameResult)
      console.log('💾 [saveGameResult] Document successfully added to Firestore')
      console.log('💾 [saveGameResult] Document successfully added to Firestore')
      return true
    })

    if (result) {
      console.log('🎉 [saveGameResult] Game result saved successfully')
    } else {
      console.log('ℹ️ [saveGameResult] Game result not saved (already exists)')
    }
    if (result) {
      console.log('🎉 [saveGameResult] Game result saved successfully')
    } else {
      console.log('ℹ️ [saveGameResult] Game result not saved (already exists)')
    }
    return result
  } catch (error) {
    console.error('❌ [saveGameResult] Error saving game result:', error)
    console.error('❌ [saveGameResult] Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    })
    console.error('❌ [saveGameResult] Error saving game result:', error)
    console.error('❌ [saveGameResult] Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    })
    return false
  }
}

// Fetch leaderboard for a specific date
export async function fetchLeaderboard(puzzleDate: string): Promise<GameResult[]> {
  if (!db) {
    console.error('❌ [fetchLeaderboard] Firestore is not initialized')
    return []
  }

  console.log('📊 [fetchLeaderboard] Fetching leaderboard for date:', puzzleDate)

  try {
    // Simplified query to avoid composite index requirement
    // We'll sort in JavaScript instead of using multiple orderBy clauses
    const leaderboardQuery = query(
      collection(db!, COLLECTION_NAME),
      where('puzzleDate', '==', puzzleDate)
    )

    console.log('🔍 [fetchLeaderboard] Executing query...')
    const querySnapshot = await getDocs(leaderboardQuery)
    console.log('📄 [fetchLeaderboard] Query returned', querySnapshot.size, 'documents')
    
    const results: GameResult[] = []

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      console.log('📋 [fetchLeaderboard] Processing document:', doc.id, data)
      results.push({
        id: doc.id,
        userId: data.userId,
        displayName: data.displayName,
        moves: data.moves,
        hintsUsed: data.hintsUsed,
        totalTime: data.totalTime,
        score: data.score,
        puzzleDate: data.puzzleDate,
        completedAt: data.completedAt.toDate()
      })
    })

    // Sort results in JavaScript to avoid Firestore composite index requirement
    results.sort((a, b) => {
      // Primary sort: score (descending - higher scores first)
      if (b.score !== a.score) {
        return b.score - a.score
      }
      // Secondary sort: hints used (ascending - fewer hints first)
      if (a.hintsUsed !== b.hintsUsed) {
        return a.hintsUsed - b.hintsUsed
      }
      // Tertiary sort: moves (ascending - fewer moves first)
      return a.moves - b.moves
    })

    // Limit to top 20 results
    const topResults = results.slice(0, 20)

    console.log('🏆 [fetchLeaderboard] Final results:', topResults)
    return topResults
  } catch (error) {
    console.error('❌ [fetchLeaderboard] Error fetching leaderboard:', error)
    console.error('❌ [fetchLeaderboard] Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    })
    return []
  }
}

// Get user's rank for a specific puzzle date
export async function getUserRank(userId: string, puzzleDate: string): Promise<{ rank: number; userEntry: GameResult } | null> {
  if (!db) {
    console.error('Firestore is not initialized')
    return null
  }

  try {
    // Get all entries for the puzzle date (we'll sort in JavaScript)
    const allEntriesQuery = query(
      collection(db!, COLLECTION_NAME),
      where('puzzleDate', '==', puzzleDate)
    )

    const querySnapshot = await getDocs(allEntriesQuery)
    const allEntries: GameResult[] = []
    let userEntry: GameResult | null = null

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      const entry: GameResult = {
        id: doc.id,
        userId: data.userId,
        displayName: data.displayName,
        moves: data.moves,
        hintsUsed: data.hintsUsed,
        totalTime: data.totalTime,
        score: data.score,
        puzzleDate: data.puzzleDate,
        completedAt: data.completedAt.toDate()
      }

      allEntries.push(entry)
      if (data.userId === userId) {
        userEntry = entry
      }
    })

    if (!userEntry) {
      return null
    }

    // Sort all entries using the same logic as leaderboard
    allEntries.sort((a, b) => {
      // Primary sort: score (descending - higher scores first)
      if (b.score !== a.score) {
        return b.score - a.score
      }
      // Secondary sort: hints used (ascending - fewer hints first)
      if (a.hintsUsed !== b.hintsUsed) {
        return a.hintsUsed - b.hintsUsed
      }
      // Tertiary sort: moves (ascending - fewer moves first)
      return a.moves - b.moves
    })

    // Find user's rank in the sorted list
    const rank = allEntries.findIndex(entry => entry.userId === userId) + 1

    if (rank > 0) {
      return { rank, userEntry }
    }

    return null
  } catch (error) {
    console.error('Error getting user rank:', error)
    return null
  }
}

// Fetch user's game history
export async function fetchUserGameHistory(userId: string): Promise<GameResult[]> {
  if (!db) {
    console.error('Firestore is not initialized')
    return []
  }

  try {
    // Simplified query to avoid composite index requirement
    // We'll sort in JavaScript instead of using orderBy with where clause
    const userHistoryQuery = query(
      collection(db!, COLLECTION_NAME),
      where('userId', '==', userId)
    )

    const querySnapshot = await getDocs(userHistoryQuery)
    const results: GameResult[] = []

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      results.push({
        id: doc.id,
        userId: data.userId,
        displayName: data.displayName,
        moves: data.moves,
        hintsUsed: data.hintsUsed,
        totalTime: data.totalTime,
        score: data.score,
        puzzleDate: data.puzzleDate,
        completedAt: data.completedAt.toDate()
      })
    })

    // Sort results in JavaScript to avoid Firestore composite index requirement
    results.sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime())

    return results
  } catch (error) {
    console.error('Error fetching user game history:', error)
    return []
  }
}