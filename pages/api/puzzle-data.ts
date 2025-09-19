import { NextApiRequest, NextApiResponse } from 'next'
import { PuzzleData } from '../../types/game'

// Hardcoded Google Sheet URL - the only data source
const PUZZLE_DATA_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ7zVz3B8XRn-mIHVTBSLJ6JBp7liPx9micD9t3KOiMFAMpqqnJT1wpXbZl8KrZQ9WtGtMn0gM9Hvu9/pub?output=csv&gid=0'

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

async function fetchPuzzleData(): Promise<{ [key: string]: PuzzleData }> {
  try {
    const response = await fetch(PUZZLE_DATA_URL, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NextJS-App/1.0)',
        'Accept': 'text/csv,text/plain,*/*',
        'Cache-Control': 'no-cache'
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`)
    }
    
    const csvText = await response.text()
    
    if (!csvText || csvText.trim().length === 0) {
      throw new Error('Empty CSV data received from Google Sheet')
    }

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
            throw new Error(`Invalid puzzle data for date ${row[dateIndex]}`)
          }
          
          puzzles[row[dateIndex]] = puzzleData
        } catch (parseError) {
          const errorMessage = parseError instanceof Error ? parseError.message : String(parseError)
          throw new Error(`Failed to parse puzzle data for date ${row[dateIndex]}: ${errorMessage}`)
        }
      }
    }
    
    // If no valid puzzles were parsed, throw error
    if (Object.keys(puzzles).length === 0) {
      throw new Error('No valid puzzles found in Google Sheet data')
    }
    
    return puzzles
  } catch (error) {
    // Provide more specific error information
    if (error instanceof TypeError && error.message.includes('fetch failed')) {
      throw new Error('Unable to connect to Google Sheets. Please check sheet permissions and URL.')
    }
    
    throw error
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
        return res.status(404).json({ error: `No puzzle found for date: ${date}` })
      }
      return res.status(200).json(puzzle)
    } else {
      // Return all puzzles
      return res.status(200).json(puzzles)
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    return res.status(500).json({ 
      error: 'Failed to fetch puzzle data from Google Sheet',
      details: errorMessage 
    })
  }
}