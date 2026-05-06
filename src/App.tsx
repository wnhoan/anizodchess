/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Player, Piece, Animal, Position, GameType, AIDifficulty } from './types';
import { Crown, Cat, RefreshCw, LayoutGrid, Users, Cpu, Volume2, VolumeX } from 'lucide-react';
import { motion } from 'motion/react';
import BoardComponent from './components/GameBoard';
import RulesModal from './components/RulesModal';
import CapturedPieces from './components/CapturedPieces';
import BrandLogo from './components/BrandLogo';
import { isValidMove } from './gameLogic';
import { getAIMove } from './services/aiService';
import { playAnimalSound, playMoveSound, playCaptureSound, setSoundEnabled } from './services/soundService';
import { DEN_POSITIONS } from './constants';
import { ZODIAC_INITIAL_POSITIONS } from './zodiacConstants';
import { LADDER_SNAKE_MAP, getPositionForSquare, getSquareForPosition } from './snakeLadderConstants';
import Dice from './components/Dice';

// Helper to shuffle an array
const shuffle = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const JUNGLE_ANIMALS = [
  Animal.MOUSE, Animal.CAT, Animal.WOLF, Animal.DOG,
  Animal.LEOPARD, Animal.TIGER, Animal.LION, Animal.ELEPHANT
];

const ZODIAC_ANIMALS = [
  Animal.RAT, Animal.OX, Animal.TIGER, Animal.RABBIT, Animal.DRAGON, Animal.SNAKE,
  Animal.HORSE, Animal.GOAT, Animal.MONKEY, Animal.ROOSTER, Animal.DOG, Animal.PIG
];

// Initial board setups
const createInitialJungleBoard = (): (Piece | null)[][] => {
  const board: (Piece | null)[][] = Array(9).fill(null).map(() => Array(7).fill(null));
  
  // Available squares for RED (Top) rows 0-2, excluding Den (0,3)
  const redSquares: Position[] = [];
  for (let r = 0; r <= 2; r++) {
    for (let c = 0; c < 7; c++) {
      if (!(r === 0 && c === 3)) redSquares.push({ row: r, col: c });
    }
  }
  
  // Available squares for BLUE (Bottom) rows 6-8, excluding Den (8,3)
  const blueSquares: Position[] = [];
  for (let r = 6; r <= 8; r++) {
    for (let c = 0; c < 7; c++) {
      if (!(r === 8 && c === 3)) blueSquares.push({ row: r, col: c });
    }
  }

  const shuffledRedPos = shuffle(redSquares);
  const shuffledBluePos = shuffle(blueSquares);
  const redPieces = shuffle(JUNGLE_ANIMALS);
  const bluePieces = shuffle(JUNGLE_ANIMALS);

  redPieces.forEach((animal, i) => {
    const pos = shuffledRedPos[i];
    board[pos.row][pos.col] = { id: `red-${animal}-${i}`, animal, player: Player.RED };
  });

  bluePieces.forEach((animal, i) => {
    const pos = shuffledBluePos[i];
    board[pos.row][pos.col] = { id: `blue-${animal}-${i}`, animal, player: Player.BLUE };
  });

  return board;
};

const createInitialZodiacBoard = (): (Piece | null)[][] => {
  const board: (Piece | null)[][] = Array(9).fill(null).map(() => Array(7).fill(null));
  
  // Available squares for RED (Top) rows 0-1
  const redSquares: Position[] = [];
  for (let r = 0; r <= 1; r++) {
    for (let c = 0; c < 7; c++) {
      redSquares.push({ row: r, col: c });
    }
  }
  
  // Available squares for BLUE (Bottom) rows 7-8
  const blueSquares: Position[] = [];
  for (let r = 7; r <= 8; r++) {
    for (let c = 0; c < 7; c++) {
      blueSquares.push({ row: r, col: c });
    }
  }

  const shuffledRedPos = shuffle(redSquares);
  const shuffledBluePos = shuffle(blueSquares);
  const redPieces = shuffle(ZODIAC_ANIMALS);
  const bluePieces = shuffle(ZODIAC_ANIMALS);

  redPieces.forEach((animal, i) => {
    const pos = shuffledRedPos[i];
    board[pos.row][pos.col] = { id: `red-zodiac-${animal}-${i}`, animal, player: Player.RED };
  });

  bluePieces.forEach((animal, i) => {
    const pos = shuffledBluePos[i];
    board[pos.row][pos.col] = { id: `blue-zodiac-${animal}-${i}`, animal, player: Player.BLUE };
  });

  return board;
};

