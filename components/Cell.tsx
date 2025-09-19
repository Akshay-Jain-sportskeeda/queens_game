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
  conflictBorderTop,
  conflictBorderRight,
  conflictBorderBottom,
  conflictBorderLeft,
  conflictType,
  onClick,
  borderTop,
  borderRight,
  borderBottom,
  borderLeft,
  isWinAnimated
}) => {
  const handleClick = () => {
    onClick(row, col)
  }

  // Convert region number to CSS class name
  const getRegionClassName = () => `region${region}`

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
        ${conflictBorderTop ? styles.borderConflictTop : ''}
        ${conflictBorderRight ? styles.borderConflictRight : ''}
        ${conflictBorderBottom ? styles.borderConflictBottom : ''}
        ${conflictBorderLeft ? styles.borderConflictLeft : ''}
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
