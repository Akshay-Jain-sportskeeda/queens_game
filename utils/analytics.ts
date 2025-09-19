// Analytics utility functions
// Analytics utility functions for NFL Octobox game tracking

// Helper function to send events to GA4
function sendGAEvent(eventName: string, parameters: Record<string, any> = {}) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, {
      event_category: 'GAME.NFL_OCTOBOX',
      ...parameters
    });
  }
}

export function trackLeaderboardView(puzzleDate: string, isLoggedIn: boolean): void {
  sendGAEvent('GAME.NFL_OCTOBOX.leaderboard_view', {
    puzzle_date: puzzleDate,
    is_logged_in: isLoggedIn
  });
}

export function trackLeaderboardRankView(rank: number, totalPlayers: number): void {
  sendGAEvent('GAME.NFL_OCTOBOX.rank_view', {
    user_rank: rank,
    total_players: totalPlayers
  });
}

export function trackCTAClick(action: string, context: string, isLoggedIn: boolean): void {
  sendGAEvent('GAME.NFL_OCTOBOX.cta_click', {
    action: action,
    context: context,
    is_logged_in: isLoggedIn
  });
}

export function trackDashboardView(isLoggedIn: boolean): void {
  sendGAEvent('GAME.NFL_OCTOBOX.dashboard_view', {
    is_logged_in: isLoggedIn
  });
}

export function trackUserStatsView(totalGames: number, currentStreak: number): void {
  sendGAEvent('GAME.NFL_OCTOBOX.stats_view', {
    total_games: totalGames,
    current_streak: currentStreak
  });
}

export function trackPendingGamesClick(pendingCount: number, totalAvailable: number): void {
  sendGAEvent('GAME.NFL_OCTOBOX.pending_games_click', {
    pending_count: pendingCount,
    total_available: totalAvailable
  });
}

export function trackArchiveView(): void {
  sendGAEvent('GAME.NFL_OCTOBOX.archive_view');
}

export function trackArchivePuzzleLoad(date: string, fromDashboard: boolean): void {
  sendGAEvent('GAME.NFL_OCTOBOX.archive_puzzle_load', {
    puzzle_date: date,
    from_dashboard: fromDashboard
  });
}

export function trackModalOpen(modalType: string): void {
  sendGAEvent('GAME.NFL_OCTOBOX.modal_open', {
    modal_type: modalType
  });
}

export function trackModalClose(modalType: string): void {
  sendGAEvent('GAME.NFL_OCTOBOX.modal_close', {
    modal_type: modalType
  });
}

// Game-specific tracking events
export function trackGameStart(puzzleDate: string): void {
  sendGAEvent('GAME.NFL_OCTOBOX.game_start', {
    puzzle_date: puzzleDate
  });
}

export function trackGameComplete(puzzleDate: string, moves: number, hints: number, timeMs: number): void {
  sendGAEvent('GAME.NFL_OCTOBOX.game_complete', {
    puzzle_date: puzzleDate,
    moves: moves,
    hints_used: hints,
    completion_time_ms: timeMs
  });
}

export function trackHintUsed(puzzleDate: string, hintNumber: number): void {
  sendGAEvent('GAME.NFL_OCTOBOX.hint_used', {
    puzzle_date: puzzleDate,
    hint_number: hintNumber
  });
}

export function trackGameReset(puzzleDate: string): void {
  sendGAEvent('GAME.NFL_OCTOBOX.game_reset', {
    puzzle_date: puzzleDate
  });
}

export function trackShareClick(puzzleDate: string): void {
  sendGAEvent('GAME.NFL_OCTOBOX.share_click', {
    puzzle_date: puzzleDate
  });
}

// Declare gtag function for TypeScript
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}