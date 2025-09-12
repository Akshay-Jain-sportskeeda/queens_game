import { useState, useCallback } from 'react';
import { fetchUserGameHistory, GameResult, getUserRank } from '../utils/firestore';
import { UserStats } from '../types/game';

export function useLeaderboard() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getUserStats = useCallback(async (userId: string): Promise<UserStats | null> => {
    if (!userId) return null;

    setLoading(true);
    setError(null);

    try {
      // Fetch all game results for the user
      const gameResults = await fetchUserGameHistory(userId);
      
      if (gameResults.length === 0) {
        return null;
      }

      // Calculate basic stats
      const totalGames = gameResults.length;
      const totalMoves = gameResults.reduce((sum, game) => sum + game.moves, 0);
      const totalHints = gameResults.reduce((sum, game) => sum + game.hintsUsed, 0);
      const totalTimeSpent = gameResults.reduce((sum, game) => sum + game.totalTime, 0);

      // Calculate unassisted games (0 hints)
      const unassistedGames = gameResults.filter(game => game.hintsUsed === 0);
      const unassistedGamesCount = unassistedGames.length;
      
      // Find best unassisted time
      let bestUnassistedTime: number | null = null;
      let bestUnassistedTimeDate: string | undefined;
      if (unassistedGames.length > 0) {
        const bestUnassisted = unassistedGames.reduce((best, game) => 
          game.totalTime < best.totalTime ? game : best
        );
        bestUnassistedTime = bestUnassisted.totalTime;
        bestUnassistedTimeDate = bestUnassisted.puzzleDate;
      }

      // Find best overall time
      const bestTimeGame = gameResults.reduce((best, game) => 
        game.totalTime < best.totalTime ? game : best
      );
      const bestTime = bestTimeGame.totalTime;
      const bestTimeDate = bestTimeGame.puzzleDate;

      // Calculate averages
      const averageMoves = totalMoves / totalGames;
      const averageHints = totalHints / totalGames;
      const averageTime = totalTimeSpent / totalGames;

      // Calculate games this week
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const gamesThisWeek = gameResults.filter(game => 
        game.completedAt >= oneWeekAgo
      ).length;

      // Calculate current streak (consecutive days with games)
      const sortedByDate = gameResults
        .sort((a, b) => new Date(b.puzzleDate).getTime() - new Date(a.puzzleDate).getTime());
      
      let currentStreak = 0;
      const today = new Date().toISOString().split('T')[0];
      let checkDate = new Date(today);
      
      // Check if user played today or yesterday to start streak
      const hasPlayedToday = sortedByDate.some(game => game.puzzleDate === today);
      const yesterday = new Date(checkDate);
      yesterday.setDate(yesterday.getDate() - 1);
      const hasPlayedYesterday = sortedByDate.some(game => 
        game.puzzleDate === yesterday.toISOString().split('T')[0]
      );
      
      if (hasPlayedToday) {
        currentStreak = 1;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (hasPlayedYesterday) {
        currentStreak = 1;
        checkDate = yesterday;
        checkDate.setDate(checkDate.getDate() - 1);
      }
      
      // Count consecutive days backwards
      if (currentStreak > 0) {
        while (true) {
          const dateStr = checkDate.toISOString().split('T')[0];
          const hasPlayedThisDate = sortedByDate.some(game => game.puzzleDate === dateStr);
          
          if (hasPlayedThisDate) {
            currentStreak++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            break;
          }
        }
      }

      // Get completed dates for pending games calculation
      const completedDates = gameResults.map(game => game.puzzleDate);

      // For best rank, we would need to calculate rank for each game
      // For now, we'll set it to 1 as a placeholder since calculating historical ranks
      // would require fetching all players' data for each puzzle date
      const bestRank = 1;
      const bestRankDate = bestTimeDate;

      const userStats: UserStats = {
        totalGames,
        totalMoves,
        totalHints,
        totalTimeSpent,
        unassistedGamesCount,
        bestUnassistedTime,
        bestTime,
        bestRank,
        averageMoves,
        averageHints,
        averageTime,
        gamesThisWeek,
        currentStreak,
        bestUnassistedTimeDate,
        bestTimeDate,
        bestRankDate,
        completedDates
      };

      return userStats;
    } catch (err) {
      console.error('Error fetching user stats:', err);
      setError('Failed to load user statistics');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getUserCompletedDates = useCallback(async (userId: string): Promise<string[]> => {
    try {
      const gameResults = await fetchUserGameHistory(userId);
      return gameResults.map(game => game.puzzleDate);
    } catch (error) {
      console.error('Error fetching completed dates:', error);
      return [];
    }
  }, []);

  return {
    getUserStats,
    getUserCompletedDates,
    loading,
    error
  };
}