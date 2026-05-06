import { Position } from './types';

export const LADDER_SNAKE_MAP: Record<number, number> = {
  // Ladders
  2: 38,
  7: 14,
  8: 31,
  15: 26,
  21: 42,
  28: 84,
  36: 44,
  51: 67,
  71: 91,
  78: 98,
  87: 94,
  
  // Snakes
  16: 6,
  46: 25,
  49: 11,
  62: 19,
  64: 60,
  74: 53,
  89: 68,
  92: 88,
  95: 75,
  99: 80
};

export const getPositionForSquare = (square: number): Position => {
  const rowFromBottom = Math.floor((square - 1) / 10);
  const colFromLeft = (square - 1) % 10;
  
  const row = 9 - rowFromBottom;
  let col = colFromLeft;
  
  // S-shape path
  if (rowFromBottom % 2 === 1) {
    col = 9 - colFromLeft;
  }
  
  return { row, col };
};

export const getSquareForPosition = (row: number, col: number): number => {
  const rowFromBottom = 9 - row;
  let colFromLeft = col;
  
  if (rowFromBottom % 2 === 1) {
    colFromLeft = 9 - col;
  }
  
  return rowFromBottom * 10 + colFromLeft + 1;
};
