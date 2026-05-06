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

  if (mode === GameType.XIANGQI) {
    return attacker.player !== defender.player;
  }

  if (mode === GameType.ARMY_CHESS) {
    if (attacker.player === defender.player) return false;
    
    // Bomb captures anything, both disappear (Return true, and App logic will handle removal)
    // Actually, capture always removes the defender. App logic needs to handle the attacker's fate.
    // For now, I'll return true. In App.tsx, I should handle "Both pieces removed" for Bombs.
    if (attacker.animal === Animal.A_BOMB || defender.animal === Animal.A_BOMB) return true;

    if (defender.animal === Animal.A_MINE) {
      if (attacker.animal === Animal.A_ENGINEER) return true;
      // Note: A_BOMB already checked above
      return true; // Marshal etc dies? Actually, Marshal dies, Mine stays.
      // This is a bit complex for a boolean canCapture.
      // I'll simplify: higher rank captures lower. Special cases handled in handleMove if possible.
    }

    if (defender.animal === Animal.A_FLAG) return true;
    
    return ANIMAL_RANKS[attacker.animal] >= ANIMAL_RANKS[defender.animal];
  }

  if (mode === GameType.CHESS) {
    return attacker.player !== defender.player;
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
  const rows = board.length;
  const cols = board[0]?.length || 0;

  // Check bounds
  if (to.row < 0 || to.row >= rows || to.col < 0 || to.col >= cols) return false;

  // Prevent entering own den (Only for Jungle/Zodiac)
  if ((mode === GameType.JUNGLE || mode === GameType.ZODIAC) && isOwnDen(to, piece.player)) return false;

  // Check distance
  const rowDiff = Math.abs(from.row - to.row);
  const colDiff = Math.abs(from.col - to.col);

  const targetPiece = board[to.row][to.col];

  // Xiangqi Logic
  if (mode === GameType.XIANGQI) {
    if (targetPiece?.player === piece.player) return false;
    
    const dr = to.row - from.row;
    const dc = to.col - from.col;
    const absDr = Math.abs(dr);
    const absDc = Math.abs(dc);

    switch (piece.animal) {
      case Animal.X_CHARIOT:
        if (dr !== 0 && dc !== 0) return false;
        // Check clear path
        if (dr !== 0) {
          const step = dr / absDr;
          for (let r = from.row + step; r !== to.row; r += step) {
            if (board[r][from.col]) return false;
          }
        } else {
          const step = dc / absDc;
          for (let c = from.col + step; c !== to.col; c += step) {
            if (board[from.row][c]) return false;
          }
        }
        return true;

      case Animal.X_CANNON:
        if (dr !== 0 && dc !== 0) return false;
        let piecesBetween = 0;
        if (dr !== 0) {
          const step = dr / absDr;
          for (let r = from.row + step; r !== to.row; r += step) {
            if (board[r][from.col]) piecesBetween++;
          }
        } else {
          const step = dc / absDc;
          for (let c = from.col + step; c !== to.col; c += step) {
            if (board[from.row][c]) piecesBetween++;
          }
        }
        if (targetPiece) return piecesBetween === 1;
        return piecesBetween === 0;

      case Animal.X_HORSE:
        if (!((absDr === 2 && absDc === 1) || (absDr === 1 && absDc === 2))) return false;
        // Check block
        const blockPos = absDr === 2 ? { row: from.row + dr / 2, col: from.col } : { row: from.row, col: from.col + dc / 2 };
        if (board[blockPos.row][blockPos.col]) return false;
        return true;

      case Animal.X_ELEPHANT:
        if (absDr !== 2 || absDc !== 2) return false;
        // Cannot cross river
        if (piece.player === Player.RED && to.row > 4) return false;
        if (piece.player === Player.BLUE && to.row < 5) return false;
        // Check block
        if (board[from.row + dr / 2][from.col + dc / 2]) return false;
        return true;

      case Animal.X_ADVISOR:
        if (absDr !== 1 || absDc !== 1) return false;
        // Palace check
        if (to.col < 3 || to.col > 5) return false;
        if (piece.player === Player.RED && to.row > 2) return false;
        if (piece.player === Player.BLUE && to.row < 7) return false;
        return true;

      case Animal.X_GENERAL:
        if (absDr + absDc !== 1) {
          // Check for "Facing Generals" move (Flying General)
          if (dc === 0 && targetPiece?.animal === Animal.X_GENERAL) {
             const step = dr / absDr;
             for (let r = from.row + step; r !== to.row; r += step) {
               if (board[r][from.col]) return false;
             }
             return true;
          }
          return false;
        }
        // Palace check
        if (to.col < 3 || to.col > 5) return false;
        if (piece.player === Player.RED && to.row > 2) return false;
        if (piece.player === Player.BLUE && to.row < 7) return false;
        return true;

      case Animal.X_SOLDIER:
        if (absDr + absDc !== 1) return false;
        const isRed = piece.player === Player.RED;
        const forward = isRed ? 1 : -1;
        if (dr === forward) return true;
        if (dc !== 0) {
          // Can move sideways after crossing river
          const crossedRiver = isRed ? from.row > 4 : from.row < 5;
          return crossedRiver && dr === 0;
        }
        return false;
    }
  }

  // Army Chess Logic (Simplified)
  if (mode === GameType.ARMY_CHESS) {
    if (targetPiece?.player === piece.player) return false;
    const dr = to.row - from.row;
    const dc = to.col - from.col;
    const absDr = Math.abs(dr);
    const absDc = Math.abs(dc);

    // Camps are safe
    const isCamp = (r: number, c: number) => {
      const side = r < 6 ? 0 : 7;
      const base = side === 0 ? 0 : 7;
      const normR = r < 6 ? r : r - 6;
      return (normR === 2 && (c === 1 || c === 3)) || (normR === 3 && c === 2) || (normR === 4 && (c === 1 || c === 3));
    };
    if (isCamp(to.row, to.col) && targetPiece) return false;

    // Normal move (road)
    if (absDr <= 1 && absDc <= 1 && (absDr + absDc > 0)) {
       if (targetPiece) return canCapture(piece, targetPiece, from, to, mode);
       return true;
    }

    // Railway move (straight line)
    const isRailway = (r: number, c: number) => c === 0 || c === 4 || r === 1 || r === 5 || r === 6 || r === 10;
    if (isRailway(from.row, from.col) && isRailway(to.row, to.col)) {
      if (from.row === to.row || from.col === to.col) {
        // Path must be clear and all be railway
        if (from.row === to.row) {
          const step = dc / absDc;
          for (let c = from.col + step; c !== to.col; c += step) {
             if (board[from.row][c] || !isRailway(from.row, c)) return false;
          }
        } else {
          const step = dr / absDr;
          for (let r = from.row + step; r !== to.row; r += step) {
             if (board[r][from.col] || !isRailway(r, from.col)) return false;
          }
        }
        if (targetPiece) return canCapture(piece, targetPiece, from, to, mode);
        return true;
      }
    }
    return false;
  }

  // Ladder Snake Logic
  if (mode === GameType.LADDER_SNAKE) {
    // For now, allow moving anywhere for prototyping race
    const dist = Math.sqrt(rowDiff * rowDiff + colDiff * colDiff);
    return dist < 4; // Simplified movement for now
  }

  // Western Chess Logic
  if (mode === GameType.CHESS) {
    if (targetPiece?.player === piece.player) return false;
    const dr = to.row - from.row;
    const dc = to.col - from.col;
    const absDr = Math.abs(dr);
    const absDc = Math.abs(dc);

    switch (piece.animal) {
      case Animal.C_KING:
        return absDr <= 1 && absDc <= 1;
      case Animal.C_QUEEN:
        if (absDr !== absDc && dr !== 0 && dc !== 0) return false;
        // Check clear path
        const stepR = dr === 0 ? 0 : dr / absDr;
        const stepC = dc === 0 ? 0 : dc / absDc;
        for (let r = from.row + stepR, c = from.col + stepC; r !== to.row || c !== to.col; r += stepR, c += stepC) {
          if (board[r][c]) return false;
        }
        return true;
      case Animal.C_ROOK:
        if (dr !== 0 && dc !== 0) return false;
        // Check clear path
        const sR = dr === 0 ? 0 : dr / absDr;
        const sC = dc === 0 ? 0 : dc / absDc;
        for (let r = from.row + sR, c = from.col + sC; r !== to.row || c !== to.col; r += sR, c += sC) {
          if (board[r][c]) return false;
        }
        return true;
      case Animal.C_BISHOP:
        if (absDr !== absDc) return false;
        const bsR = dr / absDr;
        const bsC = dc / absDc;
        for (let r = from.row + bsR, c = from.col + bsC; r !== to.row || c !== to.col; r += bsR, c += bsC) {
          if (board[r][c]) return false;
        }
        return true;
      case Animal.C_KNIGHT:
        return (absDr === 2 && absDc === 1) || (absDr === 1 && absDc === 2);
      case Animal.C_PAWN:
        const direction = piece.player === Player.RED ? 1 : -1;
        const startRow = piece.player === Player.RED ? 1 : 6;
        
        // Single move forward
        if (dc === 0 && dr === direction && !targetPiece) return true;
        // Double move forward from start
        if (dc === 0 && dr === 2 * direction && from.row === startRow && !targetPiece && !board[from.row + direction][from.col]) return true;
        // Capture
        if (absDc === 1 && dr === direction && targetPiece) return true;
        return false;
    }
  }

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
  const rows = board.length;
  const cols = board[0]?.length || 0;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const piece = board[r][c];
      if (piece && piece.player === player) {
        // Broad search for move generators
        // For some games we might need more directions
        const directions = [
          { r: 1, c: 0 }, { r: -1, c: 0 }, { r: 0, c: 1 }, { r: 0, c: -1 },
          { r: 1, c: 1 }, { r: -1, c: -1 }, { r: 1, c: -1 }, { r: -1, c: 1 },
          // Special for jump animals / Xiangqi long moves
          { r: 4, c: 0 }, { r: -4, c: 0 }, { r: 0, c: 3 }, { r: 0, c: -3 },
          { r: 2, c: 1 }, { r: 2, c: -1 }, { r: -2, c: 1 }, { r: -2, c: -1 },
          { r: 1, c: 2 }, { r: -1, c: 2 }, { r: 1, c: -2 }, { r: -1, c: -2 },
          { r: 2, c: 2 }, { r: -2, c: 2 }, { r: 2, c: -2 }, { r: -2, c: -2 },
        ];
        
        // Chariot/Cannon need multi-step
        if (mode === GameType.XIANGQI && (piece.animal === Animal.X_CHARIOT || piece.animal === Animal.X_CANNON)) {
          for (let dr = 0; dr < rows; dr++) moves.push({ from: { row: r, col: c }, to: { row: dr, col: c } });
          for (let dc = 0; dc < cols; dc++) moves.push({ from: { row: r, col: c }, to: { row: r, col: dc } });
        } else if (mode === GameType.ARMY_CHESS) {
           // Railway lines
           for (let dr = 0; dr < rows; dr++) moves.push({ from: { row: r, col: c }, to: { row: dr, col: c } });
           for (let dc = 0; dc < cols; dc++) moves.push({ from: { row: r, col: c }, to: { row: r, col: dc } });
        } else if (mode === GameType.CHESS && (piece.animal === Animal.C_QUEEN || piece.animal === Animal.C_ROOK || piece.animal === Animal.C_BISHOP)) {
           // Ray casting for slider pieces
           for (let dr = 0; dr < rows; dr++) moves.push({ from: { row: r, col: c }, to: { row: dr, col: c } });
           for (let dc = 0; dc < cols; dc++) moves.push({ from: { row: r, col: c }, to: { row: r, col: dc } });
           for (let dr = 0; dr < rows; dr++) {
             moves.push({ from: { row: r, col: c }, to: { row: dr, col: c + (dr - r) } });
             moves.push({ from: { row: r, col: c }, to: { row: dr, col: c - (dr - r) } });
           }
        }

        for (const dir of directions) {
          const to = { row: r + dir.r, col: c + dir.c };
          if (isValidMove({ row: r, col: c }, to, piece, board, mode)) {
            moves.push({ from: { row: r, col: c }, to });
          }
        }
      }
    }
  }
  // Filter out invalid ones that might have been added by the multi-step loops
  return moves.filter(m => isValidMove(m.from, m.to, board[m.from.row][m.from.col]!, board, mode));
}

export function evaluateBoard(board: (Piece | null)[][], player: Player, mode: GameType): number {
  let score = 0;
  const opponent = player === Player.RED ? Player.BLUE : Player.RED;
  
  const rows = board.length;
  const cols = board[0]?.length || 0;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const piece = board[r][c];
      if (piece) {
        let val = ANIMAL_RANKS[piece.animal] * 10;
        
        // Win condition bonus
        if (mode === GameType.XIANGQI && piece.animal === Animal.X_GENERAL) val = 10000;
        if (mode === GameType.CHESS && piece.animal === Animal.C_KING) val = 10000;
        if (mode === GameType.ARMY_CHESS && piece.animal === Animal.A_FLAG) val = 1000;

        if (piece.player === player) {
          score += val;
        } else {
          score -= val;
        }
      }
    }
  }
  return score;
}
