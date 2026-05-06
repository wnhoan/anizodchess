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
  
  // Xiangqi Pieces
  X_GENERAL = 'X_GENERAL',
  X_ADVISOR = 'X_ADVISOR',
  X_ELEPHANT = 'X_ELEPHANT',
  X_HORSE = 'X_HORSE',
  X_CHARIOT = 'X_CHARIOT',
  X_CANNON = 'X_CANNON',
  X_SOLDIER = 'X_SOLDIER',

  // Army Chess Pieces
  A_MARSHAL = 'A_MARSHAL',
  A_GENERAL = 'A_GENERAL',
  A_LIEUTENANT_GENERAL = 'A_LIEUTENANT_GENERAL',
  A_BRIGADIER = 'A_BRIGADIER',
  A_COLONEL = 'A_COLONEL',
  A_MAJOR = 'A_MAJOR',
  A_CAPTAIN = 'A_CAPTAIN',
  A_LIEUTENANT = 'A_LIEUTENANT',
  A_ENGINEER = 'A_ENGINEER',
  A_BOMB = 'A_BOMB',
  A_MINE = 'A_MINE',
  A_FLAG = 'A_FLAG',
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
  [Animal.DRAGON]: 11,

  // Xiangqi Ranks (Used for capturing/AI evaluation)
  [Animal.X_GENERAL]: 100,
  [Animal.X_ADVISOR]: 2,
  [Animal.X_ELEPHANT]: 2,
  [Animal.X_HORSE]: 4,
  [Animal.X_CHARIOT]: 9,
  [Animal.X_CANNON]: 4.5,
  [Animal.X_SOLDIER]: 1,

  // Army Chess Ranks (Higher captures lower)
  [Animal.A_MARSHAL]: 9,
  [Animal.A_GENERAL]: 8,
  [Animal.A_LIEUTENANT_GENERAL]: 7,
  [Animal.A_BRIGADIER]: 6,
  [Animal.A_COLONEL]: 5,
  [Animal.A_MAJOR]: 4,
  [Animal.A_CAPTAIN]: 3,
  [Animal.A_LIEUTENANT]: 2,
  [Animal.A_ENGINEER]: 1,
  [Animal.A_BOMB]: 0, // Captures anything but dies
  [Animal.A_MINE]: 0, // Higher captures except engineer/bomb
  [Animal.A_FLAG]: 0,
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
