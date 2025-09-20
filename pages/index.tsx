import { GetServerSideProps } from 'next'
import Head from 'next/head'
import { useState, useEffect, useCallback, useRef } from 'react'
import { PuzzleData, GameState, WinStats } from '../types/game'
import { useAuth } from '../hooks/useAuth'
import GameBoard from '../components/GameBoard'
import Controls from '../components/Controls'
import InfoBar from '../components/InfoBar'
import WinScreen from '../components/WinScreen'
import ArchiveScreen from '../components/ArchiveScreen'
import RulesPopup from '../components/RulesPopup'
import PFSNHeader from '../components/PFSNHeader'
import PFSNFooter from '../components/PFSNFooter'
import Auth from '../components/Auth'
import TopBar from '../components/TopBar'
import { UserDashboard } from '../components/UserDashboard'
import { LeaderboardTab } from '../components/LeaderboardTab'
import DashboardTab from '../components/DashboardTab'
import { saveGameResult, fetchLeaderboard, getUserRank } from '../utils/firestore'
import { useGameLogic } from '../hooks/useGameLogic'
import { RaptiveOutstreamAd, RaptiveSidebarAd, RaptiveFooterAd, useRaptiveRefresh } from '../components/RaptiveAds'

interface HomeProps {
  puzzleData: PuzzleData | null
  availableDates: string[]
}

