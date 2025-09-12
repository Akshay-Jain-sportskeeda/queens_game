import { NextApiRequest, NextApiResponse } from 'next'
import { PuzzleData } from '../../types/game'

// Hardcoded Google Sheet URL - the only data source
const PUZZLE_DATA_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ7zVz3B8XRn-mIHVTBSLJ6JBp7liPx9micD9t3KOiMFAMpqqnJT1wpXbZl8KrZQ9WtGtMn0gM9Hvu9/pub?gid=0&single=true&output=csv'

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
  console.log('🚀 [fetchPuzzleData] Starting data fetch from Google Sheet...')
  console.log('🌐 [fetchPuzzleData] Google Sheet URL:', PUZZLE_DATA_URL)

  try {
    const response = await fetch(PUZZLE_DATA_URL)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const csvText = await response.text()
    console.log('✅ [fetchPuzzleData] Successfully fetched data from Google Sheet')
    console.log('📄 [fetchPuzzleData] CSV data length:', csvText?.length || 0, 'characters')
    
    if (!csvText || csvText.trim().length === 0) {
      throw new Error('Empty CSV data received from Google Sheet')
    }

    console.log('🔍 [fetchPuzzleData] Parsing CSV data...')
    const lines = csvText.trim().split('\n')
    console.log('📊 [fetchPuzzleData] CSV has', lines.length, 'lines')
    
    if (lines.length < 2) {
      throw new Error('Invalid CSV format: insufficient data')
    }
    
    // Parse header to find column indices
    const headers = parseCSVLine(lines[0])
    console.log('📋 [fetchPuzzleData] CSV headers:', headers)
    const dateIndex = headers.indexOf('date')
    const gridSizeIndex = headers.indexOf('grid_size')
    const regionsIndex = headers.indexOf('regions')
    const queensIndex = headers.indexOf('queens')
    const prefillsIndex = headers.indexOf('prefills')
    
    if (dateIndex === -1 || gridSizeIndex === -1 || regionsIndex === -1 || queensIndex === -1 || prefillsIndex === -1) {
      throw new Error('Invalid CSV format: missing required columns')
    }
    
    console.log('🎯 [fetchPuzzleData] Column indices - date:', dateIndex, 'gridSize:', gridSizeIndex, 'regions:', regionsIndex, 'queens:', queensIndex, 'prefills:', prefillsIndex)
    
    const puzzles: { [key: string]: PuzzleData } = {}
    
    // Parse all puzzle data
    for (let i = 1; i < lines.length; i++) {
      const row = parseCSVLine(lines[i])
      console.log(`📝 [fetchPuzzleData] Processing CSV row ${i}:`, row)
      
      if (row[dateIndex] && row[dateIndex] !== '') {
        console.log(`🗓️ [fetchPuzzleData] Found date in row ${i}:`, row[dateIndex])
        
        try {
          const regions = JSON.parse(row[regionsIndex].replace(/^"|"$/g, ''))
          const queens = JSON.parse(row[queensIndex].replace(/^"|"$/g, ''))
          const prefills = JSON.parse(row[prefillsIndex].replace(/^"|"$/g, ''))
          const gridSize = parseInt(row[gridSizeIndex])
          
          console.log(`🎯 [fetchPuzzleData] Parsed data for ${row[dateIndex]}:`, {
            gridSize,
            regionsLength: regions.length,
            queensCount: queens.length,
            prefillsCount: prefills.length
          })
          
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
          console.log(`✅ [fetchPuzzleData] Successfully added puzzle for date:`, row[dateIndex])
        } catch (parseError) {
          console.error(`❌ [fetchPuzzleData] Error parsing puzzle data for date ${row[dateIndex]}:`, parseError)
          const errorMessage = parseError instanceof Error ? parseError.message : String(parseError)
          throw new Error(`Failed to parse puzzle data for date ${row[dateIndex]}: ${errorMessage}`)
        }
      }
    }
    
    console.log('📊 [fetchPuzzleData] Successfully parsed puzzles for dates:', Object.keys(puzzles))
    
    // If no valid puzzles were parsed, throw error
    if (Object.keys(puzzles).length === 0) {
      throw new Error('No valid puzzles found in Google Sheet data')
    }
    
    return puzzles
  } catch (error) {
    console.error('❌ [fetchPuzzleData] Error fetching/parsing Google Sheet data:', error)
    throw error
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Debug: Log today's date and timezone info
  const today = new Date()
  const todayString = today.toISOString().split('T')[0]
  const todayLocal = new Date(today.getTime() - (today.getTimezoneOffset() * 60000)).toISOString().split('T')[0]
  console.log('🗓️ [API] Today\'s date (UTC):', todayString)
  console.log('🗓️ [API] Today\'s date (Local):', todayLocal)

  try {
    const { date } = req.query
    console.log('🔍 [API] Requested date from query:', date)
    
    const puzzles = await fetchPuzzleData()
    console.log('📊 [API] Available puzzle dates:', Object.keys(puzzles))
    console.log('📊 [API] Total puzzles loaded:', Object.keys(puzzles).length)
    
    // Debug: Check if today's date exists in different formats
    console.log('🔍 [API] Checking for today\'s puzzle:')
    console.log('  - UTC format exists:', !!puzzles[todayString])
    console.log('  - Local format exists:', !!puzzles[todayLocal])
    
    if (date && typeof date === 'string') {
      console.log('🎯 [API] Looking for specific date:', date)
      // Return specific date's puzzle
      const puzzle = puzzles[date]
      if (!puzzle) {
        console.log('❌ [API] Specific date not found')
        return res.status(404).json({ error: `No puzzle found for date: ${date}` })
      }
      console.log('✅ [API] Found specific date puzzle:', puzzle.date)
      return res.status(200).json(puzzle)
    } else {
      console.log('📋 [API] No specific date requested, returning all puzzles')
      // Return all puzzles
      return res.status(200).json(puzzles)
    }
  } catch (error) {
    console.error('❌ [API] Error:', error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    return res.status(500).json({ 
      error: 'Failed to fetch puzzle data from Google Sheet',
      details: errorMessage 
    })
  }
}