import React from 'react'
import styles from '../styles/ArchiveScreen.module.css'

interface ArchiveScreenProps {
  availableDates: string[]
  onDateSelect: (date: string) => void
  onClose: () => void
}

const ArchiveScreen: React.FC<ArchiveScreenProps> = ({
  availableDates,
  onDateSelect,
  onClose
}) => {
  const today = new Date().toISOString().split('T')[0]

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className={`${styles.archiveScreen} ${styles.show}`}>
      <div className={styles.archiveContent}>
        <div className={styles.archiveHeader}>
          <button className={styles.archiveCloseX} onClick={onClose} type="button" aria-label="Close">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
          
          <div className={styles.archiveTitle}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            Archive Games
          </div>
          <div className={styles.archiveSubtitle}>Select a previous day to play</div>
        </div>
        
        <div className={styles.archiveContentBody}>
          <div className={styles.archiveDates}>
            {availableDates.map((date) => (
              <div
                key={date}
                className={`${styles.dateItem} ${date === today ? styles.today : ''}`}
                onClick={() => onDateSelect(date)}
              >
                <div className={styles.dateText}>{formatDate(date)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ArchiveScreen
