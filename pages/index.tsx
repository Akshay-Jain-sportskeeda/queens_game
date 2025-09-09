import { GetServerSideProps } from 'next'
import Head from 'next/head'
import { useState, useEffect, useCallback } from 'react'
import { PuzzleData, GameState, WinStats } from '../types/game'
import GameBoard from '../components/GameBoard'
import Controls from '../components/Controls'
import InfoBar from '../components/InfoBar'
import Instructions from '../components/Instructions'
import WinScreen from '../components/WinScreen'
import ArchiveScreen from '../components/ArchiveScreen'
import RulesPopup from '../components/RulesPopup'
import { useGameLogic } from '../hooks/useGameLogic'

interface HomeProps {
  puzzleData: PuzzleData
  availableDates: string[]
}

export default function Home({ puzzleData, availableDates }: HomeProps) {
  const {
    gameState,
    puzzleData: currentPuzzleData,
    infoMessage,
    hintHighlights,
    handleCellClick,
    undo,
    getHint,
    reset,
    shareResults,
    loadPuzzleForDate,
    showInfoMessage,
    resetWinAnimation
  } = useGameLogic(puzzleData)

  const [showWinScreen, setShowWinScreen] = useState(false)
  const [showArchive, setShowArchive] = useState(false)
  const [showRules, setShowRules] = useState(false)
  const [winStats, setWinStats] = useState<WinStats>({ moves: 0, hints: 0, time: '0:00' })

  // Check for win condition
  useEffect(() => {
    if (gameState.gameCompleted && !showWinScreen) {
      // Wait for all animations to complete before showing win screen
      setTimeout(() => {
        const endTime = Date.now()
        const baseTime = Math.floor((endTime - gameState.startTime) / 1000)
        const hintPenalty = gameState.hintCount * 15 // 15 seconds per hint
        const totalTime = baseTime + hintPenalty
        const minutes = Math.floor(totalTime / 60)
        const seconds = totalTime % 60
        const displayTime = `${minutes}m ${seconds}s`
        
        const baseMinutes = Math.floor(baseTime / 60)
        const baseSeconds = baseTime % 60
        const calculation = gameState.hintCount > 0 
          ? `${baseMinutes}m ${baseSeconds}s + ${gameState.hintCount}×15s`
          : `${baseMinutes}m ${baseSeconds}s`
        
        setWinStats({
          moves: gameState.moveCount,
          hints: gameState.hintCount,
          time: displayTime,
          displayTime: displayTime,
          calculation: calculation
        })
        setShowWinScreen(true)
      }, 2500) // Wait for all row animations (2s) + 0.5s delay = 2.5s
    }
  }, [gameState.gameCompleted, gameState.startTime, gameState.moveCount, gameState.hintCount, showWinScreen])

  const handleWinScreenClose = useCallback(() => {
    setShowWinScreen(false)
    resetWinAnimation()
  }, [resetWinAnimation])

  const handleArchiveToggle = useCallback(() => {
    // If we're opening the archive and the win screen is showing, close it first
    if (!showArchive && showWinScreen) {
      setShowWinScreen(false)
      resetWinAnimation()
    }
    setShowArchive(!showArchive)
  }, [showArchive, showWinScreen, resetWinAnimation])

  const handleRulesToggle = useCallback(() => {
    setShowRules(!showRules)
  }, [showRules])

  return (
    <>
      <Head>
        <title>NFL Field Puzzle - Daily Logic Game</title>
        <meta name="description" content="A challenging logic puzzle game where you place exactly one football in each row, column, and color region. Play daily puzzles with hints and archive access." />
        <meta name="keywords" content="puzzle, game, nfl, football, logic, brain teaser, daily puzzle" />
        <meta property="og:title" content="NFL Field Puzzle - Daily Logic Game" />
        <meta property="og:description" content="A challenging logic puzzle game where you place exactly one football in each row, column, and color region. Play daily puzzles with hints and archive access." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="NFL Field Puzzle - Daily Logic Game" />
        <meta name="twitter:description" content="A challenging logic puzzle game where you place exactly one football in each row, column, and color region. Play daily puzzles with hints and archive access." />
      </Head>

      <div className="game-container">
        <header>
          <h1>🏈 NFL Field Puzzle</h1>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
            <button 
              onClick={handleRulesToggle}
              style={{
                background: 'transparent',
                border: '1px solid #667eea',
                borderRadius: '4px',
                padding: '6px 10px',
                color: '#667eea',
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.2s ease',
                flexShrink: 0
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#667eea'
                e.currentTarget.style.color = 'white'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = '#667eea'
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M9,9h0a3,3,0,0,1,5.12,2.12h0A3,3,0,0,1,13,14"/>
                <circle cx="12" cy="17" r=".5"/>
              </svg>
              Rules
            </button>
            <p style={{ margin: 0 }}>Place exactly one football in each row, column, and color region</p>
          </div>
        </header>
        
        <GameBoard
          board={gameState.board}
          regions={currentPuzzleData.regions}
          prefills={currentPuzzleData.prefills}
          violations={gameState.violations}
          conflictTypes={gameState.conflictTypes}
          hintHighlights={hintHighlights}
          isWinAnimationActive={gameState.isWinAnimationActive}
          onCellClick={handleCellClick}
        />
        
        <Controls
          onUndo={undo}
          onHint={getHint}
          onReset={reset}
        />
        
        <InfoBar
          message={infoMessage.text || "Click on cells to place × or 🏈. Use hints if you get stuck!"}
          type={infoMessage.type as 'default' | 'hint' | 'conflict' | 'success'}
        />
        
        {showWinScreen && (
          <WinScreen
            stats={winStats}
            onShare={shareResults}
            onArchive={handleArchiveToggle}
            onClose={handleWinScreenClose}
            show={showWinScreen}
          />
        )}
        
        {showArchive && (
          <ArchiveScreen
            availableDates={availableDates}
            onDateSelect={loadPuzzleForDate}
            onClose={handleArchiveToggle}
          />
        )}
        
        <RulesPopup
          show={showRules}
          onClose={handleRulesToggle}
        />
      </div>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const baseUrl = context.req.headers.host
    const protocol = context.req.headers['x-forwarded-proto'] || 'http'
    const apiUrl = `${protocol}://${baseUrl}/api/puzzle-data`
    
    const response = await fetch(apiUrl)
    const puzzles = await response.json()
    
    // Get today's puzzle
    const today = new Date().toISOString().split('T')[0]
    const puzzleData = puzzles[today] || puzzles[Object.keys(puzzles)[0]] || {
      date: today,
      gridSize: 8,
      regions: [
        [0,0,0,0,0,0,0,0],
        [0,0,1,1,0,0,0,0],
        [0,2,3,3,3,1,0,0],
        [0,4,3,3,3,5,5,0],
        [0,4,3,3,3,5,5,0],
        [0,0,6,6,6,0,5,0],
        [7,0,0,6,0,0,0,0],
        [7,0,0,6,0,0,0,0]
      ],
      queens: [[0,6],[1,3],[2,5],[3,7],[4,2],[5,4],[6,1],[7,0]],
      prefills: []
    }
    
    const availableDates = Object.keys(puzzles).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
    
    return {
      props: {
        puzzleData,
        availableDates
      }
    }
  } catch (error) {
    console.error('Error in getServerSideProps:', error)
    
    // Fallback data
    const fallbackPuzzle: PuzzleData = {
      date: new Date().toISOString().split('T')[0],
      gridSize: 8,
      regions: [
        [0,0,0,0,0,0,0,0],
        [0,0,1,1,0,0,0,0],
        [0,2,3,3,3,1,0,0],
        [0,4,3,3,3,5,5,0],
        [0,4,3,3,3,5,5,0],
        [0,0,6,6,6,0,5,0],
        [7,0,0,6,0,0,0,0],
        [7,0,0,6,0,0,0,0]
      ],
      queens: [[0,6],[1,3],[2,5],[3,7],[4,2],[5,4],[6,1],[7,0]],
      prefills: []
    }
    
    return {
      props: {
        puzzleData: fallbackPuzzle,
        availableDates: [fallbackPuzzle.date]
      }
    }
  }
}
