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
  const handleClick = () => {
    onClick(row, col)
  }

  const getRegionClass = () => `region-${region}`
  const getConflictClass = () => hasConflict ? `conflict-${conflictType || 'general'}` : ''
  const getPrefilledClass = () => isPrefilled ? 'prefilled' : ''
  
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
        ${hasConflict && conflictType ? styles[`conflict${conflictType.charAt(0).toUpperCase() + conflictType.slice(1)}`] : ''}
        ${isPrefilled ? styles.prefilled : ''}
        ${borderTop ? styles.borderTop : ''}
        ${borderRight ? styles.borderRight : ''}
        ${borderBottom ? styles.borderBottom : ''}
        ${borderLeft ? styles.borderLeft : ''}
        ${hintBorderTop ? styles.hintBorderTop : ''}
        ${hintBorderRight ? styles.hintBorderRight : ''}
        ${hintBorderBottom ? styles.hintBorderBottom : ''}
        ${hintBorderLeft ? styles.hintBorderLeft : ''}
        ${hintBorderTop ? styles.hintBorderTop : ''}
        ${hintBorderRight ? styles.hintBorderRight : ''}
        ${hintBorderBottom ? styles.hintBorderBottom : ''}
        ${hintBorderLeft ? styles.hintBorderLeft : ''}
      `}
      data-row={row}
      data-col={col}
      data-symbol={value === 'X' ? 'X' : undefined}
      onClick={handleClick}
      style={{
        color: value === 'X' ? '#888' : '',
        fontWeight: isPrefilled ? 'bold' : 'normal'
      }}
    >
      {value}
    </div>
  )
}

export default Cell
