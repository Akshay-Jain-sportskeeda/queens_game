export interface PuzzleData {
  date: string;
  gridSize: number;
  regions: number[][];
  queens: number[][];
  prefills: number[][];
}

export interface GameState {
  board: string[][];
  history: string[][][];
  violations: Set<string>;
  conflictTypes: Map<string, string>;
  moveCount: number;
  hintCount: number;
  startTime: number;
  gameCompleted: boolean;
  isWinAnimationActive: boolean;
}

export interface CellProps {
  row: number;
  col: number;
  value: string;
  region: number;
  isPrefilled: boolean;
  hasConflict: boolean;
  isWinAnimated: boolean;
  animationDelay?: number;
  hasHintHighlight: boolean;
  hintBorderTop?: boolean;
  hintBorderRight?: boolean;
  hintBorderBottom?: boolean;
  hintBorderLeft?: boolean;
  conflictBorderTop?: boolean;
  conflictBorderRight?: boolean;
  conflictBorderBottom?: boolean;
  conflictBorderLeft?: boolean;
  conflictType?: string;
  onClick: (row: number, col: number) => void;
  borderTop: boolean;
  borderRight: boolean;
  borderBottom: boolean;
  borderLeft: boolean;
}

export interface HintData {
  type: 'wrong-football' | 'region-x' | 'row-x' | 'column-x' | 'adjacent-x' | 'valid-placement';
  data: any;
}

export interface WinStats {
  moves: number;
  hints: number;
  time: string;
  displayTime: string;
  calculation: string;
  score: number;
}

export interface UserStats {
  totalGames: number;
  totalMoves: number;
  totalHints: number;
  totalTimeSpent: number;
  unassistedGamesCount: number;
  bestUnassistedTime: number | null;
  bestTime: number;
  bestRank: number;
  averageMoves: number;
  averageHints: number;
  averageTime: number;
  gamesThisWeek: number;
  currentStreak: number;
  bestUnassistedTimeDate?: string;
  bestTimeDate?: string;
  bestRankDate?: string;
  completedDates?: string[];
}
