import { Position, Piece, Player, Animal, ANIMAL_RANKS, GameType } from './types';
import { RIVER_POSITIONS, TRAP_POSITIONS, DEN_POSITIONS } from './constants';
import { canZodiacCapture } from './zodiacConstants';

export function isRiver(pos: Position): boolean {
  return RIVER_POSITIONS.some(p => p.row === pos.row && p.col === pos.col);
}

export function isTrap(pos: Position): boolean {
  return TRAP_POSITIONS.some(p => p.row === pos.row && p.col === pos.col);
}

export function isOwnDen(pos: Position, player: Player): boolean {
  const den = DEN_POSITIONS[player === Player.RED ? 'RED' : 'BLUE'];
  return pos.row === den.row && pos.col === den.col;
}

export function canCapture(attacker: Piece, defender: Piece, attackerPos: Position, defenderPos: Position, mode: GameType = GameType.JUNGLE): boolean {
  if (mode === GameType.ZODIAC) {
    return canZodiacCapture(attacker, defender);
  }
  
  // Jungle Capture Rules
  // If defender is in their own trap (WAIT, actually it is IF defender is in OPPONENT'S trap)
  // Jungle chess rules: Any animal can capture an animal in its opponent's trap.
  // The TRAP_POSITIONS in constants are shared. 
  // Red side traps are at (0,2), (0,4), (1,3).
  // Blue side traps are at (7,3), (8,2), (8,4).
  // If a RED piece is in a BLUE trap row 7 or 8, BLUE can capture it easily.
  // Wait, the trap belongs to the side it's on.
  
  const isDefenderInOpponentTrap = (defender.player === Player.RED && defenderPos.row >= 7) || 
                                   (defender.player === Player.BLUE && defenderPos.row <= 1);
  
  if (isTrap(defenderPos) && isDefenderInOpponentTrap) {
    return true;
  }

  // Mouse Capture Rules
  if (attacker.animal === Animal.MOUSE) {
    const attackerInRiver = isRiver(attackerPos);
    const defenderInRiver = isRiver(defenderPos);

    if (attackerInRiver && !defenderInRiver) return false; // Mouse in river cannot capture animal on land
    if (defender.animal === Animal.ELEPHANT && !attackerInRiver) return true; // Mouse on land captures Elephant on land
    if (defender.animal === Animal.MOUSE) return true; // Mouse captures Mouse (if same terrain or land to land/water to water - wait, standard says land to land or water to water)
    // Actually, mouse in water can capture mouse in water. Mouse on land can capture mouse on land.
    // If one is in water and other is on land, they can't capture each other.
    if (attackerInRiver !== defenderInRiver) return false;
  }

  // Elephant cannot eat Mouse
  if (attacker.animal === Animal.ELEPHANT && defender.animal === Animal.MOUSE) return false;

  // General rank check
  return ANIMAL_RANKS[attacker.animal] >= ANIMAL_RANKS[defender.animal];
}

export function isValidMove(
  from: Position,
  to: Position,
  piece: Piece,
  board: (Piece | null)[][],
  mode: GameType = GameType.JUNGLE
): boolean {
  // Check bounds
  if (to.row < 0 || to.row >= 9 || to.col < 0 || to.col >= 7) return false;

  // Prevent entering own den
  if (isOwnDen(to, piece.player)) return false;

  // Check distance
  const rowDiff = Math.abs(from.row - to.row);
  const colDiff = Math.abs(from.col - to.col);

  const targetPiece = board[to.row][to.col];

  // Normal move
  if ((rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)) {
    // Check water restriction
    if (isRiver(to) && piece.animal !== Animal.MOUSE) return false;
    
    // Check if target exists
    if (targetPiece) {
      if (targetPiece.player === piece.player) return false; // Cannot eat own piece
      return canCapture(piece, targetPiece, from, to, mode);
    }
    
    return true;
  }

  // Jungle Specific: Lion/Tiger Jump over river logic
  if (mode === GameType.JUNGLE && (piece.animal === Animal.LION || piece.animal === Animal.TIGER)) {
    const isHorizontalJump = rowDiff === 0 && colDiff === 3;
    const isVerticalJump = rowDiff === 4 && colDiff === 0;

    if (isHorizontalJump || isVerticalJump) {
      let overRiver = true;
      let blockedByMouse = false;

      if (isHorizontalJump) {
        const step = (to.col - from.col) / 3;
        for (let c = 1; c < 3; c++) {
          const checkPos = { row: from.row, col: from.col + c * step };
          if (!isRiver(checkPos)) overRiver = false;
          if (board[checkPos.row][checkPos.col]?.animal === Animal.MOUSE) {
            blockedByMouse = true;
          }
        }
      } else if (isVerticalJump) {
        const step = (to.row - from.row) / 4;
        for (let r = 1; r < 4; r++) {
          const checkPos = { row: from.row + r * step, col: from.col };
          if (!isRiver(checkPos)) overRiver = false;
          if (board[checkPos.row][checkPos.col]?.animal === Animal.MOUSE) {
            blockedByMouse = true;
          }
        }
      }

      if (overRiver && !blockedByMouse) {
        if (targetPiece) {
          if (targetPiece.player === piece.player) return false;
          return canCapture(piece, targetPiece, from, to, mode);
        }
        return true;
      }
    }
  }
  
  return false;
}

export function getAllValidMoves(board: (Piece | null)[][], player: Player, mode: GameType): { from: Position; to: Position }[] {
  const moves: { from: Position; to: Position }[] = [];
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 7; c++) {
      const piece = board[r][c];
      if (piece && piece.player === player) {
        // Check all 4 directions + jumps
        const directions = [
          { r: 1, c: 0 }, { r: -1, c: 0 }, { r: 0, c: 1 }, { r: 0, c: -1 },
          // Special for jump animals
          { r: 4, c: 0 }, { r: -4, c: 0 }, { r: 0, c: 3 }, { r: 0, c: -3 }
        ];

        for (const dir of directions) {
          const to = { row: r + dir.r, col: c + dir.c };
          if (isValidMove({ row: r, col: c }, to, piece, board, mode)) {
            moves.push({ from: { row: r, col: c }, to });
          }
        }
      }
    }
  }
  return moves;
}

export function evaluateBoard(board: (Piece | null)[][], player: Player, mode: GameType): number {
  let score = 0;
  const opponent = player === Player.RED ? Player.BLUE : Player.RED;
  const den = DEN_POSITIONS[opponent];

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 7; c++) {
      const piece = board[r][c];
      if (piece) {
        const val = ANIMAL_RANKS[piece.animal] * 10;
        const distToDen = Math.abs(r - den.row) + Math.abs(c - den.col);
        const positionBonus = (15 - distToDen); // Closer to den is better
        
        if (piece.player === player) {
          score += val + positionBonus;
        } else {
          score -= (val + positionBonus);
        }
      }
    }
  }
  return score;
}
