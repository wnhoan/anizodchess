import { Position } from './types';

export const RIVER_POSITIONS: Position[] = [
  { row: 3, col: 1 }, { row: 3, col: 2 },
  { row: 4, col: 1 }, { row: 4, col: 2 },
  { row: 5, col: 1 }, { row: 5, col: 2 },
  { row: 3, col: 4 }, { row: 3, col: 5 },
  { row: 4, col: 4 }, { row: 4, col: 5 },
  { row: 5, col: 4 }, { row: 5, col: 5 },
];

export const TRAP_POSITIONS: Position[] = [
  { row: 0, col: 2 }, { row: 0, col: 4 }, { row: 1, col: 3 }, // RED traps
  { row: 7, col: 3 }, { row: 8, col: 2 }, { row: 8, col: 4 }, // BLUE traps
];

export const DEN_POSITIONS: Record<string, Position> = {
  RED: { row: 0, col: 3 },
  BLUE: { row: 8, col: 3 },
};
