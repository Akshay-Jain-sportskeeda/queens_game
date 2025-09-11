import React from 'react'
import { CellProps } from '../types/game'
import Cell from './Cell'
import styles from '../styles/GameBoard.module.css'

interface GameBoardProps {
  board: string[][]
  regions: number[][]
  prefills: number[][]
  violations: Set<string>
  conflictTypes: Map<string, string>
  hintHighlights: Set<string>
  isWinAnimationActive: boolean
  onCellClick: (row: number, col: number) => void
}

const GameBoard: React.FC<GameBoardProps> = ({
  board,
  regions,
  prefills,
  violations,
  conflictTypes,
  hintHighlights,
  isWinAnimationActive,
  onCellClick
}) => {
  const boardSize = board.length

  // Calculate animation delay for each cell based on row
  const getAnimationDelay = (rowIndex: number) => {
    if (!isWinAnimationActive) return 0
    
    // Animate 2 rows at a time with 0.5s delay between groups
    const groupIndex = Math.floor(rowIndex / 2)
    return groupIndex * 500 // 500ms delay between each group of 2 rows
  }
  const getRegionMap = () => {
    const regionMap: { [key: string]: number } = {}
    for (let row = 0; row < boardSize; row++) {
      for (let col = 0; col < boardSize; col++) {
        regionMap[`${row},${col}`] = regions[row][col]
      }
    }
    return regionMap
  }

  const regionMap = getRegionMap()

  const isPrefilled = (row: number, col: number) => {
    return prefills.some(([r, c]) => r === row && c === col)
  }

  const hasConflict = (row: number, col: number) => {
    return violations.has(`${row},${col}`)
  }
  
  const hasHintHighlight = (row: number, col: number) => {
    return hintHighlights.has(`${row},${col}`)
  }

  const getHintBorders = (row: number, col: number) => {
    const isHighlighted = hasHintHighlight(row, col)
    
    if (!isHighlighted) {
      return { top: false, right: false, bottom: false, left: false }
    }

    // Check if adjacent cells are also highlighted to determine edge borders
    const topHighlighted = row > 0 && hasHintHighlight(row - 1, col)
    const rightHighlighted = col < boardSize - 1 && hasHintHighlight(row, col + 1)
    const bottomHighlighted = row < boardSize - 1 && hasHintHighlight(row + 1, col)
    const leftHighlighted = col > 0 && hasHintHighlight(row, col - 1)

    return {
      top: !topHighlighted,
      right: !rightHighlighted,
      bottom: !bottomHighlighted,
      left: !leftHighlighted
    }
  }

  const getConflictBorders = (row: number, col: number) => {
    const hasConflictHere = hasConflict(row, col)
    
    if (!hasConflictHere) {
      return { top: false, right: false, bottom: false, left: false }
    }

    // Check if adjacent cells also have conflicts to determine edge borders
    const topConflict = row > 0 && hasConflict(row - 1, col)
    const rightConflict = col < boardSize - 1 && hasConflict(row, col + 1)
    const bottomConflict = row < boardSize - 1 && hasConflict(row + 1, col)
    const leftConflict = col > 0 && hasConflict(row, col - 1)

    return {
      top: !topConflict,
      right: !rightConflict,
      bottom: !bottomConflict,
      left: !leftConflict
    }
  }

  const shouldShowBorder = (row: number, col: number, direction: 'top' | 'right' | 'bottom' | 'left') => {
    const currentRegion = regions[row][col]
    
    switch (direction) {
      case 'top':
        return row === 0 || regions[row - 1][col] !== currentRegion
      case 'right':
        return col === boardSize - 1 || regions[row][col + 1] !== currentRegion
      case 'bottom':
        return row === boardSize - 1 || regions[row + 1][col] !== currentRegion
      case 'left':
        return col === 0 || regions[row][col - 1] !== currentRegion
      default:
        return false
    }
  }

  return (
    <div 
      className={styles.gameBoard}
      style={{
        gridTemplateColumns: `repeat(${boardSize}, 1fr)`
      }}
    >
      {board.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          (() => {
            const hintBorders = getHintBorders(rowIndex, colIndex)
            const conflictBorders = getConflictBorders(rowIndex, colIndex)
            return (
          <Cell
            key={`${rowIndex}-${colIndex}`}
            row={rowIndex}
            col={colIndex}
            value={cell}
            region={regions[rowIndex][colIndex]}
            isPrefilled={isPrefilled(rowIndex, colIndex)}
            hasConflict={hasConflict(rowIndex, colIndex)}
            hasHintHighlight={hasHintHighlight(rowIndex, colIndex)}
            isWinAnimated={isWinAnimationActive}
            animationDelay={getAnimationDelay(rowIndex)}
            hintBorderTop={hintBorders.top}
            hintBorderRight={hintBorders.right}
            hintBorderBottom={hintBorders.bottom}
            hintBorderLeft={hintBorders.left}
            conflictBorderTop={conflictBorders.top}
            conflictBorderRight={conflictBorders.right}
            conflictBorderBottom={conflictBorders.bottom}
            conflictBorderLeft={conflictBorders.left}
            conflictType={hasConflict(rowIndex, colIndex) ? conflictTypes.get(`${rowIndex},${colIndex}`) : undefined}
            onClick={onCellClick}
            borderTop={shouldShowBorder(rowIndex, colIndex, 'top')}
            borderRight={shouldShowBorder(rowIndex, colIndex, 'right')}
            borderBottom={shouldShowBorder(rowIndex, colIndex, 'bottom')}
            borderLeft={shouldShowBorder(rowIndex, colIndex, 'left')}
          />
            )
          })()
        ))
      )}
    </div>
  )
}

export default GameBoard
