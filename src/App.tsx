/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Player, Piece, Animal, Position, GameMode, AIDifficulty } from './types';
import { Crown, Cat, RefreshCw, LayoutGrid } from 'lucide-react';
import BoardComponent from './components/GameBoard';
import RulesModal from './components/RulesModal';
import CapturedPieces from './components/CapturedPieces';
import { isValidMove } from './gameLogic';
import { getAIMove } from './services/aiService';
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

export default function App() {
  const [gameMode, setGameMode] = useState<GameMode>(GameMode.JUNGLE);
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
        const move = await getAIMove(board, currentPlayer, gameMode, aiDifficulty);
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
    if (piece && isValidMove(from, to, piece, board, gameMode)) {
      setHistory([...history, board]);
      setCapturedHistory([...capturedHistory, capturedPieces]);
      
      const newBoard = board.map(r => [...r]);
      
      // Capture check
      const targetPiece = newBoard[to.row][to.col];
      if (targetPiece) {
        setCapturedPieces([...capturedPieces, targetPiece]);
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
    }
  };

  const validMoves = selectedPiece ? (() => {
    const moves: Position[] = [];
    const piece = board[selectedPiece.row][selectedPiece.col];
    if (!piece) return moves;

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 7; c++) {
        if (isValidMove(selectedPiece, { row: r, col: c }, piece, board, gameMode)) {
          moves.push({ row: r, col: c });
        }
      }
    }
    return moves;
  })() : [];

  const toggleGameMode = () => {
    const newMode = gameMode === GameMode.JUNGLE ? GameMode.ZODIAC : GameMode.JUNGLE;
    setGameMode(newMode);
    setBoard(newMode === GameMode.JUNGLE ? createInitialJungleBoard() : createInitialZodiacBoard());
    setHistory([]);
    setCapturedPieces([]);
    setCapturedHistory([]);
    setSelectedPiece(null);
    setCurrentPlayer(Player.RED);
  };

  return (
    <div className="min-h-screen bg-neutral-900 flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-amber-500 rounded-2xl shadow-[0_0_20px_rgba(245,158,11,0.4)]">
            <Crown className="text-neutral-900 w-10 h-10" />
          </div>
          <h1 className="text-4xl font-bold text-amber-500 font-sans tracking-tight">
            {gameMode === GameMode.JUNGLE ? 'Jungle Chess' : 'Zodiac Chess'}
          </h1>
        </div>
        
        <button 
          onClick={toggleGameMode}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-full transition-all shadow-lg active:scale-95"
        >
          {gameMode === GameMode.JUNGLE ? <LayoutGrid size={18} /> : <RefreshCw size={18} />}
          Switch to {gameMode === GameMode.JUNGLE ? 'Zodiac Chess' : 'Jungle Chess'}
        </button>

        <div className="mt-4 flex gap-2">
          {Object.values(AIDifficulty).map((level) => (
            <button
              key={level}
              onClick={() => setAIDifficulty(level)}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                aiDifficulty === level 
                  ? 'bg-amber-500 text-neutral-900 shadow-[0_0_10px_rgba(245,158,11,0.5)]' 
                  : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>
      
      <BoardComponent 
        board={board} 
        onCellClick={handleCellClick} 
        currentPlayer={currentPlayer} 
        selectedPosition={selectedPiece}
        validMoves={validMoves}
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
        mode={gameMode}
      />
    </div>
  );
}