export default function Home({ puzzleData, availableDates }: HomeProps) {
  const { user, logout } = useAuth()
  
  // Initialize Raptive ad refresh
  useRaptiveRefresh()
  
  // Timer ref for win condition timeout
  const winTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // If no puzzle data is available, show error message
  if (!puzzleData) {
    return (
      <>
        <Head>
          <title>NFL Octobox - No Puzzle Available</title>
        </Head>
        <PFSNHeader currentPage="NFL" />
        <div style={{
          minHeight: '50vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '40px',
            boxShadow: '0 10px 20px rgba(0, 0, 0, 0.15)',
            maxWidth: '500px',
            textAlign: 'center'
          }}>
            <h1 style={{ fontSize: '2rem', color: '#dc2626', marginBottom: '20px' }}>
              ⚠️ No Puzzle Available
            </h1>
            <p style={{ color: '#666', fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '20px' }}>
              Unable to load puzzle data from the Google Sheet. This could be due to:
            </p>
            <ul style={{ textAlign: 'left', color: '#666', marginBottom: '30px', paddingLeft: '20px' }}>
              <li>Network connectivity issues</li>
              <li>Google Sheet is not publicly accessible</li>
              <li>Invalid data format in the sheet</li>
              <li>No puzzle available for today's date</li>
            </ul>
            <p style={{ color: '#888', fontSize: '0.9rem' }}>
              Please check the Google Sheet and try refreshing the page.
            </p>
            <button 
              onClick={() => window.location.reload()}
              style={{
                marginTop: '20px',
                padding: '12px 24px',
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                cursor: 'pointer'
              }}
            >
              Refresh Page
            </button>
          </div>
        </div>
        <PFSNFooter currentPage="NFL" />
      </>
    )
  }
  
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
  const [showAuth, setShowAuth] = useState(false)
  const [winStats, setWinStats] = useState<WinStats>({ 
    moves: 0, 
    hints: 0, 
    time: '0:00',
    displayTime: '0:00',
    calculation: '0:00',
    score: 0
  })
  const [showInlineWinMetrics, setShowInlineWinMetrics] = useState(false)
  const [hasShownWinScreen, setHasShownWinScreen] = useState(false)
  const [activeTab, setActiveTab] = useState<'game' | 'leaderboard' | 'dashboard'>('game')
  const [currentLeaderboard, setCurrentLeaderboard] = useState<any[]>([])
  const [leaderboardLoading, setLeaderboardLoading] = useState(false)
  const [leaderboardError, setLeaderboardError] = useState<string | null>(null)
  const [isLoadingPuzzle, setIsLoadingPuzzle] = useState(false)
  const [pendingGameSave, setPendingGameSave] = useState(false)

  // Handle authentication success - save completed game if user was guest
  const handleAuthSuccess = useCallback(() => {
    // Check if game is completed and we have win stats
    if (gameState.gameCompleted && winStats.moves > 0) {
      setPendingGameSave(true)
    }
  }, [gameState.gameCompleted, winStats, currentPuzzleData.date])

  // Save game result when user becomes available after login
  useEffect(() => {
    if (user && pendingGameSave && gameState.gameCompleted && winStats.moves > 0) {
      // Calculate total time in milliseconds (same logic as in win condition)
      const endTime = Date.now()
      const baseTime = Math.floor((endTime - gameState.startTime) / 1000)
      const hintPenalty = gameState.hintCount * 15
      const totalTime = baseTime + hintPenalty
      const score = -(totalTime * 1000)
      
      saveGameResult(
        user,
        currentPuzzleData.date,
        gameState.moveCount,
        gameState.hintCount,
        totalTime * 1000,
        score
      ).then((saved) => {
        // Handle save result silently
      }).catch((error) => {
        // Handle error silently
      }).finally(() => {
        // Reset the flag regardless of success or failure
        setPendingGameSave(false)
      })
    }
  }, [user, pendingGameSave, gameState.gameCompleted, gameState.startTime, gameState.moveCount, gameState.hintCount, winStats, currentPuzzleData.date])

  // Check for win condition
  useEffect(() => {
    // Clear any existing timeout
    if (winTimeoutRef.current) {
      clearTimeout(winTimeoutRef.current)
      winTimeoutRef.current = null
    }
    
    if (gameState.gameCompleted && !showWinScreen && !hasShownWinScreen && gameState.moveCount > 0) {
      // Wait for all animations to complete before showing win screen
      winTimeoutRef.current = setTimeout(() => {
        const endTime = Date.now()
        const baseTime = Math.floor((endTime - gameState.startTime) / 1000)
        const hintPenalty = gameState.hintCount * 15 // 15 seconds per hint
        const totalTime = baseTime + hintPenalty
        const score = -(totalTime * 1000) // Negative of total time in milliseconds
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
          calculation: calculation,
          score: score
        })
        
        // Save game result to Firestore if user is logged in
        if (user) {
          saveGameResult(
            user,
            currentPuzzleData.date,
            gameState.moveCount,
            gameState.hintCount,
            totalTime * 1000, // Convert to milliseconds for consistency
            score
          ).then((saved) => {
            // Handle save result silently
          }).catch((error) => {
            // Handle error silently
          })
        }
        
        setShowWinScreen(true)
        setHasShownWinScreen(true)
        winTimeoutRef.current = null
      }, 2500) // Wait for all row animations (2s) + 0.5s delay = 2.5s
    }
    
    // Cleanup function to clear timeout if component unmounts or dependencies change
    return () => {
      if (winTimeoutRef.current) {
        clearTimeout(winTimeoutRef.current)
        winTimeoutRef.current = null
      }
    }
  }, [gameState.gameCompleted, gameState.startTime, gameState.moveCount, gameState.hintCount, showWinScreen, hasShownWinScreen, user, currentPuzzleData.date])

  const handleWinScreenClose = useCallback(() => {
    setShowWinScreen(false)
    setShowInlineWinMetrics(true)
    resetWinAnimation()
    
    // Smooth scroll to make the inline metrics visible
    setTimeout(() => {
      const metricsElement = document.querySelector('[data-inline-metrics]')
      if (metricsElement) {
        metricsElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        })
      }
    }, 100)
  }, [resetWinAnimation])

  const handleArchiveToggle = useCallback(() => {
    setShowArchive(!showArchive)
  }, [showArchive, showWinScreen, resetWinAnimation])

  const handleArchiveDateSelect = useCallback(async (date: string) => {
    // Set loading state
    setIsLoadingPuzzle(true);
    
    // Reset all game state before loading new puzzle
    setShowInlineWinMetrics(false);
    setHasShownWinScreen(false);
    setShowWinScreen(false);
    resetWinAnimation();
    
    // Reset the core game state to ensure gameCompleted is false
    reset();
    
    try {
      await loadPuzzleForDate(date);
      // Switch to game tab and close archive
      setActiveTab('game');
      setShowArchive(false);
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      // Handle error silently
    } finally {
      setIsLoadingPuzzle(false);
    }
  }, [loadPuzzleForDate, resetWinAnimation, reset]);
  const handleRulesToggle = useCallback(() => {
    setShowRules(!showRules)
  }, [showRules])

  const handleReset = useCallback(() => {
    setShowInlineWinMetrics(false)
    setHasShownWinScreen(false)
    reset()
    
    // Smooth scroll to make the game board visible
    setTimeout(() => {
      const gameBoard = document.querySelector('.game-container')
      if (gameBoard) {
        gameBoard.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        })
      }
    }, 100)
  }, [reset])

  const handleAuthToggle = () => {
    setShowAuth(true)
  }

  // Handle navigation to leaderboard from win screen
  useEffect(() => {
    const handleNavigateToLeaderboard = () => {
      setActiveTab('leaderboard')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    window.addEventListener('navigateToLeaderboard', handleNavigateToLeaderboard)
    return () => {
      window.removeEventListener('navigateToLeaderboard', handleNavigateToLeaderboard)
    }
  }, [])

  const handleTabChange = (tab: 'game' | 'leaderboard' | 'dashboard') => {
    setActiveTab(tab)
  }
  
  // Fetch leaderboard data
  const handleFetchLeaderboard = useCallback(async (date: string) => {
    setLeaderboardLoading(true)
    setLeaderboardError(null)
    
    try {
      const leaderboardData = await fetchLeaderboard(date)
      
      // Convert to the format expected by LeaderboardTab
      const formattedData = leaderboardData.map(entry => ({
        id: entry.id || '',
        userId: entry.userId,
        displayName: entry.displayName,
        moves: entry.moves,
        hintsUsed: entry.hintsUsed,
        totalTime: entry.totalTime,
        completedAt: entry.completedAt,
        puzzleDate: entry.puzzleDate
      }))
      
      setCurrentLeaderboard(formattedData)
    } catch (error) {
      setLeaderboardError('Failed to load leaderboard')
    } finally {
      setLeaderboardLoading(false)
    }
  }, [])
  
  // Get user rank
  const handleGetUserRank = useCallback(async (userId: string, puzzleDate: string) => {
    try {
      const rankInfo = await getUserRank(userId, puzzleDate)
      if (rankInfo) {
        return {
          rank: rankInfo.rank,
          userEntry: {
            id: rankInfo.userEntry.id || '',
            userId: rankInfo.userEntry.userId,
            displayName: rankInfo.userEntry.displayName,
            moves: rankInfo.userEntry.moves,
            hintsUsed: rankInfo.userEntry.hintsUsed,
            totalTime: rankInfo.userEntry.totalTime,
            completedAt: rankInfo.userEntry.completedAt,
            puzzleDate: rankInfo.userEntry.puzzleDate
          }
        }
      }
      return null
    } catch (error) {
      return null
    }
  }, [])

  const renderTabContent = () => {
    switch (activeTab) {
      case 'game':
        return (
          <div className="game-container">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', maxWidth: '400px', margin: '0 auto 25px auto' }}>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div style={{ fontSize: '1rem', fontWeight: '600', color: '#333', marginBottom: '4px' }}>
                  {currentPuzzleData.date === new Date().toISOString().split('T')[0] 
                    ? "Today's Puzzle" 
                    : `Archive: ${new Date(currentPuzzleData.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}`
                  }
                </div>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#666', lineHeight: '1.3' }}>Fill the grid with 🏈</p>
              </div>
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
            </div>
            
            <style jsx>{`
              @media (max-width: 480px) {
                .game-container > div:first-child {
                  max-width: 280px !important;
                }
              }
            `}</style>
            
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
              onReset={handleReset}
              gameCompleted={gameState.gameCompleted}
            />
            
            {showInlineWinMetrics && (
              <div style={{
                maxWidth: '400px',
                margin: '20px auto 0 auto',
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
              }} data-inline-metrics="">
                <div style={{
                  textAlign: 'center',
                  marginBottom: '16px',
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  color: '#1f2937'
                }}>
                  🎉 Puzzle Complete!
                </div>
                
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  marginBottom: '20px'
                }}>
                  <div style={{
                    padding: '12px 16px',
                    background: '#f0f9ff',
                    border: '1px solid #e0f2fe',
                    borderRadius: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{ color: '#374151', fontWeight: '500' }}>Moves</span>
                    <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#2563eb' }}>{winStats.moves}</span>
                  </div>
                  
                  <div style={{
                    padding: '12px 16px',
                    background: '#fefce8',
                    border: '1px solid #fef3c7',
                    borderRadius: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{ color: '#374151', fontWeight: '500' }}>Hints Used</span>
                    <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#d97706' }}>{winStats.hints}</span>
                  </div>
                  
                  <div style={{
                    padding: '12px 16px',
                    background: '#f0fdf4',
                    border: '1px solid #dcfce7',
                    borderRadius: '8px'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '8px'
                    }}>
                      <span style={{ color: '#374151', fontWeight: '500' }}>Time</span>
                      <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#16a34a' }}>{winStats.displayTime}</span>
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.875rem',
                      color: '#6b7280'
                    }}>
                      <span>+15s per hint</span>
                      <span>{winStats.calculation}</span>
                    </div>
                  </div>
                </div>
                
                <div style={{ marginBottom: '12px' }}>
                  <button 
                    onClick={() => {
                      if (!user) {
                        handleAuthToggle()
                      } else {
                        setActiveTab('leaderboard')
                        // Smooth scroll to top when switching to leaderboard
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      }
                    }}
                    style={{
                      width: '100%',
                      background: user ? 'linear-gradient(to right, #059669, #047857)' : 'linear-gradient(to right, #2563eb, #1d4ed8)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '12px 20px',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)'
                      e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
                      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
                      <path d="M4 22h16"/>
                      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
                      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
                      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
                    </svg>
                    {user ? 'View Leaderboard' : 'Login to view your Rank'}
                  </button>
                </div>
                
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  justifyContent: 'center'
                }}>
                  <button 
                    onClick={shareResults}
                    style={{
                      background: '#2563eb',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '10px 20px',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      transition: 'all 0.3s ease',
                      flex: 1
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#1d4ed8'
                      e.currentTarget.style.transform = 'translateY(-2px)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#2563eb'
                      e.currentTarget.style.transform = 'translateY(0)'
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                      <polyline points="16,6 12,2 8,6"/>
                      <line x1="12" y1="2" x2="12" y2="15"/>
                    </svg>
                    Share
                  </button>
                  
                  <button 
                    onClick={handleArchiveToggle}
                    style={{
                      background: 'linear-gradient(to right, #1f2937, #000000)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '10px 20px',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      transition: 'all 0.3s ease',
                      flex: 1
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(to right, #374151, #1f2937)'
                      e.currentTarget.style.transform = 'translateY(-2px)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(to right, #1f2937, #000000)'
                      e.currentTarget.style.transform = 'translateY(0)'
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="21,8 21,21 3,21 3,8"/>
                      <rect x="1" y="3" width="22" height="5"/>
                      <line x1="10" y1="12" x2="14" y2="12"/>
                    </svg>
                    Archive
                  </button>
                </div>
              </div>
            )}
            
            <div style={{ maxWidth: '400px', margin: '0 auto' }}>
              <InfoBar
                message={infoMessage.text || "Click on cells to place × or 🏈. Use hints if you get stuck!"}
                type={infoMessage.type as 'default' | 'hint' | 'conflict' | 'success'}
                show={!gameState.gameCompleted}
              />
            </div>
          </div>
        )
      case 'leaderboard':
        return (
          <LeaderboardTab
            currentLeaderboard={currentLeaderboard}
            currentPuzzleDate={currentPuzzleData.date}
            loading={leaderboardLoading}
            error={leaderboardError}
            userId={user?.uid}
            isLoggedIn={!!user}
            onShowLogin={handleAuthToggle}
            onFetchLeaderboard={handleFetchLeaderboard}
            onGetUserRank={handleGetUserRank}
          />
        )
      case 'dashboard':
        return (
          <DashboardTab
            isLoggedIn={!!user}
            userId={user?.uid}
            onShowLogin={handleAuthToggle}
            onPlayArchive={handleArchiveDateSelect}
            availablePuzzles={availableDates.map(date => ({ date, difficulty: 'medium' }))}
          />
        )
      default:
        return null
    }
  }
  return (
    <>
      <Head>
        <title>NFL Octobox: Daily Logic Game | PFSN</title>
        <meta name="description" content="Challenge yourself with the daily NFL Octobox from Pro Football Network. A fun logic game for football fans, featuring a grid-based puzzle. Find more NFL games and tools on our site." />
        <meta name="keywords" content="NFL Octobox, football puzzle, daily logic game, NFL games, football brain games, puzzle for football fans, sports puzzles" />
        <meta property="og:title" content="NFL Octobox: Daily Logic Game | PFSN" />
        <meta property="og:description" content="Challenge yourself with the daily NFL Octobox from Pro Football Network. A fun logic game for football fans, featuring a grid-based puzzle. Find more NFL games and tools on our site." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="NFL Octobox: Daily Logic Game | PFSN" />
        <meta name="twitter:description" content="Challenge yourself with the daily NFL Octobox from Pro Football Network. A fun logic game for football fans, featuring a grid-based puzzle. Find more NFL games and tools on our site." />
      </Head>

      <PFSNHeader currentPage="NFL" />
      
      <TopBar
        user={user}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onShowLogin={handleAuthToggle}
        onLogout={logout}
      />

      {/* Loading Overlay */}
      {isLoadingPuzzle && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '30px 40px',
            textAlign: 'center',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid #f3f4f6',
              borderTop: '4px solid #667eea',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 20px'
            }}></div>
            <div style={{
              fontSize: '1.1rem',
              fontWeight: '600',
              color: '#374151'
            }}>
              Loading puzzle...
            </div>
          </div>
        </div>
      )}

      <div className="main-game-wrapper">
        <div className="main-game-content">
          {renderTabContent()}
          
          {/* Outstream Ad - Bottom Left */}
          <div className="outstream-ad-container">
            <RaptiveOutstreamAd />
          </div>
        </div>
        
        {/* Sidebar Ad - Right Side */}
        <div className="sidebar-ad-container">
          <RaptiveSidebarAd />
        </div>
      </div>
        
      {/* Modal Components */}
      {showWinScreen && (
        <WinScreen
          stats={winStats}
          onShare={shareResults}
          onArchive={handleArchiveToggle}
          onClose={handleWinScreenClose}
          show={showWinScreen}
          user={user}
          onLoginClick={handleAuthToggle}
        />
      )}
      
      {showArchive && (
        <ArchiveScreen
          show={showArchive}
          availablePuzzles={availableDates.map(date => ({ date, difficulty: 'medium' }))}
          onSelectDate={handleArchiveDateSelect}
          onClose={handleArchiveToggle}
          userId={user?.uid}
        />
      )}
      
      <RulesPopup
        show={showRules}
        onClose={handleRulesToggle}
      />
      
      {showAuth && <Auth onClose={() => setShowAuth(false)} onAuthSuccess={handleAuthSuccess} />}

      {/* Footer Sticky Ad */}
      <RaptiveFooterAd />

      <PFSNFooter currentPage="NFL" />
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const baseUrl = context.req.headers.host
    const protocol = context.req.headers['x-forwarded-proto'] || 'http'
    const apiUrl = `${protocol}://${baseUrl}/api/puzzle-data`
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'NextJS-SSR/1.0'
      }
    })
    
    if (!response.ok) {
      let errorData
      try {
        errorData = await response.json()
      } catch (parseError) {
        errorData = { error: 'Failed to parse error response', details: await response.text() }
      }
      
      // Don't throw error, return null puzzle data to show error page
      return {
        props: {
          puzzleData: null,
          availableDates: []
        }
      }
    }
    
    const puzzles = await response.json()
    
    // Get today's puzzle
    const today = new Date().toISOString().split('T')[0]
    
    // Check if today's puzzle exists
    const todaysPuzzle = puzzles[today]
    
    // Use today's puzzle if available, otherwise use the first available puzzle, otherwise null
    const puzzleData = todaysPuzzle || puzzles[Object.keys(puzzles)[0]] || null
    
    const availableDates = Object.keys(puzzles).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
    
    return {
      props: {
        puzzleData,
        availableDates
      }
    }
  } catch (error) {
    // Return null to show error page instead of crashing
    return {
      props: {
        puzzleData: null,
        availableDates: []
      }
    }
  }
}