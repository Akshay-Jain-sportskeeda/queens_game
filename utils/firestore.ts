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

export const COLLECTION_NAME = 'nfl-octobox'

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
    return false
  }

  try {
    const result = await runTransaction(db, async (transaction) => {
      // Check if a record already exists for this user and puzzle date
      const existingQuery = query(
        collection(db!, COLLECTION_NAME),
        where('userId', '==', user.uid),
        where('puzzleDate', '==', puzzleDate)
      )
      
      const existingDocs = await getDocs(existingQuery)
      
      if (!existingDocs.empty) {
        return false
      }

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

      await addDoc(collection(db!, COLLECTION_NAME), gameResult)
      return true
    })

    return result
  } catch (error) {
    return false
  }
}

// Fetch leaderboard for a specific date
export async function fetchLeaderboard(puzzleDate: string): Promise<GameResult[]> {
  if (!db) {
    return []
  }

  try {
    // Simplified query to avoid composite index requirement
    // We'll sort in JavaScript instead of using multiple orderBy clauses
    const leaderboardQuery = query(
      collection(db!, COLLECTION_NAME),
      where('puzzleDate', '==', puzzleDate)
    )

    const querySnapshot = await getDocs(leaderboardQuery)
    
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

    return topResults
  } catch (error) {
    return []
  }
}

// Get user's rank for a specific puzzle date
export async function getUserRank(userId: string, puzzleDate: string): Promise<{ rank: number; userEntry: GameResult } | null> {
  if (!db) {
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
    return null
  }
}

// Fetch user's game history
export async function fetchUserGameHistory(userId: string): Promise<GameResult[]> {
  if (!db) {
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
    return []
  }
}