const createInitialXiangqiBoard = (): (Piece | null)[][] => {
  const board: (Piece | null)[][] = Array(10).fill(null).map(() => Array(9).fill(null));
  
  const setupRow = (row: number, player: Player) => {
    board[row][0] = { id: `${player}-X_CHARIOT-1`, animal: Animal.X_CHARIOT, player };
    board[row][8] = { id: `${player}-X_CHARIOT-2`, animal: Animal.X_CHARIOT, player };
    board[row][1] = { id: `${player}-X_HORSE-1`, animal: Animal.X_HORSE, player };
    board[row][7] = { id: `${player}-X_HORSE-2`, animal: Animal.X_HORSE, player };
    board[row][2] = { id: `${player}-X_ELEPHANT-1`, animal: Animal.X_ELEPHANT, player };
    board[row][6] = { id: `${player}-X_ELEPHANT-2`, animal: Animal.X_ELEPHANT, player };
    board[row][3] = { id: `${player}-X_ADVISOR-1`, animal: Animal.X_ADVISOR, player };
    board[row][5] = { id: `${player}-X_ADVISOR-2`, animal: Animal.X_ADVISOR, player };
    board[row][4] = { id: `${player}-X_GENERAL`, animal: Animal.X_GENERAL, player };
  };

  setupRow(0, Player.RED);
  setupRow(9, Player.BLUE);

  // Cannons
  board[2][1] = { id: `RED-X_CANNON-1`, animal: Animal.X_CANNON, player: Player.RED };
  board[2][7] = { id: `RED-X_CANNON-2`, animal: Animal.X_CANNON, player: Player.RED };
  board[7][1] = { id: `BLUE-X_CANNON-1`, animal: Animal.X_CANNON, player: Player.BLUE };
  board[7][7] = { id: `BLUE-X_CANNON-2`, animal: Animal.X_CANNON, player: Player.BLUE };

  // Soldiers
  for (let i = 0; i < 9; i += 2) {
    board[3][i] = { id: `RED-X_SOLDIER-${i}`, animal: Animal.X_SOLDIER, player: Player.RED };
    board[6][i] = { id: `BLUE-X_SOLDIER-${i}`, animal: Animal.X_SOLDIER, player: Player.BLUE };
  }

  return board;
};

const createInitialArmyChessBoard = (): (Piece | null)[][] => {
  const board: (Piece | null)[][] = Array(12).fill(null).map(() => Array(5).fill(null));
  
  const setupSide = (startRow: number, player: Player) => {
    const pieces = [
      Animal.A_MARSHAL, Animal.A_GENERAL, Animal.A_LIEUTENANT_GENERAL, Animal.A_LIEUTENANT_GENERAL,
      Animal.A_BRIGADIER, Animal.A_BRIGADIER, Animal.A_COLONEL, Animal.A_COLONEL,
      Animal.A_MAJOR, Animal.A_MAJOR, Animal.A_CAPTAIN, Animal.A_CAPTAIN, Animal.A_CAPTAIN,
      Animal.A_LIEUTENANT, Animal.A_LIEUTENANT, Animal.A_LIEUTENANT,
      Animal.A_ENGINEER, Animal.A_ENGINEER, Animal.A_ENGINEER,
      Animal.A_BOMB, Animal.A_BOMB, Animal.A_MINE, Animal.A_MINE, Animal.A_MINE, Animal.A_FLAG
    ];
    
    const shuffled = shuffle(pieces);
    let idx = 0;
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        const actualRow = player === Player.RED ? r : 11 - r;
        // Skip camp positions (Simplified: don't put pieces in camps at start)
        const isCamp = (r === 2 && (c === 1 || c === 3)) || (r === 3 && c === 2) || (r === 4 && (c === 1 || c === 3));
        if (!isCamp && idx < shuffled.length) {
          board[actualRow][c] = { id: `${player}-A-${idx}`, animal: shuffled[idx], player };
          idx++;
        }
      }
    }
  };

  setupSide(0, Player.RED);
  setupSide(7, Player.BLUE);

  return board;
};

const createInitialLadderSnakeBoard = (): (Piece | null)[][] => {
  const board: (Piece | null)[][] = Array(10).fill(null).map(() => Array(10).fill(null));
  board[9][0] = { id: 'RED-RUNNER', animal: Animal.DOG, player: Player.RED };
  board[9][9] = { id: 'BLUE-RUNNER', animal: Animal.CAT, player: Player.BLUE };
  return board;
};
 
