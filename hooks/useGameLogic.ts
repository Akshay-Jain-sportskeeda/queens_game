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
  const [hintHighlights, setHintHighlights] = useState<Set<string>>(new Set())
  const validationTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const showInfoMessage = useCallback((text: string, type: string) => {
    setInfoMessage({ text, type })
  }, [])

  const resetInfoMessage = useCallback(() => {
    setInfoMessage({ text: 'Use hints if you get stuck!', type: 'default' })
  }, [])

  const clearHintHighlights = useCallback(() => {
    setHintHighlights(new Set())
    resetInfoMessage()
  }, [resetInfoMessage])

  const addHintHighlight = useCallback((cells: number[][]) => {
    const highlights = new Set<string>()
    cells.forEach(([row, col]) => {
      highlights.add(`${row},${col}`)
    })
    setHintHighlights(highlights)
  }, [])
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
    // Clear any existing hint highlights when user makes a move
    clearHintHighlights()
    
    setGameState(prev => {
      if (prev.gameCompleted) return prev
      
      // Check if cell is prefilled
      const isPrefilled = puzzleData.prefills.some(([r, c]) => r === row && c === col)
      if (isPrefilled) return prev

      // Save current state for undo BEFORE making changes
      const newHistory = [...prev.history.slice(-49), prev.board.map(r => [...r])]

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
        history: newHistory,
        moveCount: prev.moveCount + 1
      }
    })

    debouncedValidation()
  }, [puzzleData.prefills, saveState, debouncedValidation])

  const undo = useCallback(() => {
    setGameState(prev => {
      if (prev.history.length > 0) {
        const newHistory = [...prev.history]
        const previousBoard = newHistory.pop()!;
        return {
          ...prev,
          board: previousBoard,
          history: newHistory,
          gameCompleted: false,
          violations: new Set()
        }
      }
      return prev
    })
    debouncedValidation()
  }, [debouncedValidation]);

  const getHint = useCallback(() => {
    setGameState(prev => {
      if (prev.gameCompleted) return prev;
      
      return {
        ...prev,
        hintCount: prev.hintCount + 1
      };
    });
    
    // New Progressive hint system
    
    // Step 1: Place 'X' for color regions where football is placed
    const regionHint = getRegionXHint();
    if (regionHint) {
      showRegionXHint(regionHint);
      return;
    }
    
    // Step 2: Place 'X' for rows/columns where football is placed
    const rowHint = getRowXHint();
    if (rowHint) {
      showRowXHint(rowHint);
      return;
    }
    
    const columnHint = getColumnXHint();
    if (columnHint) {
      showColumnXHint(columnHint);
      return;
    }
    
    // Step 3: Place 'X' for adjacent cells where football is placed
    const adjacentHint = getAdjacentXHint();
    if (adjacentHint) {
      showAdjacentXHint(adjacentHint);
      return;
    }
    
    // Step 4: Suggest regions where no football is placed yet
    const emptyRegionHint = getEmptyRegionHint();
    if (emptyRegionHint) {
      showEmptyRegionHint(emptyRegionHint);
      return;
    }
    
    // Step 5: Suggest rows/columns where no football is placed yet
    const emptyRowHint = getEmptyRowHint();
    if (emptyRowHint) {
      showEmptyRowHint(emptyRowHint);
      return;
    }
    
    const emptyColumnHint = getEmptyColumnHint();
    if (emptyColumnHint) {
      showEmptyColumnHint(emptyColumnHint);
      return;
    }
    
    // Step 6: Check for wrongly placed footballs
    const wrongFootball = getWrongFootballHint();
    if (wrongFootball) {
      showWrongFootballHint(wrongFootball);
      return;
    }
    
    // Step 7: Check for wrongly placed X marks
    const wrongXHint = getWrongXHint();
    if (wrongXHint) {
      showWrongXHint(wrongXHint);
      return;
    }
    
    // Step 8: Suggest correct football placement from solution
    const validPlacement = getValidFootballHint();
    if (validPlacement) {
      showValidFootballHint(validPlacement);
      return;
    }
    
    // No hints available
    showInfoMessage('Great job! No obvious hints available', 'success');
  }, [puzzleData]);

  // Helper function to check if a football is valid (prefilled or correctly placed by user)
  const isValidFootball = useCallback((row: number, col: number) => {
    // Check if it's prefilled
    const isPrefilled = puzzleData.prefills.some(([r, c]) => r === row && c === col);
    if (isPrefilled) return true;
    
    // Check if it matches the solution
    const isInSolution = puzzleData.queens.some(([qRow, qCol]) => qRow === row && qCol === col);
    return isInSolution;
  }, [puzzleData.prefills, puzzleData.queens]);

  // Helper functions for hint system
  const getWrongFootballHint = useCallback(() => {
    for (let row = 0; row < puzzleData.gridSize; row++) {
      for (let col = 0; col < puzzleData.gridSize; col++) {
        if (gameState.board[row][col] === '🏈') {
          // Check if this football is NOT valid (not prefilled and not in solution)
          if (!isValidFootball(row, col)) {
            return { row, col };
          }
        }
      }
    }
    return null;
  }, [gameState.board, puzzleData, isValidFootball]);

  const getRegionXHint = useCallback(() => {
    const uniqueRegions = new Set(puzzleData.regions.flat());
    for (let targetRegion of uniqueRegions) {
      let hasValidFootball = false;
      let emptyCells: number[][] = [];
      
      for (let row = 0; row < puzzleData.gridSize; row++) {
        for (let col = 0; col < puzzleData.gridSize; col++) {
          if (puzzleData.regions[row][col] === targetRegion) {
            if (gameState.board[row][col] === '🏈' && isValidFootball(row, col)) {
              hasValidFootball = true;
            } else if (gameState.board[row][col] === '') {
              emptyCells.push([row, col]);
            }
          }
        }
      }
      
      if (hasValidFootball && emptyCells.length > 0) {
        return { region: targetRegion, emptyCells };
      }
    }
    return null;
  }, [gameState.board, puzzleData, isValidFootball]);

  const getRowXHint = useCallback(() => {
    for (let targetRow = 0; targetRow < puzzleData.gridSize; targetRow++) {
      let hasValidFootball = false;
      let emptyCells: number[][] = [];
      
      for (let col = 0; col < puzzleData.gridSize; col++) {
        if (gameState.board[targetRow][col] === '🏈' && isValidFootball(targetRow, col)) {
          hasValidFootball = true;
        } else if (gameState.board[targetRow][col] === '') {
          emptyCells.push([targetRow, col]);
        }
      }
      
      if (hasValidFootball && emptyCells.length > 0) {
        return { row: targetRow, emptyCells };
      }
    }
    return null;
  }, [gameState.board, puzzleData, isValidFootball]);

  const getColumnXHint = useCallback(() => {
    for (let targetCol = 0; targetCol < puzzleData.gridSize; targetCol++) {
      let hasValidFootball = false;
      let emptyCells: number[][] = [];
      
      for (let row = 0; row < puzzleData.gridSize; row++) {
        if (gameState.board[row][targetCol] === '🏈' && isValidFootball(row, targetCol)) {
          hasValidFootball = true;
        } else if (gameState.board[row][targetCol] === '') {
          emptyCells.push([row, targetCol]);
        }
      }
      
      if (hasValidFootball && emptyCells.length > 0) {
        return { column: targetCol, emptyCells };
      }
    }
    return null;
  }, [gameState.board, puzzleData, isValidFootball]);

  const getAdjacentXHint = useCallback(() => {
    for (let row = 0; row < puzzleData.gridSize; row++) {
      for (let col = 0; col < puzzleData.gridSize; col++) {
        if (gameState.board[row][col] === '🏈' && isValidFootball(row, col)) {
          const adjacentCells: number[][] = [];
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              if (dr === 0 && dc === 0) continue;
              
              const newRow = row + dr;
              const newCol = col + dc;
              
              if (newRow >= 0 && newRow < puzzleData.gridSize && 
                  newCol >= 0 && newCol < puzzleData.gridSize &&
                  gameState.board[newRow][newCol] === '') {
                adjacentCells.push([newRow, newCol]);
              }
            }
          }
          
          if (adjacentCells.length > 0) {
            return { footballRow: row, footballCol: col, adjacentCells };
          }
        }
      }
    }
    return null;
  }, [gameState.board, puzzleData, isValidFootball]);

  const getEmptyRegionHint = useCallback(() => {
    const uniqueRegions = new Set(puzzleData.regions.flat());
    for (let targetRegion of uniqueRegions) {
      let hasValidFootball = false;
      let regionCells: number[][] = [];
      
      for (let row = 0; row < puzzleData.gridSize; row++) {
        for (let col = 0; col < puzzleData.gridSize; col++) {
          if (puzzleData.regions[row][col] === targetRegion) {
            regionCells.push([row, col]);
            if (gameState.board[row][col] === '🏈' && isValidFootball(row, col)) {
              hasValidFootball = true;
            }
          }
        }
      }
      
      if (!hasValidFootball) {
        return { region: targetRegion, regionCells };
      }
    }
    return null;
  }, [gameState.board, puzzleData, isValidFootball]);

  const getEmptyRowHint = useCallback(() => {
    for (let targetRow = 0; targetRow < puzzleData.gridSize; targetRow++) {
      let hasValidFootball = false;
      let rowCells: number[][] = [];
      
      for (let col = 0; col < puzzleData.gridSize; col++) {
        rowCells.push([targetRow, col]);
        if (gameState.board[targetRow][col] === '🏈' && isValidFootball(targetRow, col)) {
          hasValidFootball = true;
        }
      }
      
      if (!hasValidFootball) {
        return { row: targetRow, rowCells };
      }
    }
    return null;
  }, [gameState.board, puzzleData, isValidFootball]);

  const getEmptyColumnHint = useCallback(() => {
    for (let targetCol = 0; targetCol < puzzleData.gridSize; targetCol++) {
      let hasValidFootball = false;
      let columnCells: number[][] = [];
      
      for (let row = 0; row < puzzleData.gridSize; row++) {
        columnCells.push([row, targetCol]);
        if (gameState.board[row][targetCol] === '🏈' && isValidFootball(row, targetCol)) {
          hasValidFootball = true;
        }
      }
      
      if (!hasValidFootball) {
        return { column: targetCol, columnCells };
      }
    }
    return null;
  }, [gameState.board, puzzleData, isValidFootball]);

  const getWrongXHint = useCallback(() => {
    const wrongXCells: number[][] = [];
    
    for (let row = 0; row < puzzleData.gridSize; row++) {
      for (let col = 0; col < puzzleData.gridSize; col++) {
        if (gameState.board[row][col] === 'X') {
          // Check if this X is placed where a football should be according to solution
          const shouldHaveFootball = puzzleData.queens.some(([qRow, qCol]) => qRow === row && qCol === col);
          if (shouldHaveFootball) {
            wrongXCells.push([row, col]);
          }
        }
      }
    }
    
    return wrongXCells.length > 0 ? { wrongXCells } : null;
  }, [gameState.board, puzzleData]);

  const getValidFootballHint = useCallback(() => {
    for (let row = 0; row < puzzleData.gridSize; row++) {
      for (let col = 0; col < puzzleData.gridSize; col++) {
        const isEmpty = gameState.board[row][col] === '';
        const isInSolution = puzzleData.queens.some(([qRow, qCol]) => qRow === row && qCol === col);
        
        if (isEmpty && isInSolution) {
          return { row, col };
        }
      }
    }
    return null;
  }, [gameState.board, puzzleData])

  const showWrongFootballHint = useCallback((hint: { row: number, col: number }) => {
    addHintHighlight([[hint.row, hint.col]])
    showInfoMessage('This football is in the wrong position', 'conflict');
  }, [showInfoMessage, addHintHighlight])

  const showRegionXHint = useCallback((hint: { region: number, emptyCells: number[][] }) => {
    addHintHighlight(hint.emptyCells)
    showInfoMessage(`This region already has a football. Mark the highlighted cells with X`, 'hint');
  }, [showInfoMessage, addHintHighlight])

  const showRowXHint = useCallback((hint: { row: number, emptyCells: number[][] }) => {
    addHintHighlight(hint.emptyCells)
    showInfoMessage(`Row ${hint.row + 1} already has a football. Mark the highlighted cells with X`, 'hint');
  }, [showInfoMessage, addHintHighlight])

  const showColumnXHint = useCallback((hint: { column: number, emptyCells: number[][] }) => {
    addHintHighlight(hint.emptyCells)
    showInfoMessage(`Column ${hint.column + 1} already has a football. Mark the highlighted cells with X`, 'hint');
  }, [showInfoMessage, addHintHighlight])

  const showAdjacentXHint = useCallback((hint: { footballRow: number, footballCol: number, adjacentCells: number[][] }) => {
    addHintHighlight(hint.adjacentCells)
    showInfoMessage('Footballs cannot touch each other. Mark the highlighted cells with X', 'conflict');
  }, [showInfoMessage, addHintHighlight])

  const showEmptyRegionHint = useCallback((hint: { region: number, regionCells: number[][] }) => {
    addHintHighlight(hint.regionCells)
    showInfoMessage('This region needs a football. Look for a valid placement in the highlighted area', 'hint');
  }, [showInfoMessage, addHintHighlight])

  const showEmptyRowHint = useCallback((hint: { row: number, rowCells: number[][] }) => {
    addHintHighlight(hint.rowCells)
    showInfoMessage(`Row ${hint.row + 1} needs a football. Look for a valid placement in the highlighted row`, 'hint');
  }, [showInfoMessage, addHintHighlight])

  const showEmptyColumnHint = useCallback((hint: { column: number, columnCells: number[][] }) => {
    addHintHighlight(hint.columnCells)
    showInfoMessage(`Column ${hint.column + 1} needs a football. Look for a valid placement in the highlighted column`, 'hint');
  }, [showInfoMessage, addHintHighlight])

  const showWrongXHint = useCallback((hint: { wrongXCells: number[][] }) => {
    addHintHighlight(hint.wrongXCells)
    showInfoMessage('These X marks are incorrect. Remove them - these cells should have footballs', 'conflict');
  }, [showInfoMessage, addHintHighlight])

  const showValidFootballHint = useCallback((hint: { row: number, col: number }) => {
    addHintHighlight([[hint.row, hint.col]])
    showInfoMessage('Try placing a football in the highlighted cell', 'hint');
  }, [showInfoMessage, addHintHighlight])

  const reset = useCallback(() => {
    clearHintHighlights()
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
  }, [puzzleData, clearHintHighlights])

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


  return {
    gameState,
    puzzleData,
    infoMessage,
    hintHighlights,
    handleCellClick,
    undo,
    getHint,
    reset,
    shareResults,
    loadPuzzleForDate,
    showInfoMessage
  }
}