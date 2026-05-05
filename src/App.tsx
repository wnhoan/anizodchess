/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Player, Piece, Animal, Position, GameType, AIDifficulty } from './types';
import { Crown, Cat, RefreshCw, LayoutGrid } from 'lucide-react';
import BoardComponent from './components/GameBoard';
import RulesModal from './components/RulesModal';
import CapturedPieces from './components/CapturedPieces';
import BrandLogo from './components/BrandLogo';
import { isValidMove } from './gameLogic';
import { getAIMove } from './services/aiService';
import { playAnimalSound, playMoveSound, playCaptureSound } from './services/soundService';
import { DEN_POSITIONS } from './constants';
import { ZODIAC_INITIAL_POSITIONS } from './zodiacConstants';

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
  return Array(10).fill(null).map(() => Array(9).fill(null));
};

const createInitialArmyChessBoard = (): (Piece | null)[][] => {
  return Array(12).fill(null).map(() => Array(5).fill(null));
};

const createInitialLadderSnakeBoard = (): (Piece | null)[][] => {
  return Array(10).fill(null).map(() => Array(10).fill(null));
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

  // AI Turn Handling
  useEffect(() => {
    if (isAIVsHuman && currentPlayer === Player.BLUE) {
      const timer = setTimeout(async () => {
        const move = await getAIMove(board, currentPlayer, gameType, aiDifficulty);
        if (move) {
          handleMove(move.from, move.to);
        } else {
          setCurrentPlayer(Player.RED);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentPlayer, board]);

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
      
      // Promotion check
      const opponentDen = DEN_POSITIONS[piece.player === Player.RED ? 'BLUE' : 'RED'];
      if (to.row === opponentDen.row && to.col === opponentDen.col) {
        piece.animal = Animal.ELEPHANT;
        console.log(`Piece promoted to ${piece.animal}!`);
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

  const toggleGameType = () => {
    const types = [GameType.JUNGLE, GameType.ZODIAC, GameType.XIANGQI, GameType.LADDER_SNAKE, GameType.ARMY_CHESS];
    const currentIndex = types.indexOf(gameType);
    const newType = types[(currentIndex + 1) % types.length];
    setGameType(newType);
    setBoard(
      newType === GameType.JUNGLE ? createInitialJungleBoard() : 
      newType === GameType.ZODIAC ? createInitialZodiacBoard() : 
      newType === GameType.XIANGQI ? createInitialXiangqiBoard() :
      newType === GameType.ARMY_CHESS ? createInitialArmyChessBoard() :
      createInitialLadderSnakeBoard()
    );
    setHistory([]);
    setCapturedPieces([]);
    setCapturedHistory([]);
    setSelectedPiece(null);
    setCurrentPlayer(Player.RED);
  };

  return (
    <div className="min-h-screen bg-neutral-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl flex flex-col items-center gap-8">
        <BrandLogo gameType={gameType} />
        
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button 
            onClick={toggleGameType}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl transition-all shadow-lg active:scale-95 font-bold uppercase tracking-wider"
          >
            <LayoutGrid size={18} />
            Change Game Mode
          </button>

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
      
      <BoardComponent 
        board={board} 
        onCellClick={handleCellClick} 
        currentPlayer={currentPlayer} 
        selectedPosition={selectedPiece}
        validMoves={validMoves}
        gameType={gameType}
      />
      
      <CapturedPieces pieces={capturedPieces} />
      
      <div className="mt-8 flex gap-4 items-center">
        <div className="text-white text-lg">Current Player: <span className="font-bold">{currentPlayer}</span></div>
        <button 
          onClick={() => setIsRulesOpen(true)}
          className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-amber-300 rounded-lg border border-neutral-600"
        >
          View Rules
        </button>
        <button 
          onClick={undoMove}
          disabled={currentPlayer === Player.BLUE || history.length === 0}
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

