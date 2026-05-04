import { Animal, Player, Piece } from './types';

export const ZODIAC_RANKS: Partial<Record<Animal, number>> = {
  [Animal.RAT]: 1,
  [Animal.OX]: 2,
  [Animal.TIGER]: 3,
  [Animal.RABBIT]: 4,
  [Animal.DRAGON]: 5,
  [Animal.SNAKE]: 6,
  [Animal.HORSE]: 7,
  [Animal.GOAT]: 8,
  [Animal.MONKEY]: 9,
  [Animal.ROOSTER]: 10,
  [Animal.DOG]: 11,
  [Animal.PIG]: 12,
};

// Map ranking in cyclic order or simple rank
export function canZodiacCapture(attacker: Piece, defender: Piece): boolean {
  const r1 = ZODIAC_RANKS[attacker.animal] || 0;
  const r2 = ZODIAC_RANKS[defender.animal] || 0;
  
  // Rule: Rat (1) eats Pig (12)
  if (r1 === 1 && r2 === 12) return true;
  // Pig (12) cannot eat Rat (1)
  if (r1 === 12 && r2 === 1) return false;
  
  return r1 >= r2;
}

export const ZODIAC_INITIAL_POSITIONS = [
  // RED Pieces (Top)
  { row: 0, col: 0, animal: Animal.PIG, player: Player.RED },
  { row: 0, col: 1, animal: Animal.DOG, player: Player.RED },
  { row: 0, col: 2, animal: Animal.ROOSTER, player: Player.RED },
  { row: 0, col: 3, animal: Animal.MONKEY, player: Player.RED },
  { row: 0, col: 4, animal: Animal.GOAT, player: Player.RED },
  { row: 0, col: 5, animal: Animal.HORSE, player: Player.RED },
  { row: 0, col: 6, animal: Animal.SNAKE, player: Player.RED },
  { row: 1, col: 1, animal: Animal.DRAGON, player: Player.RED },
  { row: 1, col: 2, animal: Animal.RABBIT, player: Player.RED },
  { row: 1, col: 3, animal: Animal.TIGER, player: Player.RED },
  { row: 1, col: 4, animal: Animal.OX, player: Player.RED },
  { row: 1, col: 5, animal: Animal.RAT, player: Player.RED },

  // BLUE Pieces (Bottom)
  { row: 8, col: 0, animal: Animal.PIG, player: Player.BLUE },
  { row: 8, col: 1, animal: Animal.DOG, player: Player.BLUE },
  { row: 8, col: 2, animal: Animal.ROOSTER, player: Player.BLUE },
  { row: 8, col: 3, animal: Animal.MONKEY, player: Player.BLUE },
  { row: 8, col: 4, animal: Animal.GOAT, player: Player.BLUE },
  { row: 8, col: 5, animal: Animal.HORSE, player: Player.BLUE },
  { row: 8, col: 6, animal: Animal.SNAKE, player: Player.BLUE },
  { row: 7, col: 1, animal: Animal.DRAGON, player: Player.BLUE },
  { row: 7, col: 2, animal: Animal.RABBIT, player: Player.BLUE },
  { row: 7, col: 3, animal: Animal.TIGER, player: Player.BLUE },
  { row: 7, col: 4, animal: Animal.OX, player: Player.BLUE },
  { row: 7, col: 5, animal: Animal.RAT, player: Player.BLUE },
];
