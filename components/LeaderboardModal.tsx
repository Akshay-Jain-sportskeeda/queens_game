import React from 'react';
import { X, Trophy, Clock, Target, Lightbulb } from 'lucide-react';

export interface LeaderboardEntry {
  id: string;
  userId: string;
  displayName: string;
  moves: number;
  hintsUsed: number;
  totalTime: number;
  completedAt: Date;
  puzzleDate: string;
}

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLeaderboard: LeaderboardEntry[];
  currentPuzzleDate?: string;
  loading?: boolean;
  error: string | null;
  userId?: string;
  onFetchLeaderboard?: (date: string) => void;
  onGetUserRank?: (userId: string, puzzleDate: string) => Promise<{ rank: number; userEntry: LeaderboardEntry } | null>;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  currentLeaderboard,
  currentPuzzleDate,
  loading = false,
  error,
  userId,
  onFetchLeaderboard,
  onGetUserRank
}) => {
  const [userRankInfo, setUserRankInfo] = React.useState<{ rank: number; userEntry: LeaderboardEntry } | null>(null);
  const [userRankLoading, setUserRankLoading] = React.useState(false);

  if (!isOpen) return null;

  // Fetch leaderboard when modal opens
  React.useEffect(() => {
    if (isOpen && currentPuzzleDate && onFetchLeaderboard) {
      onFetchLeaderboard(currentPuzzleDate);
    }
  }, [isOpen, currentPuzzleDate, onFetchLeaderboard]);

  // Fetch user rank when modal opens and we have user data
  React.useEffect(() => {
    const fetchUserRank = async () => {
      if (isOpen && userId && currentPuzzleDate && onGetUserRank) {
        setUserRankLoading(true);
        try {
          const rankInfo = await onGetUserRank(userId, currentPuzzleDate);
          setUserRankInfo(rankInfo);
        } catch (error) {
          setUserRankInfo(null);
        } finally {
          setUserRankLoading(false);
        }
      }
    };
    
    fetchUserRank();
  }, [isOpen, userId, currentPuzzleDate, onGetUserRank]);
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
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-gray-600">#{rank}</span>;
    }
  };

  // Check if user is in top 20
  const userInTop20 = userId && currentLeaderboard.some(entry => entry.userId === userId);
  const showUserRank = userRankInfo && !userInTop20 && userRankInfo.rank > 20;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-800 to-black p-6 text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="flex items-center justify-center gap-3 mb-2">
            <Trophy className="w-6 h-6 text-white" />
            <h2 className="text-2xl font-bold text-white">
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
          
          <p className="text-gray-200 text-sm mt-1">
            (Rankings may change as more players join)
          </p>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <span className="ml-3 text-gray-600">Loading leaderboard...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : currentLeaderboard.length === 0 ? (
            <div className="text-center py-8">
              <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg mb-2">No scores yet today!</p>
              <p className="text-gray-500">Be the first to complete today's puzzle.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {/* Top 20 Header */}
              <div className="text-center mb-2">
                <h3 className="text-lg font-semibold text-gray-800">Top 20 Players</h3>
              </div>
              
              {/* Leaderboard entries */}
              {currentLeaderboard.map((entry, index) => (
                <div
                  key={entry.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    index === 0
                      ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-300 shadow-lg'
                      : ''
                  } ${
                    userId === entry.userId
                      ? 'bg-blue-50 border-blue-200' 
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {getRankIcon(index + 1)}
                    <div>
                      <div className={`flex items-center gap-2 ${index === 0 ? 'items-center' : ''}`}>
                        <span className={`font-semibold text-sm ${
                          index === 0 
                            ? 'text-yellow-800 text-base font-bold' 
                            : 'text-gray-800'
                        }`}>
                          {entry.displayName || 'Anonymous'}
                        </span>
                        {index === 0 && (
                          <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded-full font-bold">
                            WINNER
                          </span>
                        )}
                        {userId === entry.userId && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                            You
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-base font-bold ${
                      index === 0 
                        ? 'text-yellow-700 text-lg' 
                        : 'text-green-600'
                    }`}>
                      {formatTime(entry.totalTime)}
                    </div>
                    {getTimeBreakdown(entry) && (
                      <div className="text-xs text-gray-500">
                        {getTimeBreakdown(entry)}
                      </div>
                    )}
                    </div>
                </div>
              ))}
              
              {/* User's rank if not in top 20 */}
              {showUserRank && (
                <div className="mt-4 pt-3 border-t border-gray-200">
                  <div className="text-center mb-2">
                    <h3 className="text-md font-semibold text-gray-700">Your Rank</h3>
                  </div>
                  
                  {userRankLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                      <span className="ml-2 text-gray-600">Loading your rank...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-3 rounded-lg border bg-yellow-50 border-yellow-200">
                      <div className="flex items-center space-x-3">
                        <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-gray-600">
                          #{userRankInfo.rank}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-800 text-sm">
                              {userRankInfo.userEntry.displayName || 'Anonymous'}
                            </span>
                            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">
                              You
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-base font-bold text-green-600">
                          {formatTime(userRankInfo.userEntry.totalTime)}
                        </div>
                        {getTimeBreakdown(userRankInfo.userEntry) && (
                          <div className="text-xs text-gray-500">
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

        {/* Footer */}
      </div>
    </div>
  );
};