import React from 'react'
import styles from '../styles/RulesPopup.module.css'

interface RulesPopupProps {
  show: boolean
  onClose: () => void
}

const RulesPopup: React.FC<RulesPopupProps> = ({ show, onClose }) => {
  if (!show) return null

  return (
    <div className={`${styles.rulesScreen} ${show ? styles.show : ''}`}>
      <div className={styles.rulesContent}>
        <div className={styles.rulesHeader}>
          <button className={styles.rulesCloseX} onClick={onClose} type="button" aria-label="Close">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
          
          <div className={styles.rulesTitle}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M9,9h0a3,3,0,0,1,5.12,2.12h0A3,3,0,0,1,13,14"/>
              <circle cx="12" cy="17" r=".5"/>
            </svg>
            Game Rules
          </div>
        </div>
        
        <div className={styles.rulesContentBody}>
          <div className={styles.rulesText}>
            <h3>How to play</h3>
            <ol>
              <li>Your goal is to have <strong>exactly one 🏈 in each row, column, and color region</strong></li>
              <li><strong>Tap once</strong> to place × and <strong>tap twice</strong> for 🏈. Use × to mark where 🏈 cannot be placed</li>
              <li>Two 🏈 <strong>cannot touch each other</strong>, not even diagonally</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RulesPopup