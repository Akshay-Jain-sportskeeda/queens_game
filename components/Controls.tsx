import React from 'react'
import styles from '../styles/Controls.module.css'

interface ControlsProps {
  onUndo: () => void
  onHint: () => void
  onReset: () => void
}

const Controls: React.FC<ControlsProps> = ({
  onUndo,
  onHint,
  onReset
}) => {
  return (
    <div className={styles.controls}>
      <button className={styles.btn} onClick={onUndo}>
        Undo
      </button>
      <button className={styles.btn} onClick={onHint}>
        Hint
      </button>
      <button className={styles.btn} onClick={onReset}>
        Reset
      </button>
    </div>
  )
}

export default Controls
