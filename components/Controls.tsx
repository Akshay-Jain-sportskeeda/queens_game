import React from 'react'
import styles from '../styles/Controls.module.css'

interface ControlsProps {
  onUndo: () => void
  onHint: () => void
  onReset: () => void
  gameCompleted: boolean
}

const Controls: React.FC<ControlsProps> = ({
  onUndo,
  onHint,
  onReset,
  gameCompleted
}) => {
  return (
    <div className={styles.controls}>
      <button className={styles.btn} onClick={onUndo} disabled={gameCompleted}>
        Undo
      </button>
      <button className={styles.btn} onClick={onHint} disabled={gameCompleted}>
        Hint
      </button>
      <button className={styles.btn} onClick={onReset}>
        Reset
      </button>
    </div>
  )
}

export default Controls
