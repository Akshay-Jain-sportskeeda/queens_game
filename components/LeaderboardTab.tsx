import React, { useEffect } from 'react';
import { Trophy, Clock, Target, Lightbulb, LogIn } from 'lucide-react';
import { LeaderboardEntry } from './LeaderboardModal';
import { trackLeaderboardView, trackLeaderboardRankView, trackCTAClick } from '../utils/analytics';

interface LeaderboardTabProps {
  currentLeaderboard: LeaderboardEntry[];
  currentPuzzleDate?: string;
  loading?: boolean;
  error: string | null;
  userId?: string;
  isLoggedIn?: boolean;
  onShowLogin?: () => void;
  onFetchLeaderboard?: (date: string) => void;
  onGetUserRank?: (userId: string, puzzleDate: string) => Promise<{ rank: number; userEntry: LeaderboardEntry } | null>;
}

export const LeaderboardTab: React.FC<LeaderboardTabProps> = ({
  currentLeaderboard,
  currentPuzzleDate,
  loading = false,
  error,
  userId,
  isLoggedIn = false,
  onShowLogin,
  onFetchLeaderboard,
  onGetUserRank
}) => {
  const [userRankInfo, setUserRankInfo] = React.useState<{ rank: number; userEntry: LeaderboardEntry } | null>(null);
  const [userRankLoading, setUserRankLoading] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState<string>(currentPuzzleDate || new Date().toISOString().split('T')[0]);

  // Update selected date when currentPuzzleDate changes
  React.useEffect(() => {
    if (currentPuzzleDate) {
      setSelectedDate(currentPuzzleDate);
    }
  }, [currentPuzzleDate]);

  // Fetch leaderboard when tab is active
  React.useEffect(() => {
    if (selectedDate && onFetchLeaderboard) {
      trackLeaderboardView(selectedDate, isLoggedIn);
      onFetchLeaderboard(selectedDate);
    }
  }, [selectedDate, onFetchLeaderboard, isLoggedIn]);

  // Fetch user rank when we have user data
  React.useEffect(() => {
    const fetchUserRank = async () => {
      if (userId && selectedDate && onGetUserRank) {
        setUserRankLoading(true);
        try {
          const rankInfo = await onGetUserRank(userId, selectedDate);
          setUserRankInfo(rankInfo);
          if (rankInfo) {
            trackLeaderboardRankView(rankInfo.rank, currentLeaderboard.length);
          }
          setUserRankInfo(rankInfo);
        } finally {
          setUserRankLoading(false);
        }
      }
    };
    
    fetchUserRank();
  }, [userId, selectedDate, onGetUserRank, currentLeaderboard.length]);

  const formatTime = (milliseconds: number): string => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  };

  const getTimeBreakdown = (entry: LeaderboardEntry): string | null => {
    if (entry.hintsUsed === 0) return null;
    
    const baseTime = entry.totalTime - (entry.hintsUsed * 15 * 1000);
    const baseTimeFormatted = formatTime(baseTime);
    return `${baseTimeFormatted} + ${entry.hintsUsed}×15s`;
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-gray-600">{rank}</span>;
    }
  };

  // Check if user is in top 20
  const userInTop20 = userId && currentLeaderboard.some(entry => entry.userId === userId);
  const showUserRank = userRankInfo && !userInTop20 && userRankInfo.rank > 20;

  // Show login prompt for guest users
  if (!isLoggedIn) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-lg mx-auto">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Trophy className="w-6 h-6 text-yellow-500" />
                <h2 className="text-xl md:text-2xl font-bold text-gray-800">
                  {currentPuzzleDate ? 
                    `${new Date(currentPuzzleDate).toLocaleDateString('en-US', { 
                      day: 'numeric', 
                     month: 'short'
                    })} Leaderboard` :
                    `${new Date().toLocaleDateString('en-US', { 
                      day: 'numeric', 
                     month: 'short'
                    })} Leaderboard`
                  }
                </h2>
              </div>
            </div>
          </div>

          {/* Login Prompt */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center">
              <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-800 mb-3">
                Sign in to view the leaderboard
              </h3>
              <p className="text-gray-600 mb-6">
                Create an account to see how you rank against other players and track your progress over time.
              </p>
              <button
                onClick={() => {
                  trackCTAClick('login', 'leaderboard_guest_prompt', false);
                  onShowLogin && onShowLogin();
                }}
                className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2 mx-auto"
              >
                <LogIn className="w-5 h-5" />
                Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleDateChange = (direction: 'prev' | 'next') => {
    const currentDate = new Date(selectedDate);
    if (direction === 'prev') {
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    const newDate = currentDate.toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];
    const earliestDate = '2025-09-13';
    
    // Don't allow future dates or dates before September 13th, 2025
    if (newDate <= today && newDate >= earliestDate) {
      // Track navigation event
      trackCTAClick(`leaderboard_nav_${direction}`, 'leaderboard_date_navigation', isLoggedIn);
      setSelectedDate(newDate);
    }
  };

  const canGoPrev = () => {
    const prevDate = new Date(selectedDate);
    prevDate.setDate(prevDate.getDate() - 1);
    const prevDateStr = prevDate.toISOString().split('T')[0];
    const earliestDate = '2025-09-13'; // First available puzzle date
    return prevDateStr >= earliestDate;
  };

  const canGoNext = () => {
    const nextDate = new Date(selectedDate);
    nextDate.setDate(nextDate.getDate() + 1);
    const nextDateStr = nextDate.toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];
    return nextDateStr <= today;
  };
  return (
    <div className="px-2 md:px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
          <div className="text-center">
            <div className="flex items-center justify-between mb-3">
              {/* Previous button */}
              <button
                onClick={() => handleDateChange('prev')}
                disabled={!canGoPrev()}
                className="flex items-center justify-center w-7 h-7 text-gray-500 hover:text-red-600 hover:bg-red-50 disabled:text-gray-300 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:bg-transparent rounded-full transition-all duration-200 hover:scale-110 shadow-sm hover:shadow-md"
                aria-label="Previous day"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15,18 9,12 15,6"/>
                </svg>
              </button>
              
              {/* Title */}
              <div className="flex items-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-500" />
                <h2 className="text-xl md:text-2xl font-bold text-gray-800">
                  {selectedDate ? 
                    `${new Date(selectedDate).toLocaleDateString('en-US', { 
                      day: 'numeric', 
                      month: 'short'
                    })} Leaderboard` :
                    `${new Date().toLocaleDateString('en-US', { 
                      day: 'numeric', 
                      month: 'short'
                    })} Leaderboard`
                  }
                </h2>
              </div>
              
              {/* Next button */}
              <button
                onClick={() => handleDateChange('next')}
                disabled={!canGoNext()}
                className="flex items-center justify-center w-7 h-7 text-gray-500 hover:text-red-600 hover:bg-red-50 disabled:text-gray-300 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:bg-transparent rounded-full transition-all duration-200 hover:scale-110 shadow-sm hover:shadow-md"
                aria-label="Next day"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9,18 15,12 9,6"/>
                </svg>
              </button>
            </div>
            
            <p className="text-gray-600 text-sm">
              Rankings may change as more players join
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-lg p-3 md:p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <span className="ml-3 text-gray-600">Loading leaderboard...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : currentLeaderboard.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg mb-2">No scores yet today!</p>
              <p className="text-gray-500">Be the first to complete today's puzzle.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Top 20 Header */}
              <div className="text-center mb-4">
                <h3 className="text-xl font-semibold text-gray-800">Top 20 Players</h3>
              </div>
              
              {/* Leaderboard entries */}
              {currentLeaderboard.map((entry, index) => (
                <div
                  key={entry.id}
                  className={`flex items-center justify-between p-3 md:p-4 rounded-lg border overflow-hidden ${
                    index === 0
                      ? 'border-yellow-300 shadow-lg'
                      : ''
                  } ${
                    userId === entry.userId
                      ? 'bg-blue-50 border-blue-200' 
                      : 'bg-gray-50 border-gray-200'
                  }`}
                  style={index === 0 ? {
                    backgroundColor: 'rgb(255, 248, 180)',
                    borderColor: 'rgb(255, 248, 180)'
                  } : {}}
                >
                  <div className="flex items-center space-x-2 md:space-x-4 flex-1 min-w-0">
                    {getRankIcon(index + 1)}
                    <div>
                      <div className={`flex items-center gap-1 flex-wrap ${index === 0 ? 'items-center' : ''}`}>
                        <span className={`font-semibold ${
                          index === 0 
                            ? 'text-yellow-800 text-base md:text-lg font-bold' 
                            : 'text-gray-800 text-sm md:text-base'
                        } truncate max-w-[120px] md:max-w-[200px]`}>
                          {entry.displayName || 'Anonymous'}
                        </span>
                        {index === 0 && (
                          <span 
                            className="text-xs px-1 py-0.5 rounded-full font-bold whitespace-nowrap flex-shrink-0"
                            style={{
                              backgroundColor: 'rgb(253, 224, 71)',
                              color: 'rgb(133, 77, 14)'
                            }}
                          >
                            WINNER
                          </span>
                        )}
                        {userId === entry.userId && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-1 py-0.5 rounded-full font-medium whitespace-nowrap flex-shrink-0">
                            You
                          </span>
                        )}
                      </div>
                      
                      {/* Stats */}
                      <div className="hidden md:flex items-center gap-4 mt-1 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Target className="w-3 h-3" />
                          <span>{entry.moves} moves</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Lightbulb className="w-3 h-3" />
                          <span>{entry.hintsUsed} hints</span>
                        </div>
                      </div>
                      
                      {/* Mobile compact stats */}
                      <div className="md:hidden text-xs text-gray-600 mt-1">
                        {entry.moves} moves • {entry.hintsUsed} hints
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right flex-shrink-0">
                    <div className={`flex items-center gap-2 ${
                      index === 0 
                        ? 'text-yellow-700 text-lg md:text-xl font-bold' 
                        : 'text-green-600 text-base md:text-lg font-bold'
                    }`}>
                      <Clock className="w-3 h-3 md:w-4 md:h-4" />
                      {formatTime(entry.totalTime)}
                    </div>
                    {getTimeBreakdown(entry) && (
                      <div className="text-xs text-gray-500 mt-1">
                        {getTimeBreakdown(entry)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {/* User's rank if not in top 20 */}
              {showUserRank && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="text-center mb-3">
                    <h3 className="text-lg font-semibold text-gray-700">Your Rank</h3>
                  </div>
                  
                  {userRankLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                      <span className="ml-2 text-gray-600">Loading your rank...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-3 md:p-4 rounded-lg border bg-yellow-50 border-yellow-200 overflow-hidden">
                      <div className="flex items-center space-x-2 md:space-x-4 flex-1 min-w-0">
                        <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-gray-600">
                          {userRankInfo.rank}
                        </span>
                        <div>
                          <div className="flex items-center gap-1 flex-wrap">
                            <span className="font-semibold text-gray-800 text-sm md:text-base truncate max-w-[120px] md:max-w-none">
                              {userRankInfo.userEntry.displayName || 'Anonymous'}
                            </span>
                            <span className="text-xs bg-yellow-100 text-yellow-700 px-1 py-0.5 rounded-full font-medium whitespace-nowrap flex-shrink-0">
                              You
                            </span>
                          </div>
                          
                          <div className="hidden md:flex items-center gap-4 mt-1 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Target className="w-3 h-3" />
                              <span>{userRankInfo.userEntry.moves} moves</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Lightbulb className="w-3 h-3" />
                              <span>{userRankInfo.userEntry.hintsUsed} hints</span>
                            </div>
                          </div>
                          
                          {/* Mobile compact stats */}
                          <div className="md:hidden text-xs text-gray-600 mt-1">
                            {userRankInfo.userEntry.moves} moves • {userRankInfo.userEntry.hintsUsed} hints
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right flex-shrink-0">
                        <div className="flex items-center gap-2 text-green-600 text-base md:text-lg font-bold">
                          <Clock className="w-3 h-3 md:w-4 md:h-4" />
                          {formatTime(userRankInfo.userEntry.totalTime)}
                        </div>
                        {getTimeBreakdown(userRankInfo.userEntry) && (
                          <div className="text-xs text-gray-500 mt-1">
                            {getTimeBreakdown(userRankInfo.userEntry)}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
  );
};