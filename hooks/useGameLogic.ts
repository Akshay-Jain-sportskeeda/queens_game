import { useState, useCallback, useRef, useEffect } from 'react'
import { PuzzleData, GameState, HintData } from '../types/game'

export function useGameLogic(initialPuzzleData: PuzzleData) {
  const [gameState, setGameState] = useState<GameState>(() => ({
    board: Array(initialPuzzleData.gridSize).fill(undefined).map(() => Array(initialPuzzleData.gridSize).fill('')),
    history: [],
    violations: new Set(),
    conflictTypes: new Map(),
    moveCount: 0,
    hintCount: 0,
    startTime: Date.now(),
    gameCompleted: false,
    isWinAnimationActive: false
  }))

  const [puzzleData, setPuzzleData] = useState<PuzzleData>(initialPuzzleData)
  const [infoMessage, setInfoMessage] = useState({ text: '', type: 'default' })
  const [hintHighlights, setHintHighlights] = useState<Set<string>>(new Set())
  const validationTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Cleanup function for validation timeout
  useEffect(() => {
    return () => {
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current)
      }
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current)
      }
    }
  }, [])

  // Debug function to log board state
  const logBoardState = useCallback((context: string, board: string[][]) => {
    console.log(`=== BOARD STATE: ${context} ===`);
    board.forEach((row, i) => {
      console.log(`Row ${i}:`, row);
    });
  }, []);

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
    console.log('=== BOARD INITIALIZATION ===');
    console.log('Puzzle data changed, initializing board...');
    console.log('Grid size:', puzzleData.gridSize);
    console.log('Prefills:', puzzleData.prefills);
    
    const newBoard = Array(puzzleData.gridSize).fill(undefined).map(() => Array(puzzleData.gridSize).fill(''))
    console.log('Empty board created:', newBoard);
    
    puzzleData.prefills.forEach(([row, col]) => {
      if (row < puzzleData.gridSize && col < puzzleData.gridSize) {
        console.log(`Placing prefilled football at (${row}, ${col})`);
        newBoard[row][col] = '🏈'
        console.log(`Board after placing at (${row}, ${col}):`, newBoard[row][col]);
      }
    })
    
    console.log('Initialized board:', newBoard);
    console.log('Board state after prefills:');
    newBoard.forEach((row, i) => {
      console.log(`Row ${i}:`, row);
    });
    
    setGameState(prev => ({
      ...prev,
      board: newBoard,
      history: [],
      violations: new Set(),
      conflictTypes: new Map(),
      moveCount: 0,
      hintCount: 0,
      startTime: Date.now(),
      gameCompleted: false,
      isWinAnimationActive: false
    }))
  }, [puzzleData])

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
        if (board[row][col] === '
        )
      }
    }
  }
  )
}🏈') colFootballs++
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
      
      // Update info message based on violations
      if (violations.size > 0) {
        const conflictTypesList = Array.from(new Set(conflictTypes.values()))
        const messages: string[] = []
        if (conflictTypesList.includes('adjacent')) {
          messages.push('⚠️ Footballs cannot touch each other')
        }
        if (conflictTypesList.includes('row')) {
          messages.push('⚠️ Multiple footballs in the same row')
        }
        if (conflictTypesList.includes('column')) {
          messages.push('⚠️ Multiple footballs in the same column')
        }
        if (conflictTypesList.includes('region')) {
          messages.push('⚠️ Multiple footballs in the same region')
        }
        const message = messages.join('\n')
        showInfoMessage(message, 'conflict')
      } else if (!isWin) {
        resetInfoMessage()
      }
      
      return {
        ...prev,
        violations,
        conflictTypes,
        gameCompleted: isWin,
      }
    })
  }, [puzzleData.gridSize, puzzleData.regions, checkWinCondition, showInfoMessage, resetInfoMessage])

  const debouncedValidation = useCallback(() => {
    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current)
    }

    validationTimeoutRef.current = setTimeout(() => {
      validateAndHighlight()
    }, 300)
  }, [validateAndHighlight])

  // Trigger win animation and then show modal
  useEffect(() => {
    if (gameState.gameCompleted) {
      console.log('Game completed! Triggering win animation...')
      
      // Trigger the row-wise animation
      setGameState(prev => ({
        ...prev,
        isWinAnimationActive: true
      }))
      
      // Show success message
      showInfoMessage('🎉 Congratulations! You solved the puzzle! 🎉', 'success')
    }
  }, [gameState.gameCompleted, showInfoMessage])

  const handleCellClick = useCallback((row: number, col: number) => {
    // Clear any existing hint highlights when user makes a move
    clearHintHighlights()
    
    console.log('=== CELL CLICK DEBUG ===');
    console.log('Before cell click - current board state:');
    logBoardState('BEFORE CELL CLICK', gameState.board);
    
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
        newValue = '×'
      } else if (currentValue === '×') {
        newValue = '🏈'
      } else {
        newValue = ''
      }

      newBoard[row][col] = newValue

      console.log('After cell click - new board state:');
      logBoardState('AFTER CELL CLICK', newBoard);

      return {
        ...prev,
        board: newBoard,
        history: newHistory,
        moveCount: prev.moveCount + 1
      }
    })

    debouncedValidation()
  }, [puzzleData.prefills, saveState, debouncedValidation, clearHintHighlights, logBoardState, gameState.board])

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
          violations: new Set(),
          conflictTypes: new Map(),
          isWinAnimationActive: false
        }
      }
      return prev
    })
    debouncedValidation()
  }, [debouncedValidation]);

  // Helper functions for showing hints (must be defined before getHint)
  const showWrongFootballHint = useCallback((hint: { row: number, col: number }) => {
    addHintHighlight([[hint.row, hint.col]])
    showInfoMessage('This football is in the wrong position', 'conflict');
  }, [showInfoMessage, addHintHighlight])

  const showRegionXHint = useCallback((hint: { region: number, emptyCells: number[][] }) => {
    // Highlight all cells in the region, not just empty ones
    const allRegionCells: number[][] = []
    for (let row = 0; row < puzzleData.gridSize; row++) {
      for (let col = 0; col < puzzleData.gridSize; col++) {
        if (puzzleData.regions[row][col] === hint.region) {
          allRegionCells.push([row, col])
        }
      }
    }
    addHintHighlight(allRegionCells)
    showInfoMessage(`This region already has a football. Mark the highlighted cells with ×`, 'hint');
  }, [showInfoMessage, addHintHighlight, puzzleData])

  const showRowXHint = useCallback((hint: { row: number, emptyCells: number[][] }) => {
    // Highlight all cells in the row, not just empty ones
    const allRowCells: number[][] = []
    for (let col = 0; col < puzzleData.gridSize; col++) {
      allRowCells.push([hint.row, col])
    }
    addHintHighlight(allRowCells)
    showInfoMessage(`Row ${hint.row + 1} already has a football. Mark the highlighted cells with ×`, 'hint');
  }, [showInfoMessage, addHintHighlight, puzzleData]);

  const showColumnXHint = useCallback((hint: { column: number, emptyCells: number[][] }) => {
    // Highlight all cells in the column, not just empty ones
    const allColumnCells: number[][] = []
    for (let row = 0; row < puzzleData.gridSize; row++) {
      allColumnCells.push([row, hint.column])
    }
    addHintHighlight(allColumnCells)
    showInfoMessage(`Column ${hint.column + 1} already has a football. Mark the highlighted cells with ×`, 'hint');
  }, [showInfoMessage, addHintHighlight, puzzleData])

  const showAdjacentXHint = useCallback((hint: { footballRow: number, footballCol: number, adjacentCells: number[][] }) => {
    addHintHighlight(hint.adjacentCells)
    showInfoMessage('Footballs cannot touch each other. Mark the highlighted cells with ×', 'conflict');
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
    showInfoMessage('These × marks are incorrect. Remove them - these cells should have footballs', 'conflict');
  }, [showInfoMessage, addHintHighlight])

  const showValidFootballHint = useCallback((hint: { row: number, col: number }) => {
    addHintHighlight([[hint.row, hint.col]])
    showInfoMessage('Try placing a football in the highlighted cell', 'hint');
  }, [showInfoMessage, addHintHighlight])

  // Helper function to check if a football is valid (NOT using useCallback to avoid stale closures)
  const isValidFootball = (row: number, col: number): boolean => {
    console.log(`Checking isValidFootball(${row}, ${col}) with puzzle date: ${puzzleData.date}`);
    // First check if there's actually a football in this cell
    if (gameState.board[row][col] !== '🏈') {
      console.log(`  No football in cell (${row}, ${col}), value: "${gameState.board[row][col]}"`);
      return false;
    }
    
    // Check if it's a prefilled football (always valid)
    const isPrefilled = puzzleData.prefills.some(([r, c]) => r === row && c === col);
    if (isPrefilled) {
      console.log(`  Football at (${row}, ${col}) is prefilled (valid)`);
      return true;
    }
    
    // Check if it matches the solution
    const isInSolution = puzzleData.queens.some(([qRow, qCol]) => qRow === row && qCol === col);
    console.log(`  Football at (${row}, ${col}) matches solution: ${isInSolution}`);
    return isInSolution;
  };

  const getHint = useCallback(() => {
    console.log('=== HINT SYSTEM DEBUG ===');
    console.log('Current gameState.board at hint start:');
    logBoardState('HINT START', gameState.board);
    console.log('Current board state:', gameState.board);
    console.log('Current puzzle date:', puzzleData.date);
    console.log('Current puzzle prefills:', puzzleData.prefills);
    console.log('Current puzzle solution:', puzzleData.queens);
    console.log('Current puzzle regions:', puzzleData.regions);
    
    setGameState(prev => {
      if (prev.gameCompleted) return prev;
      
      return {
        ...prev,
        hintCount: prev.hintCount + 1
      };
    });
    
    // Get current puzzle data to avoid stale closures
    const currentPuzzleData = puzzleData;
    const currentBoard = gameState.board;
    
    // Progressive hint system - X placement first, then suggestions
    console.log('Step 1: Checking for wrong footballs...');
    const wrongFootball = getWrongFootballHint(currentBoard, currentPuzzleData);
    if (wrongFootball) {
      console.log('Found wrong football:', wrongFootball);
      showWrongFootballHint(wrongFootball);
      return;
    } else {
      console.log('No wrong footballs found');
    }
    
    console.log('Step 2: Checking for region X hints...');
    const regionHint = getRegionXHint(currentBoard, currentPuzzleData);
    if (regionHint) {
      console.log('Found region X hint:', regionHint);
      showRegionXHint(regionHint);
      return;
    } else {
      console.log('No region X hints found');
    }
    
    console.log('Step 3: Checking for row X hints...');
    const rowHint = getRowXHint(currentBoard, currentPuzzleData);
    if (rowHint) {
      console.log('Found row X hint:', rowHint);
      showRowXHint(rowHint);
      return;
    } else {
      console.log('No row X hints found');
    }
    
    console.log('Step 4: Checking for column X hints...');
    const columnHint = getColumnXHint(currentBoard, currentPuzzleData);
    if (columnHint) {
      console.log('Found column X hint:', columnHint);
      showColumnXHint(columnHint);
      return;
    } else {
      console.log('No column X hints found');
    }
    
    console.log('Step 5: Checking for adjacent X hints...');
    const adjacentHint = getAdjacentXHint(currentBoard, currentPuzzleData);
    if (adjacentHint) {
      console.log('Found adjacent X hint:', adjacentHint);
      showAdjacentXHint(adjacentHint);
      return;
    } else {
      console.log('No adjacent X hints found');
    }
    
    console.log('Step 6: Checking for empty region hints...');
    const emptyRegionHint = getEmptyRegionHint(currentBoard, currentPuzzleData);
    if (emptyRegionHint) {
      console.log('Found empty region hint:', emptyRegionHint);
      showEmptyRegionHint(emptyRegionHint);
      return;
    } else {
      console.log('No empty region hints found');
    }
    
    console.log('Step 7: Checking for empty row hints...');
    const emptyRowHint = getEmptyRowHint(currentBoard, currentPuzzleData);
    if (emptyRowHint) {
      console.log('Found empty row hint:', emptyRowHint);
      showEmptyRowHint(emptyRowHint);
      return;
    } else {
      console.log('No empty row hints found');
    }
    
    console.log('Step 8: Checking for empty column hints...');
    const emptyColumnHint = getEmptyColumnHint(currentBoard, currentPuzzleData);
    if (emptyColumnHint) {
      console.log('Found empty column hint:', emptyColumnHint);
      showEmptyColumnHint(emptyColumnHint);
      return;
    } else {
      console.log('No empty column hints found');
    }
    
    console.log('Step 9: Checking for wrong X hints...');
    const wrongXHint = getWrongXHint(currentBoard, currentPuzzleData);
    if (wrongXHint) {
      console.log('Found wrong X hint:', wrongXHint);
      showWrongXHint(wrongXHint);
      return;
    } else {
      console.log('No wrong X hints found');
    }
    
    console.log('Step 10: Checking for valid football placement hints...');
    const validPlacement = getValidFootballHint(currentBoard, currentPuzzleData);
    if (validPlacement) {
      console.log('Found valid placement hint:', validPlacement);
      showValidFootballHint(validPlacement);
      return;
    } else {
      console.log('No valid placement hints found');
    }
  }, [gameState.board, puzzleData, logBoardState, showWrongFootballHint, showRegionXHint, showRowXHint, showColumnXHint, showAdjacentXHint, showEmptyRegionHint, showEmptyRowHint, showEmptyColumnHint, showWrongXHint, showValidFootballHint]);

  // Helper functions for hint system
  const getWrongFootballHint = (board: string[][], currentPuzzleData: PuzzleData) => {
    for (let row = 0; row < currentPuzzleData.gridSize; row++) {
      for (let col = 0; col < currentPuzzleData.gridSize; col++) {
        if (board[row][col] === '🏈') {
          // Check if this football is NOT valid (not prefilled and not in solution)
          const isPrefilled = currentPuzzleData.prefills.some(([r, c]) => r === row && c === col);
          const isInSolution = currentPuzzleData.queens.some(([qRow, qCol]) => qRow === row && qCol === col);
          if (!isPrefilled && !isInSolution) {
            return { row, col };
          }
        }
      }
    }
    return null;
  };

  const getRegionXHint = (board: string[][], currentPuzzleData: PuzzleData) => {
    console.log('  Analyzing regions for X hints...');
    console.log('  Using puzzle data for date:', currentPuzzleData.date);
    console.log('  Current regions data:', currentPuzzleData.regions);
    const uniqueRegions = new Set(currentPuzzleData.regions.flat());
    console.log('  Unique regions:', Array.from(uniqueRegions));
    
    for (let targetRegion of uniqueRegions) {
      console.log(`  Checking region ${targetRegion}:`);
      let hasValidFootball = false;
      let emptyCells: number[][] = [];
      
      for (let row = 0; row < currentPuzzleData.gridSize; row++) {
        for (let col = 0; col < currentPuzzleData.gridSize; col++) {
          if (currentPuzzleData.regions[row][col] === targetRegion) {
            if (board[row][col] === '🏈') {
              const isPrefilled = currentPuzzleData.prefills.some(([r, c]) => r === row && c === col);
              const isInSolution = currentPuzzleData.queens.some(([qRow, qCol]) => qRow === row && qCol === col);
              if (isPrefilled || isInSolution) {
                hasValidFootball = true;
              }
            } else if (board[row][col] === '') {
              console.log(`    Region ${targetRegion} has valid football at (${row}, ${col})`);
              console.log(`    Region ${targetRegion} has empty cell at (${row}, ${col})`);
              emptyCells.push([row, col]);
            }
          }
        }
      }
      
      console.log(`    Region ${targetRegion}: hasValidFootball=${hasValidFootball}, emptyCells=${emptyCells.length}`);
      if (hasValidFootball && emptyCells.length > 0) {
        console.log(`    Returning region X hint for region ${targetRegion}`);
        return { region: targetRegion, emptyCells };
      }
    }
    console.log('  No region X hints found');
    return null;
  };

  const getRowXHint = (board: string[][], currentPuzzleData: PuzzleData) => {
    for (let targetRow = 0; targetRow < currentPuzzleData.gridSize; targetRow++) {
      let hasValidFootball = false;
      let emptyCells: number[][] = [];
      
      for (let col = 0; col < currentPuzzleData.gridSize; col++) {
        if (board[targetRow][col] === '🏈') {
          const isPrefilled = currentPuzzleData.prefills.some(([r, c]) => r === targetRow && c === col);
          const isInSolution = currentPuzzleData.queens.some(([qRow, qCol]) => qRow === targetRow && qCol === col);
          if (isPrefilled || isInSolution) {
            hasValidFootball = true;
          }
        } else if (board[targetRow][col] === '') {
          emptyCells.push([targetRow, col]);
        }
      }
      
      if (hasValidFootball && emptyCells.length > 0) {
        return { row: targetRow, emptyCells };
      }
    }
    return null;
  };

  const getColumnXHint = (board: string[][], currentPuzzleData: PuzzleData) => {
    for (let targetCol = 0; targetCol < currentPuzzleData.gridSize; targetCol++) {
      let hasValidFootball = false;
      let emptyCells: number[][] = [];
      
      for (let row = 0; row < currentPuzzleData.gridSize; row++) {
        if (board[row][targetCol] === '🏈') {
          const isPrefilled = currentPuzzleData.prefills.some(([r, c]) => r === row && c === targetCol);
          const isInSolution = currentPuzzleData.queens.some(([qRow, qCol]) => qRow === row && qCol === targetCol);
          if (isPrefilled || isInSolution) {
            hasValidFootball = true;
          }
        } else if (board[row][targetCol] === '') {
          emptyCells.push([row, targetCol]);
        }
      }
      
      if (hasValidFootball && emptyCells.length > 0) {
        return { column: targetCol, emptyCells };
      }
    }
    return null;
  };

  const getAdjacentXHint = (board: string[][], currentPuzzleData: PuzzleData) => {
    for (let row = 0; row < currentPuzzleData.gridSize; row++) {
      for (let col = 0; col < currentPuzzleData.gridSize; col++) {
        if (board[row][col] === '🏈') {
          const isPrefilled = currentPuzzleData.prefills.some(([r, c]) => r === row && c === col);
          const isInSolution = currentPuzzleData.queens.some(([qRow, qCol]) => qRow === row && qCol === col);
          if (isPrefilled || isInSolution) {
            const adjacentCells: number[][] = [];
            for (let dr = -1; dr <= 1; dr++) {
              for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                
                const newRow = row + dr;
                const newCol = col + dc;
                
                if (newRow >= 0 && newRow < currentPuzzleData.gridSize && 
                    newCol >= 0 && newCol < currentPuzzleData.gridSize &&
                    board[newRow][newCol] === '') {
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
    }
    return null;
  };

  const getEmptyRegionHint = (board: string[][], currentPuzzleData: PuzzleData) => {
    const uniqueRegions = new Set(currentPuzzleData.regions.flat())
    const hintCandidates: { region: number, emptyCellCount: number, regionCells: number[][] }[] = []

    for (let targetRegion of uniqueRegions) {
      let hasCorrectFootball = false
      let emptyCellsInRegionCount = 0
      const allCellsInRegion: number[][] = []
      
      for (let row = 0; row < currentPuzzleData.gridSize; row++) {
        for (let col = 0; col < currentPuzzleData.gridSize; col++) {
          if (currentPuzzleData.regions[row][col] === targetRegion) {
            allCellsInRegion.push([row, col])
            if (board[row][col] === '🏈') {
              // Check if this football is part of the solution (correctly placed)
              const isInSolution = currentPuzzleData.queens.some(([qRow, qCol]) => qRow === row && qCol === col)
              if (isInSolution) {
                hasCorrectFootball = true
              }
            }
              emptyCellsInRegionCount++
        }
      }
      
      if (!hasCorrectFootball) {
        // This region needs a football. Add it as a candidate.
        hintCandidates.push({
          region: targetRegion,
          emptyCellCount: emptyCellsInRegionCount,
          regionCells: allCellsInRegion // All cells in the region for highlighting
        })
      }
    }

    // Sort candidates by the number of empty cells, ascending
    hintCandidates.sort((a, b) => a.emptyCellCount - b.emptyCellCount)

    if (hintCandidates.length > 0) {
      // Return the region with the minimum empty cells
      return {
        region: hintCandidates[0].region,
        regionCells: hintCandidates[0].regionCells
      }
    }
    return null
  };

  const getEmptyRowHint = (board: string[][], currentPuzzleData: PuzzleData) => {
    for (let targetRow = 0; targetRow < currentPuzzleData.gridSize; targetRow++) {
      let hasValidFootball = false;
      let rowCells: number[][] = [];
      
      for (let col = 0; col < currentPuzzleData.gridSize; col++) {
        rowCells.push([targetRow, col]);
        if (board[targetRow][col] === '🏈') {
          const isPrefilled = currentPuzzleData.prefills.some(([r, c]) => r === targetRow && c === col);
          const isInSolution = currentPuzzleData.queens.some(([qRow, qCol]) => qRow === targetRow && qCol === col);
          if (isPrefilled || isInSolution) {
            hasValidFootball = true;
          }
        }
      }
      
      if (!hasValidFootball) {
        return { row: targetRow, rowCells };
      }
    }
    return null;
  };

  const getEmptyColumnHint = (board: string[][], currentPuzzleData: PuzzleData) => {
    for (let targetCol = 0; targetCol < currentPuzzleData.gridSize; targetCol++) {
      let hasValidFootball = false;
      let columnCells: number[][] = [];
      
      for (let row = 0; row < currentPuzzleData.gridSize; row++) {
        columnCells.push([row, targetCol]);
        if (board[row][targetCol] === '🏈') {
          const isPrefilled = currentPuzzleData.prefills.some(([r, c]) => r === row && c === targetCol);
          const isInSolution = currentPuzzleData.queens.some(([qRow, qCol]) => qRow === row && qCol === targetCol);
          if (isPrefilled || isInSolution) {
            hasValidFootball = true;
          }
        }
      }
      
      if (!hasValidFootball) {
        return { column: targetCol, columnCells };
      }
    }
    return null;
  };

  const getWrongXHint = (board: string[][], currentPuzzleData: PuzzleData) => {
    const wrongXCells: number[][] = [];
    
    for (let row = 0; row < currentPuzzleData.gridSize; row++) {
      for (let col = 0; col < currentPuzzleData.gridSize; col++) {
        if (board[row][col] === '×') {
          // Check if this X is placed where a football should be according to solution
          const shouldHaveFootball = currentPuzzleData.queens.some(([qRow, qCol]) => qRow === row && qCol === col);
          if (shouldHaveFootball) {
            wrongXCells.push([row, col]);
          }
        }
      }
    }
    
    return wrongXCells.length > 0 ? { wrongXCells } : null;
  };

  const getValidFootballHint = (board: string[][], currentPuzzleData: PuzzleData) => {
    for (let row = 0; row < currentPuzzleData.gridSize; row++) {
      for (let col = 0; col < currentPuzzleData.gridSize; col++) {
        const isEmpty = board[row][col] === '';
        const isInSolution = currentPuzzleData.queens.some(([qRow, qCol]) => qRow === row && qCol === col);
        
        if (isEmpty && isInSolution) {
          return { row, col };
        }
      }
    }
    return null;
  };

  const reset = useCallback(() => {
    clearHintHighlights()
    const newBoard = Array(puzzleData.gridSize).fill(undefined).map(() => Array(puzzleData.gridSize).fill(''))
    puzzleData.prefills.forEach(([row, col]) => {
      if (row < puzzleData.gridSize && col < puzzleData.gridSize) {
        newBoard[row][col] = '🏈'
      }
    })
    
    setGameState({
      board: newBoard,
      history: [],
      violations: new Set(),
      conflictTypes: new Map(),
      moveCount: 0,
      hintCount: 0,
      startTime: Date.now(),
      gameCompleted: false,
      isWinAnimationActive: false
    })
    setInfoMessage({ text: 'Use hints if you get stuck!', type: 'default' })
    setInfoMessage({ text: 'Click on cells to place × or 🏈. Use hints if you get stuck!', type: 'default' })
  }, [puzzleData, clearHintHighlights])

  const shareResults = useCallback(() => {
    const endTime = Date.now()
    const baseTime = Math.floor((endTime - gameState.startTime) / 1000)
    const hintPenalty = gameState.hintCount * 15 // 15 seconds per hint
    const totalTime = baseTime + hintPenalty
    const minutes = Math.floor(totalTime / 60)
    const seconds = totalTime % 60
    const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`
    
    const shareText = `🏈 NFL Field Puzzle Complete! 🎉\n⏱️ Time: ${timeString}${gameState.hintCount > 0 ? ` (+${hintPenalty}s penalty)` : ''}\n🎯 Moves: ${gameState.moveCount}\n💡 Hints: ${gameState.hintCount}\n\nPlay at: ${window.location.href}`
    
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
    console.log('🎯 [useGameLogic] Loading puzzle for date:', date);
    try {
      const response = await fetch(`/api/puzzle-data?date=${date}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch puzzle: ${response.status} ${response.statusText}`);
      }
      const newPuzzleData = await response.json()
      console.log('✅ [useGameLogic] Successfully fetched puzzle data for:', date);
      
      // Clear all hints and info messages when loading new puzzle
      clearHintHighlights();
      setInfoMessage({ text: 'Click on cells to place × or 🏈. Use hints if you get stuck!', type: 'default' });
      
      setPuzzleData(newPuzzleData)
    } catch (error) {
      console.error('❌ [useGameLogic] Error loading puzzle for date:', date, error);
      throw error; // Re-throw so calling code can handle it
    }
  }, [clearHintHighlights])

  const resetWinAnimation = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      isWinAnimationActive: false
    }))
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
    showInfoMessage,
    resetWinAnimation
  }
}