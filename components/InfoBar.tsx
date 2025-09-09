import React from 'react'
import styles from '../styles/InfoBar.module.css'

interface InfoBarProps {
  message: string
  type: 'default' | 'hint' | 'conflict' | 'success'
}

const InfoBar: React.FC<InfoBarProps> = ({ message, type }) => {
  const getIcon = () => {
    switch (type) {
      case 'hint':
        return '💡'
      case 'success':
        return '🎉'
      default:
        return '💡'
    }
  }

  return (
    <div className={`${styles.infoBar} ${styles[type]}`}>
      <div className={styles.infoContent}>
        {getIcon() && <span className={styles.infoIcon}>{getIcon()}</span>}
        <span className={styles.infoText}>{message}</span>
      </div>
    </div>
  )
}

export default InfoBar
