import { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'
import { PuzzleData } from '../../types/game'

const PUZZLE_DATA_URL = process.env.NEXT_PUBLIC_PUZZLE_DATA_URL

// Fallback puzzle data for when external source fails
const FALLBACK_PUZZLE_DATA: { [key: string]: PuzzleData } = {
  '2025-09-08': {
    date: '2025-09-08',
    gridSize: 8,
    regions: [
      [1, 1, 1, 1, 0, 0, 0, 0],
      [1, 1, 1, 1, 1, 1, 0, 0],
      [1, 1, 4, 1, 2, 2, 2, 3],
      [4, 4, 4, 1, 2, 2, 3, 3],
      [7, 6, 4, 4, 5, 5, 3, 3],
      [7, 6, 4, 5, 5, 5, 5, 3],
      [7, 6, 6, 5, 5, 5, 5, 3],
      [7, 7, 7, 7, 5, 5, 5, 5]
    ],
    queens: [
      [0, 6], [1, 3], [2, 5], [3, 7], [4, 2], [5, 4], [6, 1], [7, 0]
    ],
    prefills: [
      [2, 5], [7, 0]
    ]
  },
  '2025-09-09': {
    date: '2025-09-09',
    gridSize: 8,
    regions: [
      [1, 1, 1, 1, 0, 0, 0, 0],
      [1, 1, 1, 1, 1, 1, 0, 0],
      [1, 1, 4, 1, 2, 2, 2, 3],
      [4, 4, 4, 1, 2, 2, 3, 3],
      [7, 6, 4, 4, 5, 5, 3, 3],
      [7, 6, 4, 5, 5, 5, 5, 3],
      [7, 6, 6, 5, 5, 5, 5, 3],
      [7, 7, 7, 7, 5, 5, 5, 5]
    ],
    queens: [
      [0, 4], [1, 6], [2, 1], [3, 3], [4, 0], [5, 7], [6, 5], [7, 2]
    ],
    prefills: []
  },
  '2025-09-10': {
    date: '2025-09-10',
    gridSize: 8,
    regions: [
      [1, 1, 1, 1, 0, 0, 0, 0],
      [1, 1, 1, 1, 1, 1, 0, 0],
      [1, 1, 4, 1, 2, 2, 2, 3],
      [4, 4, 4, 1, 2, 2, 3, 3],
      [7, 6, 4, 4, 5, 5, 3, 3],
      [7, 6, 4, 5, 5, 5, 5, 3],
      [7, 6, 6, 5, 5, 5, 5, 3],
      [7, 7, 7, 7, 5, 5, 5, 5]
    ],
    queens: [
      [0, 5], [1, 2], [2, 6], [3, 1], [4, 3], [5, 0], [6, 4], [7, 7]
    ],
    prefills: []
  },
  '2025-09-11': {
    date: '2025-09-11',
    gridSize: 8,
    regions: [
      [1, 1, 1, 1, 0, 0, 0, 0],
      [1, 1, 1, 1, 1, 1, 0, 0],
      [1, 1, 4, 1, 2, 2, 2, 3],
      [4, 4, 4, 1, 2, 2, 3, 3],
      [7, 6, 4, 4, 5, 5, 3, 3],
      [7, 6, 4, 5, 5, 5, 5, 3],
      [7, 6, 6, 5, 5, 5, 5, 3],
      [7, 7, 7, 7, 5, 5, 5, 5]
    ],
    queens: [
      [0, 2], [1, 5], [2, 7], [3, 4], [4, 6], [5, 1], [6, 3], [7, 0]
    ],
    prefills: []
  },
  '2025-09-12': {
    date: '2025-09-12',
    gridSize: 8,
    regions: [
      [1, 1, 1, 1, 0, 0, 0, 0],
      [1, 1, 1, 1, 1, 1, 0, 0],
      [1, 1, 4, 1, 2, 2, 2, 3],
      [4, 4, 4, 1, 2, 2, 3, 3],
      [7, 6, 4, 4, 5, 5, 3, 3],
      [7, 6, 4, 5, 5, 5, 5, 3],
      [7, 6, 6, 5, 5, 5, 5, 3],
      [7, 7, 7, 7, 5, 5, 5, 5]
    ],
    queens: [
      [0, 1], [1, 4], [2, 0], [3, 6], [4, 7], [5, 3], [6, 5], [7, 2]
    ],
    prefills: []
  },
  '2025-09-13': {
    date: '2025-09-13',
    gridSize: 8,
    regions: [
      [1, 1, 1, 1, 0, 0, 0, 0],
      [1, 1, 1, 1, 1, 1, 0, 0],
      [1, 1, 4, 1, 2, 2, 2, 3],
      [4, 4, 4, 1, 2, 2, 3, 3],
      [7, 6, 4, 4, 5, 5, 3, 3],
      [7, 6, 4, 5, 5, 5, 5, 3],
      [7, 6, 6, 5, 5, 5, 5, 3],
      [7, 7, 7, 7, 5, 5, 5, 5]
    ],
    queens: [
      [0, 7], [1, 1], [2, 4], [3, 2], [4, 5], [5, 0], [6, 6], [7, 3]
    ],
    prefills: []
  },
  '2025-09-14': {
    date: '2025-09-14',
    gridSize: 8,
    regions: [
      [1, 1, 1, 1, 0, 0, 0, 0],
      [1, 1, 1, 1, 1, 1, 0, 0],
      [1, 1, 4, 1, 2, 2, 2, 3],
      [4, 4, 4, 1, 2, 2, 3, 3],
      [7, 6, 4, 4, 5, 5, 3, 3],
      [7, 6, 4, 5, 5, 5, 5, 3],
      [7, 6, 6, 5, 5, 5, 5, 3],
      [7, 7, 7, 7, 5, 5, 5, 5]
    ],
    queens: [
      [0, 3], [1, 0], [2, 2], [3, 5], [4, 1], [5, 6], [6, 4], [7, 7]
    ],
    prefills: []
  },
  '2025-09-15': {
    date: '2025-09-15',
    gridSize: 8,
    regions: [
      [1, 1, 1, 1, 0, 0, 0, 0],
      [1, 1, 1, 1, 1, 1, 0, 0],
      [1, 1, 4, 1, 2, 2, 2, 3],
      [4, 4, 4, 1, 2, 2, 3, 3],
      [7, 6, 4, 4, 5, 5, 3, 3],
      [7, 6, 4, 5, 5, 5, 5, 3],
      [7, 6, 6, 5, 5, 5, 5, 3],
      [7, 7, 7, 7, 5, 5, 5, 5]
    ],
    queens: [
      [0, 0], [1, 7], [2, 3], [3, 1], [4, 4], [5, 2], [6, 6], [7, 5]
    ],
    prefills: []
  },
  '2025-09-16': {
    date: '2025-09-16',
    gridSize: 8,
    regions: [
      [1, 1, 1, 1, 0, 0, 0, 0],
      [1, 1, 1, 1, 1, 1, 0, 0],
      [1, 1, 4, 1, 2, 2, 2, 3],
      [4, 4, 4, 1, 2, 2, 3, 3],
      [7, 6, 4, 4, 5, 5, 3, 3],
      [7, 6, 4, 5, 5, 5, 5, 3],
      [7, 6, 6, 5, 5, 5, 5, 3],
      [7, 7, 7, 7, 5, 5, 5, 5]
    ],
    queens: [
      [0, 6], [1, 4], [2, 1], [3, 7], [4, 0], [5, 3], [6, 5], [7, 2]
    ],
    prefills: []
  },
  '2025-09-17': {
    date: '2025-09-17',
    gridSize: 8,
    regions: [
      [1, 1, 1, 1, 0, 0, 0, 0],
      [1, 1, 1, 1, 1, 1, 0, 0],
      [1, 1, 4, 1, 2, 2, 2, 3],
      [4, 4, 4, 1, 2, 2, 3, 3],
      [7, 6, 4, 4, 5, 5, 3, 3],
      [7, 6, 4, 5, 5, 5, 5, 3],
      [7, 6, 6, 5, 5, 5, 5, 3],
      [7, 7, 7, 7, 5, 5, 5, 5]
    ],
    queens: [
      [0, 5], [1, 7], [2, 2], [3, 0], [4, 3], [5, 1], [6, 6], [7, 4]
    ],
    prefills: []
  }
}

// Cache for puzzle data
let puzzleCache: { [key: string]: PuzzleData } = {}
let lastFetch = 0
const CACHE_DURATION = 60 * 60 * 1000 // 1 hour

function validateRegionsData(regions: any, gridSize: number): boolean {
  // Check if regions is an array
  if (!Array.isArray(regions)) {
    return false
  }
  
  // Check if regions has the correct number of rows
  if (regions.length !== gridSize) {
    return false
  }
  
  // Check each row
  for (let i = 0; i < regions.length; i++) {
    const row = regions[i]
    
    // Check if row is an array
    if (!Array.isArray(row)) {
      return false
    }
    
    // Check if row has the correct number of columns
    if (row.length !== gridSize) {
      return false
    }
    
    // Check if all values in the row are numbers
    for (let j = 0; j < row.length; j++) {
      if (typeof row[j] !== 'number') {
        return false
      }
    }
  }
  
  return true
}

function validatePuzzleData(data: any): boolean {
  if (!data || typeof data !== 'object') {
    return false
  }
  
  const { gridSize, regions, queens, prefills } = data
  
  // Validate gridSize
  if (typeof gridSize !== 'number' || gridSize <= 0) {
    return false
  }
  
  // Validate regions
  if (!validateRegionsData(regions, gridSize)) {
    return false
  }
  
  // Validate queens array
  if (!Array.isArray(queens)) {
    return false
  }
  
  // Validate prefills array
  if (!Array.isArray(prefills)) {
    return false
  }
  
  return true
}

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

function readLocalCSV(): string | null {
  try {
    const csvPath = path.join(process.cwd(), 'puzzle_data.csv')
    if (fs.existsSync(csvPath)) {
      return fs.readFileSync(csvPath, 'utf-8')
    }
  } catch (error) {
    console.error('Error reading local CSV file:', error)
  }
  return null
}

async function fetchPuzzleData(): Promise<{ [key: string]: PuzzleData }> {
  const now = Date.now()
  
  // Return cached data if still fresh
  if (now - lastFetch < CACHE_DURATION && Object.keys(puzzleCache).length > 0) {
    return puzzleCache
  }

  let csvText: string | null = null

  // First try to read from local CSV file
  csvText = readLocalCSV()
  
  // If no local CSV and external URL is configured, try fetching from external source
  if (!csvText && PUZZLE_DATA_URL) {
    try {
      console.log('Attempting to fetch puzzle data from external source...')
      const response = await fetch(PUZZLE_DATA_URL)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      csvText = await response.text()
      console.log('Successfully fetched puzzle data from external source')
    } catch (error) {
      console.warn('Failed to fetch from external source:', error.message)
      csvText = null
    }
  }

  // If we still don't have CSV data, use fallback
  if (!csvText || csvText.trim().length === 0) {
    console.warn('No CSV data available, using fallback puzzle data')
    puzzleCache = FALLBACK_PUZZLE_DATA
    lastFetch = now
    return FALLBACK_PUZZLE_DATA
  }

  try {
    const lines = csvText.trim().split('\n')
    
    if (lines.length < 2) {
      throw new Error('Invalid CSV format: insufficient data')
    }
    
    // Parse header to find column indices
    const headers = parseCSVLine(lines[0])
    const dateIndex = headers.indexOf('date')
    const gridSizeIndex = headers.indexOf('grid_size')
    const regionsIndex = headers.indexOf('regions')
    const queensIndex = headers.indexOf('queens')
    const prefillsIndex = headers.indexOf('prefills')
    
    if (dateIndex === -1 || gridSizeIndex === -1 || regionsIndex === -1 || queensIndex === -1 || prefillsIndex === -1) {
      throw new Error('Invalid CSV format: missing required columns')
    }
    
    const puzzles: { [key: string]: PuzzleData } = {}
    
    // Parse all puzzle data
    for (let i = 1; i < lines.length; i++) {
      const row = parseCSVLine(lines[i])
      if (row[dateIndex] && row[dateIndex] !== '') {
        try {
          const regions = JSON.parse(row[regionsIndex].replace(/^"|"$/g, ''))
          const queens = JSON.parse(row[queensIndex].replace(/^"|"$/g, ''))
          const prefills = JSON.parse(row[prefillsIndex].replace(/^"|"$/g, ''))
          const gridSize = parseInt(row[gridSizeIndex])
          
          const puzzleData: PuzzleData = {
            date: row[dateIndex],
            gridSize,
            regions,
            queens,
            prefills
          }
          
          // Validate the complete puzzle data
          if (!validatePuzzleData(puzzleData)) {
            throw new Error(`Invalid regions data for date ${row[dateIndex]}`)
          }
          
          puzzles[row[dateIndex]] = puzzleData
        } catch (parseError) {
          console.error(`Error parsing puzzle data for date ${row[dateIndex]}:`, parseError)
          continue
        }
      }
    }
    
    // If no valid puzzles were parsed, use fallback data
    if (Object.keys(puzzles).length === 0) {
      console.warn('No valid puzzles found in external data, using fallback data')
      puzzleCache = FALLBACK_PUZZLE_DATA
      lastFetch = now
      return FALLBACK_PUZZLE_DATA
    }
    
    puzzleCache = puzzles
    lastFetch = now
    
    return puzzles
  } catch (error) {
    console.error('Error fetching puzzle data:', error)
    console.warn('Using fallback puzzle data due to fetch error')
    
    // Return fallback data instead of throwing error
    puzzleCache = FALLBACK_PUZZLE_DATA
    lastFetch = now
    return FALLBACK_PUZZLE_DATA
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  console.log('🔍 [API] Puzzle data request received')
  console.log('🔍 [API] Query params:', req.query)

  try {
    const { date } = req.query
    const puzzles = await fetchPuzzleData()
    
    console.log('📅 [API] Available puzzle dates:', Object.keys(puzzles))
    console.log('📅 [API] Today\'s date (server):', new Date().toISOString().split('T')[0])
    
    if (date && typeof date === 'string') {
      console.log('🎯 [API] Requested specific date:', date)
      // Return specific date's puzzle
      const puzzle = puzzles[date]
      if (!puzzle) {
        console.log('❌ [API] Puzzle not found for date:', date)
        // If specific date not found, return the first available puzzle
        const firstPuzzle = Object.values(puzzles)[0]
        if (firstPuzzle) {
          console.log('🔄 [API] Returning first available puzzle:', firstPuzzle.date)
          return res.status(200).json(firstPuzzle)
        }
        console.log('❌ [API] No puzzles available at all')
        return res.status(404).json({ error: 'No puzzles available' })
      }
      console.log('✅ [API] Returning puzzle for date:', puzzle.date)
      return res.status(200).json(puzzle)
    } else {
      console.log('📋 [API] Returning all puzzles, count:', Object.keys(puzzles).length)
      // Return all puzzles
      return res.status(200).json(puzzles)
    }
  } catch (error) {
    console.error('❌ [API] Error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