const createInitialChessBoard = (): (Piece | null)[][] => {
  const board: (Piece | null)[][] = Array(8).fill(null).map(() => Array(8).fill(null));
  
  const setupPieces = (row: number, player: Player) => {
    board[row][0] = { id: `${player}-C_ROOK-1`, animal: Animal.C_ROOK, player };
    board[row][7] = { id: `${player}-C_ROOK-2`, animal: Animal.C_ROOK, player };
    board[row][1] = { id: `${player}-C_KNIGHT-1`, animal: Animal.C_KNIGHT, player };
    board[row][6] = { id: `${player}-C_KNIGHT-2`, animal: Animal.C_KNIGHT, player };
    board[row][2] = { id: `${player}-C_BISHOP-1`, animal: Animal.C_BISHOP, player };
    board[row][5] = { id: `${player}-C_BISHOP-2`, animal: Animal.C_BISHOP, player };
    board[row][3] = { id: `${player}-C_QUEEN`, animal: Animal.C_QUEEN, player };
    board[row][4] = { id: `${player}-C_KING`, animal: Animal.C_KING, player };
    
    const pawnRow = player === Player.RED ? row + 1 : row - 1;
    for (let i = 0; i < 8; i++) {
      board[pawnRow][i] = { id: `${player}-C_PAWN-${i}`, animal: Animal.C_PAWN, player };
    }
  };

  setupPieces(0, Player.RED);
  setupPieces(7, Player.BLUE);
  return board;
};

