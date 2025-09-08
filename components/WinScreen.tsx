import React from 'react'
import { WinStats } from '../types/game'
import styles from '../styles/WinScreen.module.css'

interface WinScreenProps {
  stats: WinStats
  onShare: () => void
  onArchive: () => void
  onClose: () => void
}

const WinScreen: React.FC<WinScreenProps> = ({
  stats,
  onShare,
  onArchive,
  onClose
}) => {
  return (
    <div className={styles.winScreen}>
      <div className={styles.winContent}>
        <div className={styles.winBannerContainer}>
          <div className={styles.winBanner}>🎉 Congratulations! 🎉</div>
          <div className={styles.winSubtitle}>You solved today's NFL Field Puzzle!</div>
        </div>
        
        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{stats.moves}</span>
            <div className={styles.statLabel}>Moves</div>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{stats.hints}</span>
            <div className={styles.statLabel}>Hints</div>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{stats.time}</span>
            <div className={styles.statLabel}>Time</div>
          </div>
        </div>
        
        <div className={styles.winActions}>
          <button className={`${styles.winBtn} ${styles.share}`} onClick={onShare}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
              <polyline points="16,6 12,2 8,6"/>
              <line x1="12" y1="2" x2="12" y2="15"/>
            </svg>
            Share
          </button>
          <button className={`${styles.winBtn} ${styles.archive}`} onClick={onArchive}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="21,8 21,21 3,21 3,8"/>
              <rect x="1" y="3" width="22" height="5"/>
              <line x1="10" y1="12" x2="14" y2="12"/>
            </svg>
            Play&nbsp;Archive
          </button>
        </div>
      </div>
    </div>
  )
}

export default WinScreen
