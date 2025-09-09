import React from 'react'
import styles from '../styles/Cell.module.css'
import { CellProps } from '../types/game'

const Cell: React.FC<CellProps> = ({
  row,
  col,
  value,
  region,
  isPrefilled,
  hasConflict,
  hasHintHighlight,
  animationDelay = 0,
  hintBorderTop,
  hintBorderRight,
  hintBorderBottom,
  hintBorderLeft,
  conflictType,
  onClick,
  borderTop,
  borderRight,
  borderBottom,
  borderLeft,
  isWinAnimated
}) => {
  // Debug log for animation state
  if (isWinAnimated) {
    console.log(`Cell (${row}, ${col}) received isWinAnimated: ${isWinAnimated}, delay: ${animationDelay}ms`)
  }

  const handleClick = () => {
    onClick(row, col)
  }

  // Convert region number to CSS class name
  const getRegionClassName = () => `region${region}`

  // Get conflict border classes based on conflict type
  const getConflictBorderClasses = () => {
    if (!hasConflict || !conflictType) return {}
    
    // For adjacent conflicts, highlight the specific cell
    if (conflictType === 'adjacent') {
      return {
        borderConflictTop: true,
        borderConflictRight: true,
        borderConflictBottom: true,
        borderConflictLeft: true
      }
    }
    
    // For row/column/region conflicts, we'll apply general conflict styling
    return {}
  }

  const conflictBorders = getConflictBorderClasses()
  return (
    <div
      className={`
        ${styles.cell}
        ${styles[getRegionClassName()]}
        ${hasConflict ? styles.conflict : ''}
        ${hasHintHighlight ? styles.hintHighlight : ''}
        ${isWinAnimated ? styles.winFlip : ''}
        ${isPrefilled ? styles.prefilled : ''}
        ${borderTop ? styles.borderTop : ''}
        ${borderRight ? styles.borderRight : ''}
        ${borderBottom ? styles.borderBottom : ''}
        ${borderLeft ? styles.borderLeft : ''}
        ${hintBorderTop ? styles.hintBorderTop : ''}
        ${hintBorderRight ? styles.hintBorderRight : ''}
        ${hintBorderBottom ? styles.hintBorderBottom : ''}
        ${hintBorderLeft ? styles.hintBorderLeft : ''}
        ${conflictBorders.borderConflictTop ? styles.borderConflictTop : ''}
        ${conflictBorders.borderConflictRight ? styles.borderConflictRight : ''}
        ${conflictBorders.borderConflictBottom ? styles.borderConflictBottom : ''}
        ${conflictBorders.borderConflictLeft ? styles.borderConflictLeft : ''}
      `}
      data-row={row}
      data-col={col}
      data-symbol={value === '×' ? '×' : undefined}
      onClick={handleClick}
      style={{
        color: value === '×' ? '#666' : '',
        fontSize: value === '×' ? '1.2rem' : '',
        fontWeight: isPrefilled ? 'bold' : 'normal',
        animationDelay: isWinAnimated ? `${animationDelay}ms` : undefined
      }}
    >
      {value}
    </div>
  )
}

export default Cell
