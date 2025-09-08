import React from 'react'
import styles from '../styles/Instructions.module.css'

const Instructions: React.FC = () => {
  return (
    <div className={styles.instructions}>
      <h3>How to play</h3>
      <ol>
        <li>Your goal is to have <strong>exactly one 🏈 in each row, column, and color region</strong></li>
        <li><strong>Tap once</strong> to place X and <strong>tap twice</strong> for 🏈. Use X to mark where 🏈 cannot be placed</li>
        <li>Two 🏈 <strong>cannot touch each other</strong>, not even diagonally</li>
      </ol>
    </div>
  )
}

export default Instructions
