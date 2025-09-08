import { useState, useCallback, useRef, useEffect } from 'react'
import { PuzzleData, GameState, HintData } from '../types/game'

export function useGameLogic(initialPuzzleData: PuzzleData) {
  const [gameState, setGameState] = useState<GameState>(() => ({
    board: Array(initialPuzzleData.gridSize).fill().map(() => Array(initialPuzzleData.gridSize).fill('')),
    history: [],
    violations: new Set(),
    moveCount: 0,
    hintCount: 0,
    startTime: Date.now(),
    gameCompleted: false
  }))

  const [puzzleData, setPuzzleData] = useState<PuzzleData>(initialPuzzleData)
  const [infoMessage, setInfoMessage] = useState({ text: '', type: 'default' })
  const validationTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize board with prefills only when puzzleData changes
  useEffect(() => {
    const newBoard = Array(puzzleData.gridSize).fill().map(() => Array(puzzleData.gridSize).fill(''))
    puzzleData.prefills.forEach(([row, col]) => {
      if (row < puzzleData.gridSize && col < puzzleData.gridSize) {
        newBoard[row][col] = '🏈'
      }
    })
    
    setGameState(prev => ({
      ...prev,
      board: newBoard,
      history: [],
      violations: new Set(),
      moveCount: 0,
      hintCount: 0,
      startTime: Date.now(),
      gameCompleted: false
    }))
  }, [puzzleData.date, puzzleData.gridSize, puzzleData.prefills])

  const saveState = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      history: [...prev.history.slice(-49), prev.board.map(row => [...row])]
    }))
  }, [])

  const checkWinCondition = useCallback((board: string[][], footballCount: number): boolean => {
    if (footballCount !== puzzleData.gridSize) return false
    
    // Check rows
    for (let row = 0; row < puzzleData.gridSize; row++) {
      let rowFootballs = 0
      for (let col = 0; col < puzzleData.gridSize; col++) {
        if (board[row][col] === '🏈') rowFootballs++
      }
      if (rowFootballs !== 1) return false
    }
    
    // Check columns
    for (let col = 0; col < puzzleData.gridSize; col++) {
      let colFootballs = 0
      for (let row = 0; row < puzzleData.gridSize; row++) {
        if (board[row][col] === '🏈') colFootballs++
      }
      if (colFootballs !== 1) return false
    }
    
    // Check regions
    const regionFootballs: { [key: number]: number } = {}
    for (let row = 0; row < puzzleData.gridSize; row++) {
      for (let col = 0; col < puzzleData.gridSize; col++) {
        if (board[row][col] === '🏈') {
          const region = puzzleData.regions[row][col]
          regionFootballs[region] = (regionFootballs[region] || 0) + 1
        }
      }
    }
    
    // Check if each region has exactly one football
    const uniqueRegions = new Set(puzzleData.regions.flat())
    for (let region of uniqueRegions) {
      if (regionFootballs[region] !== 1) return false
    }
    
    return true
  }, [puzzleData.gridSize, puzzleData.regions])

  const validateAndHighlight = useCallback(() => {
    setGameState(prev => {
      const violations = new Set<string>()
      const conflictTypes = new Map<string, string>()

      // Find all footballs on the board
      const footballs: number[][] = []
      for (let row = 0; row < puzzleData.gridSize; row++) {
        for (let col = 0; col < puzzleData.gridSize; col++) {
          if (prev.board[row][col] === '🏈') {
            footballs.push([row, col])
          }
        }
      }

      // Check each football against every other football for conflicts
      for (let i = 0; i < footballs.length; i++) {
        const [row1, col1] = footballs[i]
        
        for (let j = i + 1; j < footballs.length; j++) {
          const [row2, col2] = footballs[j]
          
          // Check if they're in the same row
          if (row1 === row2) {
            for (let c = 0; c < puzzleData.gridSize; c++) {
              violations.add(`${row1},${c}`)
              conflictTypes.set(`${row1},${c}`, 'row')
            }
          }
          
          // Check if they're in the same column
          if (col1 === col2) {
            for (let r = 0; r < puzzleData.gridSize; r++) {
              violations.add(`${r},${col1}`)
              conflictTypes.set(`${r},${col1}`, 'column')
            }
          }
          
          // Check if they're in the same region
          if (puzzleData.regions[row1][col1] === puzzleData.regions[row2][col2]) {
            for (let r = 0; r < puzzleData.gridSize; r++) {
              for (let c = 0; c < puzzleData.gridSize; c++) {
                if (puzzleData.regions[r][c] === puzzleData.regions[row1][col1]) {
                  violations.add(`${r},${c}`)
                  conflictTypes.set(`${r},${c}`, 'region')
                }
              }
            }
          }
          
          // Check if they're adjacent (touching)
          const rowDiff = Math.abs(row1 - row2)
          const colDiff = Math.abs(col1 - col2)
          if (rowDiff <= 1 && colDiff <= 1) {
            violations.add(`${row1},${col1}`)
            violations.add(`${row2},${col2}`)
            conflictTypes.set(`${row1},${col1}`, 'adjacent')
            conflictTypes.set(`${row2},${col2}`, 'adjacent')
          }
        }
      }

      // Check win condition
      const isWin = checkWinCondition(prev.board, footballs.length)
      
      return {
        ...prev,
        violations,
        gameCompleted: isWin
      }
    })
  }, [puzzleData.gridSize, puzzleData.regions, checkWinCondition])

  const debouncedValidation = useCallback(() => {
    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current)
    }

    validationTimeoutRef.current = setTimeout(() => {
      validateAndHighlight()
    }, 300)
  }, [validateAndHighlight])

  const handleCellClick = useCallback((row: number, col: number) => {
    setGameState(prev => {
      if (prev.gameCompleted) return prev
      
      // Check if cell is prefilled
      const isPrefilled = puzzleData.prefills.some(([r, c]) => r === row && c === col)
      if (isPrefilled) return prev

      const newBoard = prev.board.map(r => [...r])
      const currentValue = newBoard[row][col]
      let newValue = ''

      if (currentValue === '') {
        newValue = 'X'
      } else if (currentValue === 'X') {
        newValue = '🏈'
      } else {
        newValue = ''
      }

      newBoard[row][col] = newValue

      return {
        ...prev,
        board: newBoard,
        moveCount: prev.moveCount + 1
      }
    })

    saveState()
    debouncedValidation()
  }, [puzzleData.prefills, saveState, debouncedValidation])

  const undo = useCallback(() => {
    setGameState(prev => {
      if (prev.history.length > 0) {
        const newHistory = [...prev.history]
        const previousBoard = newHistory.pop()!
        return {
          ...prev,
          board: previousBoard,
          history: newHistory,
          gameCompleted: false
        }
      }
      return prev
    })
    debouncedValidation()
  }, [debouncedValidation])

  const getHint = useCallback(() => {
    setGameState(prev => {
      if (prev.gameCompleted) return prev
      
      // Simple hint: just increment hint count for now
      return {
        ...prev,
        hintCount: prev.hintCount + 1
      }
    })
    
    setInfoMessage({ text: 'Hint: Try placing a football in a different position', type: 'hint' })
  }, [])

  const reset = useCallback(() => {
    const newBoard = Array(puzzleData.gridSize).fill().map(() => Array(puzzleData.gridSize).fill(''))
    puzzleData.prefills.forEach(([row, col]) => {
      if (row < puzzleData.gridSize && col < puzzleData.gridSize) {
        newBoard[row][col] = '🏈'
      }
    })
    
    setGameState({
      board: newBoard,
      history: [],
      violations: new Set(),
      moveCount: 0,
      hintCount: 0,
      startTime: Date.now(),
      gameCompleted: false
    })
    setInfoMessage({ text: 'Use hints if you get stuck!', type: 'default' })
  }, [puzzleData])

  const shareResults = useCallback(() => {
    const endTime = Date.now()
    const totalTime = Math.floor((endTime - gameState.startTime) / 1000)
    const minutes = Math.floor(totalTime / 60)
    const seconds = totalTime % 60
    const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`
    
    const shareText = `🏈 NFL Field Puzzle Complete! 🎉\n⏱️ Time: ${timeString}\n🎯 Moves: ${gameState.moveCount}\n💡 Hints: ${gameState.hintCount}\n\nPlay at: ${window.location.href}`
    
    if (navigator.share) {
      navigator.share({
        title: 'NFL Field Puzzle',
        text: shareText,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(shareText).then(() => {
        alert('Results copied to clipboard!')
      }).catch(() => {
        alert(shareText)
      })
    }
  }, [gameState])

  const loadPuzzleForDate = useCallback(async (date: string) => {
    try {
      const response = await fetch(`/api/puzzle-data?date=${date}`)
      const newPuzzleData = await response.json()
      setPuzzleData(newPuzzleData)
    } catch (error) {
      console.error('Error loading puzzle for date:', error)
    }
  }, [])

  const showInfoMessage = useCallback((text: string, type: string) => {
    setInfoMessage({ text, type })
  }, [])

  const clearHintHighlights = useCallback(() => {
    // Clear hint highlights functionality would be implemented here
  }, [])

  const resetInfoMessage = useCallback(() => {
    setInfoMessage({ text: 'Use hints if you get stuck!', type: 'default' })
  }, [])

  return {
    gameState,
    puzzleData,
    infoMessage,
    handleCellClick,
    undo,
    getHint,
    reset,
    shareResults,
    loadPuzzleForDate,
    showInfoMessage,
    clearHintHighlights,
    resetInfoMessage
  }
}