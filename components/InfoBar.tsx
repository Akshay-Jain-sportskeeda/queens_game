import React from 'react'
import styles from '../styles/InfoBar.module.css'

interface InfoBarProps {
  message: string
  type: 'default' | 'hint' | 'conflict' | 'success'
  show?: boolean
}

const InfoBar: React.FC<InfoBarProps> = ({ message, type, show = true }) => {
  if (!show) return null
  
  return (
    <div className={`${styles.infoBar} ${styles[type]}`}>
      <div className={styles.infoContent}>
        <span className={styles.infoText}>{message}</span>
      </div>
    </div>
  )
}

export default InfoBar
