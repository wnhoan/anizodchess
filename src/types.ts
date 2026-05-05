export const BOARD_ROWS = 9;
export const BOARD_COLS = 7;

export enum Player {
  RED = 'RED',
  BLUE = 'BLUE',
}

export enum GameType {
  JUNGLE = 'JUNGLE',
  ZODIAC = 'ZODIAC',
  XIANGQI = 'XIANGQI',
  LADDER_SNAKE = 'LADDER_SNAKE',
  ARMY_CHESS = 'ARMY_CHESS',
}

export enum AIDifficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
}

export enum Animal {
  // Jungle Animals
  MOUSE = 'MOUSE',
  CAT = 'CAT',
  WOLF = 'WOLF',
  DOG = 'DOG',
  LEOPARD = 'LEOPARD',
  TIGER = 'TIGER',
  LION = 'LION',
  ELEPHANT = 'ELEPHANT',
  
  // Zodiac Specific (Some overlap with above)
  RAT = 'RAT',
  OX = 'OX',
  RABBIT = 'RABBIT',
  DRAGON = 'DRAGON',
  SNAKE = 'SNAKE',
  HORSE = 'HORSE',
  GOAT = 'GOAT',
  MONKEY = 'MONKEY',
  ROOSTER = 'ROOSTER',
  PIG = 'PIG',
}

export const ANIMAL_RANKS: Record<Animal, number> = {
  [Animal.MOUSE]: 1,
  [Animal.RAT]: 1,
  [Animal.CAT]: 2,
  [Animal.RABBIT]: 2,
  [Animal.WOLF]: 3,
  [Animal.DOG]: 4,
  [Animal.LEOPARD]: 5,
  [Animal.TIGER]: 6,
  [Animal.LION]: 7,
  [Animal.ELEPHANT]: 8,
  
  // Zodiac Logic Ranks (1-12)
  [Animal.OX]: 2,
  [Animal.SNAKE]: 6,
  [Animal.HORSE]: 7,
  [Animal.GOAT]: 8,
  [Animal.MONKEY]: 9,
  [Animal.ROOSTER]: 10,
  [Animal.PIG]: 12,
  [Animal.DRAGON]: 11, // Dragon is high rank in Zodiac
};

export interface Piece {
  id: string;
  animal: Animal;
  player: Player;
}

export interface Position {
  row: number;
  col: number;
}
