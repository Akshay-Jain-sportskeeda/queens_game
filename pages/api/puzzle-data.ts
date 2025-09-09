import { NextApiRequest, NextApiResponse } from 'next'
import { PuzzleData } from '../../types/game'

const PUZZLE_DATA_URL = process.env.NEXT_PUBLIC_PUZZLE_DATA_URL || 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ7zVz3B8XRn-mIHVTBSLJ6JBp7liPx9micD9t3KOiMFAMpqqnJT1wpXbZl8KrZQ9WtGtMn0gM9Hvu9/pub?gid=0&single=true&output=csv'

// Cache for puzzle data
let puzzleCache: { [key: string]: PuzzleData } = {}
let lastFetch = 0
const CACHE_DURATION = 60 * 60 * 1000 // 1 hour

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  result.push(current.trim())
  return result
}

async function fetchPuzzleData(): Promise<{ [key: string]: PuzzleData }> {
  const now = Date.now()
  
  // Return cached data if still fresh
  if (now - lastFetch < CACHE_DURATION && Object.keys(puzzleCache).length > 0) {
    return puzzleCache
  }

  try {
    const response = await fetch(PUZZLE_DATA_URL)
    const csvText = await response.text()
    const lines = csvText.trim().split('\n')
    
    // Parse header to find column indices
    const headers = parseCSVLine(lines[0])
    const dateIndex = headers.indexOf('date')
    const gridSizeIndex = headers.indexOf('grid_size')
    const regionsIndex = headers.indexOf('regions')
    const queensIndex = headers.indexOf('queens')
    const prefillsIndex = headers.indexOf('prefills')
    
    const puzzles: { [key: string]: PuzzleData } = {}
    
    // Parse all puzzle data
    for (let i = 1; i < lines.length; i++) {
      const row = parseCSVLine(lines[i])
      if (row[dateIndex] && row[dateIndex] !== '') {
        try {
          const regions = JSON.parse(row[regionsIndex].replace(/^"|"$/g, ''))
          const queens = JSON.parse(row[queensIndex].replace(/^"|"$/g, ''))
          const prefills = JSON.parse(row[prefillsIndex].replace(/^"|"$/g, ''))
          
          // Validate regions data
          if (!regions || regions.length === 0 || !Array.isArray(regions[0])) {
            throw new Error(`Invalid regions data for date ${row[dateIndex]}`)
          }
          
          const puzzleData: PuzzleData = {
            date: row[dateIndex],
            gridSize: parseInt(row[gridSizeIndex]),
            regions,
            queens,
            prefills
          }
          puzzles[row[dateIndex]] = puzzleData
        } catch (parseError) {
          console.error(`Error parsing puzzle data for date ${row[dateIndex]}:`, parseError)
          continue
        }
      }
    }
    
    puzzleCache = puzzles
    lastFetch = now
    
    return puzzles
  } catch (error) {
    console.error('Error fetching puzzle data:', error)
    throw new Error('Failed to fetch puzzle data')
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { date } = req.query
    const puzzles = await fetchPuzzleData()
    
    if (date && typeof date === 'string') {
      // Return specific date's puzzle
      const puzzle = puzzles[date]
      if (!puzzle) {
        return res.status(404).json({ error: 'Puzzle not found for the specified date' })
      }
      return res.status(200).json(puzzle)
    } else {
      // Return all puzzles
      return res.status(200).json(puzzles)
    }
  } catch (error) {
    console.error('API Error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