export default function App() {
  const [gameType, setGameType] = useState<GameType>(GameType.JUNGLE);
  const [aiDifficulty, setAIDifficulty] = useState<AIDifficulty>(AIDifficulty.MEDIUM);
  const [board, setBoard] = useState(createInitialJungleBoard);
  const [history, setHistory] = useState<(Piece | null)[][][]>([]);
  const [capturedPieces, setCapturedPieces] = useState<Piece[]>([]);
  const [capturedHistory, setCapturedHistory] = useState<Piece[][]>([]);
  const [currentPlayer, setCurrentPlayer] = useState(Player.RED);
  const [selectedPiece, setSelectedPiece] = useState<Position | null>(null);
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isAIVsHuman, setIsAIVsHuman] = useState(true);
  const [diceValue, setDiceValue] = useState(1);
  const [isRolling, setIsRolling] = useState(false);
  const [isSoundOn, setIsSoundOn] = useState(false);
  const [playerPositions, setPlayerPositions] = useState<Record<Player, number>>({ [Player.RED]: 1, [Player.BLUE]: 100 }); // BLUE starts at 100 or 1? Usually both start at 1. Wait, let's look at initial board.
  const [prevPlayerPositions, setPrevPlayerPositions] = useState<Record<Player, number>>({ [Player.RED]: 1, [Player.BLUE]: 1 });

  // Initialize sound state in service
  useEffect(() => {
    setSoundEnabled(isSoundOn);
  }, [isSoundOn]);

  // AI Turn Handling
  useEffect(() => {
    if (isAIVsHuman && currentPlayer === Player.BLUE) {
      const timer = setTimeout(async () => {
        if (gameType === GameType.LADDER_SNAKE) {
          handleRollDice();
        } else {
          const move = await getAIMove(board, currentPlayer, gameType, aiDifficulty);
          if (move) {
            handleMove(move.from, move.to);
          } else {
            setCurrentPlayer(Player.RED);
          }
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentPlayer, board, gameType]);

  const handleRollDice = async () => {
    if (isRolling) return;
    setIsRolling(true);
    
    // Simulate roll animation
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const roll = Math.floor(Math.random() * 9) + 1;
    setDiceValue(roll);
    setIsRolling(false);
    
    moveLadderSnake(roll);
  };

  const moveLadderSnake = async (steps: number) => {
    // Find current piece position
    let currentPos: Position | null = null;
    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 10; c++) {
        if (board[r][c]?.player === currentPlayer) {
          currentPos = { row: r, col: c };
          break;
        }
      }
    }
    
    if (!currentPos) return;
    
    const currentSquare = getSquareForPosition(currentPos.row, currentPos.col);
    setPrevPlayerPositions(prev => ({ ...prev, [currentPlayer]: currentSquare }));
    let targetSquare = currentSquare + steps;
    
    // Win condition: must reach 100
    if (targetSquare > 100) {
      targetSquare = 100 - (targetSquare - 100); // Bounce back? or just don't move? 
      // Simple logic: don't move if it exceeds 100
      // targetSquare = currentSquare; 
    }

    if (targetSquare < 1) targetSquare = 1;

    // Execute move
    await executeMoveLadderSnake(targetSquare);
  };

  const executeMoveLadderSnake = async (targetSquare: number) => {
    // Find current piece to move
    let currentPos: Position | null = null;
    let piece: Piece | null = null;
    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 10; c++) {
        if (board[r][c]?.player === currentPlayer) {
          currentPos = { row: r, col: c };
          piece = board[r][c];
          break;
        }
      }
    }
    
    if (!currentPos || !piece) return;

    const newBoard = board.map(r => [...r]);
    newBoard[currentPos.row][currentPos.col] = null;
    
    const finalPos = getPositionForSquare(targetSquare);
    
    // Kick-back logic: check if opponent is at targetSquare
    const opponent = currentPlayer === Player.RED ? Player.BLUE : Player.RED;
    let opponentPos: Position | null = null;
    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 10; c++) {
        if (newBoard[r][c]?.player === opponent) {
          const occSquare = getSquareForPosition(r, c);
          if (occSquare === targetSquare) {
            opponentPos = { row: r, col: c };
          }
        }
      }
    }

    if (opponentPos) {
      // Move opponent back to their previous position
      const backSquare = prevPlayerPositions[opponent];
      const backPos = getPositionForSquare(backSquare);
      const opponentPiece = newBoard[opponentPos.row][opponentPos.col];
      newBoard[opponentPos.row][opponentPos.col] = null;
      // Ensure we don't overwrite the current player's piece if backPos is targetPos (unlikely but safe)
      if (newBoard[backPos.row][backPos.col] === null) {
        newBoard[backPos.row][backPos.col] = opponentPiece;
      } else {
        // Find nearest empty if occupied? Usually in Snake game we just stack or kick. 
        // User said "kick back to last position".
        newBoard[backPos.row][backPos.col] = opponentPiece;
      }
      console.log(`${opponent} kicked back to ${backSquare}`);
    }
    
    newBoard[finalPos.row][finalPos.col] = piece;
    setBoard(newBoard);
    playMoveSound();

    // Check for Snake or Ladder jump
    if (LADDER_SNAKE_MAP[targetSquare]) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const jumpSquare = LADDER_SNAKE_MAP[targetSquare];
      const jumpPos = getPositionForSquare(jumpSquare);
      
      const jumpedBoard = newBoard.map(r => [...r]);
      jumpedBoard[finalPos.row][finalPos.col] = null;
      jumpedBoard[jumpPos.row][jumpPos.col] = piece;
      setBoard(jumpedBoard);
      
      if (jumpSquare > targetSquare) {
         // Ladder
         console.log("Climbed a ladder!");
      } else {
         // Snake
         console.log("Slid down a snake!");
      }
      playMoveSound();

      if (jumpSquare === 100) {
        alert(`${currentPlayer} wins!`);
      }
    } else if (targetSquare === 100) {
      alert(`${currentPlayer} wins!`);
    }

    setCurrentPlayer(currentPlayer === Player.RED ? Player.BLUE : Player.RED);
  };

  const handleMove = (from: Position, to: Position) => {
    const piece = board[from.row][from.col];
    if (piece && isValidMove(from, to, piece, board, gameType)) {
      setHistory([...history, board]);
      setCapturedHistory([...capturedHistory, capturedPieces]);
      
      const newBoard = board.map(r => [...r]);
      
      // Capture check
      const targetPiece = newBoard[to.row][to.col];
      if (targetPiece) {
        setCapturedPieces([...capturedPieces, targetPiece]);
        playCaptureSound();
      } else {
        playMoveSound();
      }
      
      // Win conditions
      if (gameType === GameType.XIANGQI && targetPiece?.animal === Animal.X_GENERAL) {
         alert(`${piece.player} Wins! The Enemy General has fallen.`);
      }
      if (gameType === GameType.CHESS && targetPiece?.animal === Animal.C_KING) {
         alert(`${piece.player} Wins! Checkmate. The King has been captured.`);
      }
      if (gameType === GameType.ARMY_CHESS && targetPiece?.animal === Animal.A_FLAG) {
         alert(`${piece.player} Wins! The Enemy Flag has been captured.`);
      }
      if (gameType === GameType.JUNGLE || gameType === GameType.ZODIAC) {
        const opponentDen = DEN_POSITIONS[piece.player === Player.RED ? 'BLUE' : 'RED'];
        if (to.row === opponentDen.row && to.col === opponentDen.col) {
          alert(`${piece.player} Wins! Enemy Den reached.`);
        }
      }
      
      newBoard[to.row][to.col] = piece;
      newBoard[from.row][from.col] = null;
      setBoard(newBoard);
      setCurrentPlayer(currentPlayer === Player.RED ? Player.BLUE : Player.RED);
    }
  };

  const undoMove = () => {
    if (history.length > 0) {
      const prevState = history[history.length - 1];
      const prevCaptured = capturedHistory[capturedHistory.length - 1];
      setBoard(prevState);
      setCapturedPieces(prevCaptured);
      setHistory(history.slice(0, -1));
      setCapturedHistory(capturedHistory.slice(0, -1));
      setCurrentPlayer(currentPlayer === Player.RED ? Player.BLUE : Player.RED);
      setSelectedPiece(null);
    }
  };

  const handleCellClick = (row: number, col: number) => {
    if (currentPlayer === Player.BLUE && isAIVsHuman) return;
    if (gameType === GameType.LADDER_SNAKE) return;

    const piece = board[row][col];
    
    if (selectedPiece) {
      if (row === selectedPiece.row && col === selectedPiece.col) {
        setSelectedPiece(null);
        return;
      }
      handleMove(selectedPiece, { row, col });
      setSelectedPiece(null);
    } else if (piece && piece.player === currentPlayer) {
      setSelectedPiece({ row, col });
      playAnimalSound(piece.animal);
    }
  };

  const validMoves = selectedPiece ? (() => {
    const moves: Position[] = [];
    const piece = board[selectedPiece.row][selectedPiece.col];
    if (!piece) return moves;

    const rows = board.length;
    const cols = board[0]?.length || 0;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (isValidMove(selectedPiece, { row: r, col: c }, piece, board, gameType)) {
          moves.push({ row: r, col: c });
        }
      }
    }
    return moves;
  })() : [];

  const resetGame = () => {
    setBoard(
      gameType === GameType.JUNGLE ? createInitialJungleBoard() : 
      gameType === GameType.ZODIAC ? createInitialZodiacBoard() : 
      gameType === GameType.XIANGQI ? createInitialXiangqiBoard() :
      gameType === GameType.ARMY_CHESS ? createInitialArmyChessBoard() :
      gameType === GameType.CHESS ? createInitialChessBoard() :
      createInitialLadderSnakeBoard()
    );
    setHistory([]);
    setCapturedPieces([]);
    setCapturedHistory([]);
    setSelectedPiece(null);
    setCurrentPlayer(Player.RED);
    setPrevPlayerPositions({ [Player.RED]: 1, [Player.BLUE]: 100 }); // Default starting spots
  };

  const toggleGameType = () => {
    const types = [GameType.JUNGLE, GameType.ZODIAC, GameType.XIANGQI, GameType.LADDER_SNAKE, GameType.ARMY_CHESS, GameType.CHESS];
    const currentIndex = types.indexOf(gameType);
    const newType = types[(currentIndex + 1) % types.length];
    setGameType(newType);
    setBoard(
      newType === GameType.JUNGLE ? createInitialJungleBoard() : 
      newType === GameType.ZODIAC ? createInitialZodiacBoard() : 
      newType === GameType.XIANGQI ? createInitialXiangqiBoard() :
      newType === GameType.ARMY_CHESS ? createInitialArmyChessBoard() :
      newType === GameType.CHESS ? createInitialChessBoard() :
      createInitialLadderSnakeBoard()
    );
    setHistory([]);
    setCapturedPieces([]);
    setCapturedHistory([]);
    setSelectedPiece(null);
    setCurrentPlayer(Player.RED);
    setPrevPlayerPositions({ [Player.RED]: 1, [Player.BLUE]: 100 });
  };

  return (
    <div className="min-h-screen bg-neutral-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl flex flex-col items-center gap-8">
        <BrandLogo gameType={gameType} />
        
        <div className="flex flex-wrap items-center justify-center gap-4">
          <div className="flex gap-2 p-1 bg-neutral-800 rounded-xl border border-neutral-700">
            <button
              onClick={() => setIsAIVsHuman(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black transition-all uppercase tracking-tighter ${
                isAIVsHuman 
                  ? 'bg-amber-500 text-neutral-900 shadow-[0_0_15px_rgba(245,158,11,0.4)]' 
                  : 'bg-transparent text-neutral-500 hover:bg-neutral-700 hover:text-neutral-300'
              }`}
            >
              <Cpu size={14} />
              VS AI
            </button>
            <button
              onClick={() => setIsAIVsHuman(false)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black transition-all uppercase tracking-tighter ${
                !isAIVsHuman 
                  ? 'bg-amber-500 text-neutral-900 shadow-[0_0_15px_rgba(245,158,11,0.4)]' 
                  : 'bg-transparent text-neutral-500 hover:bg-neutral-700 hover:text-neutral-300'
              }`}
            >
              <Users size={14} />
              PvP
            </button>
          </div>

          <button 
            onClick={toggleGameType}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl transition-all shadow-lg active:scale-95 font-bold uppercase tracking-wider"
          >
            <LayoutGrid size={18} />
            Change Game Mode
          </button>

          {isAIVsHuman && (
            <div className="flex gap-2 p-1 bg-neutral-800 rounded-xl border border-neutral-700">
              {Object.values(AIDifficulty).map((level) => (
                <button
                  key={level}
                  onClick={() => setAIDifficulty(level)}
                  className={`px-4 py-2 rounded-lg text-xs font-black transition-all uppercase tracking-tighter ${
                    aiDifficulty === level 
                      ? 'bg-amber-500 text-neutral-900 shadow-[0_0_15px_rgba(245,158,11,0.4)]' 
                      : 'bg-transparent text-neutral-500 hover:bg-neutral-700 hover:text-neutral-300'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          )}

          <button 
            onClick={() => setIsSoundOn(!isSoundOn)}
            className={`p-3 rounded-xl border transition-all ${
              isSoundOn 
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]' 
                : 'bg-neutral-800 border-neutral-700 text-neutral-500 hover:bg-neutral-700'
            }`}
            title={isSoundOn ? "Disable Sound" : "Enable Sound"}
          >
            {isSoundOn ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
        </div>
      </div>
      
      {/* Turn Indicator */}
      <div className={`mt-8 mb-6 px-10 py-4 rounded-2xl font-black text-xl tracking-[0.2em] uppercase shadow-2xl border-2 flex items-center gap-4 transition-all duration-500 ${
        currentPlayer === Player.RED 
          ? 'bg-red-950/50 text-red-200 border-red-500/50' 
          : 'bg-blue-950/50 text-blue-200 border-blue-500/50'
      }`}>
        <div className={`w-3 h-3 rounded-full ${currentPlayer === Player.RED ? 'bg-red-500' : 'bg-blue-500'}`} />
        {currentPlayer === Player.RED ? 'RED (Top)' : 'BLUE (Bottom)'}'s Turn
      </div>
      
      {gameType === GameType.LADDER_SNAKE && (
        <div className="mb-8">
          <Dice 
            value={diceValue} 
            isRolling={isRolling} 
            onRoll={handleRollDice} 
            disabled={isAIVsHuman && currentPlayer === Player.BLUE}
          />
        </div>
      )}

      <motion.div 
        animate={{ rotate: gameType === GameType.LADDER_SNAKE && currentPlayer === Player.BLUE ? 180 : 0 }}
        transition={{ duration: 0.8, type: 'spring', stiffness: 50 }}
        className="relative shadow-[0_0_100px_rgba(0,0,0,0.5)] rounded-3xl overflow-hidden"
      >
        <BoardComponent 
          board={board} 
          onCellClick={handleCellClick} 
          currentPlayer={currentPlayer} 
          selectedPosition={selectedPiece}
          validMoves={validMoves}
          gameType={gameType}
        />
      </motion.div>
      
      <CapturedPieces pieces={capturedPieces} />
      
      <div className="mt-8 flex gap-4 items-center">
        <div className="text-white text-lg">Current Player: <span className="font-bold">{currentPlayer}</span></div>
        <button 
          onClick={resetGame}
          className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-amber-300 rounded-lg border border-neutral-600"
        >
          New Game
        </button>
        <button 
          onClick={() => setIsRulesOpen(true)}
          className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-amber-300 rounded-lg border border-neutral-600"
        >
          View Rules
        </button>
        <button 
          onClick={undoMove}
          disabled={history.length === 0 || (isAIVsHuman && currentPlayer === Player.BLUE)}
          className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-amber-300 rounded-lg border border-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Undo Move
        </button>
      </div>
      
      <RulesModal 
        isOpen={isRulesOpen} 
        onClose={() => setIsRulesOpen(false)} 
        mode={gameType}
      />
    </div>
  );
}

