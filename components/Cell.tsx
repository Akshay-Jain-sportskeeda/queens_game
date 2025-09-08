import React from 'react'
import styles from '../styles/Cell.module.css'

interface CellProps {
  row: number
  col: number
  value: string
  region: number
  isPrefilled: boolean
  hasConflict: boolean
  conflictType?: string
  onClick: (row: number, col: number) => void
  borderTop: boolean
  borderRight: boolean
  borderBottom: boolean
  borderLeft: boolean
}

const Cell: React.FC<CellProps> = ({
  row,
  col,
  value,
  region,
  isPrefilled,
  hasConflict,
  conflictType,
  onClick,
  borderTop,
  borderRight,
  borderBottom,
  borderLeft
}) => {
  const handleClick = () => {
    onClick(row, col)
  }

  const getRegionClass = () => `region-${region}`
  const getConflictClass = () => hasConflict ? `conflict-${conflictType || 'general'}` : ''
  const getPrefilledClass = () => isPrefilled ? 'prefilled' : ''

  return (
    <div
      className={`
        ${styles.cell}
        ${styles[getRegionClass()]}
        ${hasConflict ? styles.conflict : ''}
        ${styles[getConflictClass()]}
        ${styles[getPrefilledClass()]}
        ${borderTop ? styles.borderTop : ''}
        ${borderRight ? styles.borderRight : ''}
        ${borderBottom ? styles.borderBottom : ''}
        ${borderLeft ? styles.borderLeft : ''}
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
