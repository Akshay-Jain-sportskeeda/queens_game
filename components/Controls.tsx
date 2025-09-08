import React from 'react'
import styles from '../styles/Controls.module.css'

interface ControlsProps {
  onUndo: () => void
  onHint: () => void
  onReset: () => void
  onArchive: () => void
}

const Controls: React.FC<ControlsProps> = ({
  onUndo,
  onHint,
  onReset,
  onArchive
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
      <button className={styles.btn} onClick={onArchive}>
        Archive
      </button>
    </div>
  )
}

export default Controls
