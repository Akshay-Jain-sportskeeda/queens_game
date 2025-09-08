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
  moveCount: number;
  hintCount: number;
  startTime: number;
  gameCompleted: boolean;
}

export interface CellProps {
  row: number;
  col: number;
  value: string;
  region: number;
  isPrefilled: boolean;
  hasConflict: boolean;
  conflictType?: string;
  onClick: (row: number, col: number) => void;
}

export interface HintData {
  type: 'wrong-football' | 'region-x' | 'row-x' | 'column-x' | 'adjacent-x' | 'valid-placement';
  data: any;
}

export interface WinStats {
  moves: number;
  hints: number;
  time: string;
}
