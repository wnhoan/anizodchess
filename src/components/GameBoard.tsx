import React, { ElementType } from 'react';
import { Mouse, Cat, Dog, Sparkle, Zap, Crown, Circle, Bird, Flame, Smile, Move, Ghost, Rabbit, Rat } from 'lucide-react';
import { Piece, Player, Animal, Position } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { RIVER_POSITIONS, TRAP_POSITIONS, DEN_POSITIONS } from '../constants';

const AnimalIconMap: Record<Animal, ElementType> = {
  [Animal.MOUSE]: Mouse,
  [Animal.CAT]: Cat,
  [Animal.WOLF]: Dog,
  [Animal.DOG]: Dog,
  [Animal.LEOPARD]: Sparkle,
  [Animal.TIGER]: Zap,
  [Animal.LION]: Crown,
  [Animal.ELEPHANT]: Circle,
  // Zodiac
  [Animal.RAT]: Rat,
  [Animal.OX]: Ghost,
  [Animal.RABBIT]: Rabbit,
  [Animal.DRAGON]: Flame,
  [Animal.SNAKE]: Sparkle,
  [Animal.HORSE]: Move,
  [Animal.GOAT]: Circle,
  [Animal.MONKEY]: Smile,
  [Animal.ROOSTER]: Bird,
  [Animal.PIG]: Cat,
};

interface BoardProps {
  board: (Piece | null)[][];
  onCellClick: (row: number, col: number) => void;
  currentPlayer: Player;
  selectedPosition: Position | null;
  validMoves?: Position[];
}

export default function Board({ board, onCellClick, currentPlayer, selectedPosition, validMoves = [] }: BoardProps) {
  const isRiver = (r: number, c: number) => RIVER_POSITIONS.some(p => p.row === r && p.col === c);
  const isTrap = (r: number, c: number) => TRAP_POSITIONS.some(p => p.row === r && p.col === c);
  const isDen = (r: number, c: number, p: Player) => DEN_POSITIONS[p].row === r && DEN_POSITIONS[p].col === c;
  const isValidMoveDest = (r: number, c: number) => validMoves.some(p => p.row === r && p.col === c);

  return (
    <div className="bg-neutral-800 p-2 rounded-lg shadow-2xl border-4 border-amber-900 grid grid-cols-7 gap-1">
      {board.map((row, r) =>
        row.map((piece, c) => {
          let bgColor = 'bg-emerald-800'; // Forest
          if (isRiver(r, c)) bgColor = 'bg-blue-600';
          if (isTrap(r, c)) bgColor = 'bg-neutral-600';
          if (isDen(r, c, Player.RED)) bgColor = 'bg-red-900 ring-1 ring-red-400/30';
          if (isDen(r, c, Player.BLUE)) bgColor = 'bg-blue-900 ring-1 ring-blue-400/30';

          const IconComponent = piece ? AnimalIconMap[piece.animal] : null;

          return (
            <motion.div
              key={`${r}-${c}`}
              onClick={() => onCellClick(r, c)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`relative w-12 h-12 ${bgColor} flex items-center justify-center border border-emerald-950 rounded cursor-pointer ${
                  selectedPosition?.row === r && selectedPosition?.col === c ? 'ring-4 ring-yellow-400' : ''
                }`}
            >
              {!piece && isDen(r, c, Player.RED) && <Crown className="absolute opacity-20 text-red-100" size={24} />}
              {!piece && isDen(r, c, Player.BLUE) && <Crown className="absolute opacity-20 text-blue-100" size={24} />}
              
              <AnimatePresence mode="popLayout">
                {piece && IconComponent && (
                  <motion.div
                    layoutId={piece.id}
                    initial={{ opacity: 0, scale: 0.5, y: -20 }}
                    animate={{ opacity: 1, scale: piece.player === currentPlayer ? 1.1 : 1, y: 0 }}
                    exit={{ 
                      opacity: 0, 
                      scale: 2,
                      rotate: 180,
                      filter: "brightness(2) blur(8px)",
                    }}
                    transition={{ 
                      type: "spring", 
                      stiffness: 400, 
                      damping: 25,
                      exit: { duration: 0.3 }
                    }}
                    className={`${piece.player === Player.RED ? 'text-red-300' : 'text-blue-300'} ${piece.player === currentPlayer ? 'drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]' : ''} z-10`}
                  >
                    <IconComponent size={24} />
                  </motion.div>
                )}
              </AnimatePresence>

              {isValidMoveDest(r, c) && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-3 h-3 bg-amber-400 rounded-full opacity-50 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                </div>
              )}
              
              {/* Optional: Add a simple ring explosion effect that triggers when a piece is captured */}
              <AnimatePresence>
                {!piece && (
                  <motion.div
                    key="explosion"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 0 }}
                    exit={{ 
                      scale: [1, 2], 
                      opacity: [0, 0.5, 0],
                      transition: { duration: 0.4 }
                    }}
                    className="absolute inset-0 border-2 border-white rounded-full pointer-events-none"
                  />
                )}
              </AnimatePresence>
            </motion.div>
          );
        })
      )}
    </div>
  );
}
