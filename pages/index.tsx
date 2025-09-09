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
import { useGameLogic } from '../hooks/useGameLogic'

interface HomeProps {
  puzzleData: PuzzleData
  availableDates: string[]
}

export default function Home({ puzzleData, availableDates }: HomeProps) {
  const {
    gameState,
    infoMessage,
    hintHighlights,
    handleCellClick,
    undo,
    getHint,
    reset,
    shareResults,
    loadPuzzleForDate,
    showInfoMessage,
    clearHintHighlights,
    resetInfoMessage
  } = useGameLogic(puzzleData)

  const [showWinScreen, setShowWinScreen] = useState(false)
  const [showArchive, setShowArchive] = useState(false)
  const [winStats, setWinStats] = useState<WinStats>({ moves: 0, hints: 0, time: '0:00' })

  // Check for win condition
  useEffect(() => {
    if (gameState.gameCompleted && !showWinScreen) {
      const endTime = Date.now()
      const totalTime = Math.floor((endTime - gameState.startTime) / 1000)
      const minutes = Math.floor(totalTime / 60)
      const seconds = totalTime % 60
      const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`
      
      setWinStats({
        moves: gameState.moveCount,
        hints: gameState.hintCount,
        time: timeString
      })
      setShowWinScreen(true)
    }
  }, [gameState.gameCompleted, gameState.startTime, gameState.moveCount, gameState.hintCount])

  const handleWinScreenClose = useCallback(() => {
    setShowWinScreen(false)
  }, [])

  const handleArchiveToggle = useCallback(() => {
    setShowArchive(!showArchive)
  }, [showArchive])

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
          <p>Place exactly one football in each row, column, and color region</p>
        </header>
        
        <GameBoard
          board={gameState.board}
          regions={puzzleData.regions}
          prefills={puzzleData.prefills}
          violations={gameState.violations}
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
          message={infoMessage.text || "Click on cells to place X or 🏈. Use hints if you get stuck!"}
          type={infoMessage.type as 'default' | 'hint' | 'conflict' | 'success'}
        />
        
        <Instructions />
        
        {showWinScreen && (
          <WinScreen
            stats={winStats}
            onShare={shareResults}
            onArchive={handleArchiveToggle}
            onClose={handleWinScreenClose}
          />
        )}
        
        {showArchive && (
          <ArchiveScreen
            availableDates={availableDates}
            onDateSelect={loadPuzzleForDate}
            onClose={handleArchiveToggle}
          />
        )}
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
