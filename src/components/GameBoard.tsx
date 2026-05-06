import React, { ElementType } from 'react';
import { 
  Mouse, Cat, Dog, Sparkle, Zap, Crown, Circle, Bird, Flame, Smile, Move, Ghost, Rabbit, Rat,
  Flag, Shield, Swords, Target, User, Users, Anchor, Bomb, Construction, Trophy,
  CircleDot
} from 'lucide-react';
import { Piece, Player, Animal, Position, GameType } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { RIVER_POSITIONS, TRAP_POSITIONS, DEN_POSITIONS } from '../constants';
import { getSquareForPosition, LADDER_SNAKE_MAP } from '../snakeLadderConstants';

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

  // Xiangqi Pieces
  [Animal.X_GENERAL]: Trophy,
  [Animal.X_ADVISOR]: User,
  [Animal.X_ELEPHANT]: CircleDot,
  [Animal.X_HORSE]: Move,
  [Animal.X_CHARIOT]: Swords,
  [Animal.X_CANNON]: Target,
  [Animal.X_SOLDIER]: Users,

  // Army Chess Pieces
  [Animal.A_MARSHAL]: Crown,
  [Animal.A_GENERAL]: Swords,
  [Animal.A_LIEUTENANT_GENERAL]: Shield,
  [Animal.A_BRIGADIER]: Anchor,
  [Animal.A_COLONEL]: Target,
  [Animal.A_MAJOR]: User,
  [Animal.A_CAPTAIN]: Users,
  [Animal.A_LIEUTENANT]: User,
  [Animal.A_ENGINEER]: Construction,
  [Animal.A_BOMB]: Bomb,
  [Animal.A_MINE]: Zap,
  [Animal.A_FLAG]: Flag,
};

interface BoardProps {
  board: (Piece | null)[][];
  onCellClick: (row: number, col: number) => void;
  currentPlayer: Player;
  selectedPosition: Position | null;
  validMoves?: Position[];
  gameType: GameType;
}

export default function Board({ board, onCellClick, currentPlayer, selectedPosition, validMoves = [], gameType }: BoardProps) {
  const isRiver = (r: number, c: number) => RIVER_POSITIONS.some(p => p.row === r && p.col === c);
  const isTrap = (r: number, c: number) => TRAP_POSITIONS.some(p => p.row === r && p.col === c);
  const isDen = (r: number, c: number, p: Player) => DEN_POSITIONS[p].row === r && DEN_POSITIONS[p].col === c;
  const isValidMoveDest = (r: number, c: number) => validMoves.some(p => p.row === r && p.col === c);

  const rows = board.length;
  const cols = board[0]?.length || 0;

  return (
    <div 
      className="bg-neutral-800 p-2 rounded-lg shadow-2xl border-4 border-amber-900 grid gap-1"
      style={{
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`
      }}
    >
      {board.map((row, r) =>
        row.map((piece, c) => {
          let bgColor = 'bg-emerald-800'; 
          
          if (gameType === GameType.JUNGLE || gameType === GameType.ZODIAC) {
            if (isRiver(r, c)) bgColor = 'bg-blue-600/80 backdrop-blur-sm';
            else if (isTrap(r, c)) bgColor = 'bg-neutral-600 border-2 border-dashed border-neutral-400/30';
            else if (isDen(r, c, Player.RED)) bgColor = 'bg-red-950 ring-2 ring-red-500/50 shadow-[inset_0_0_20px_rgba(239,68,68,0.3)]';
            else if (isDen(r, c, Player.BLUE)) bgColor = 'bg-blue-950 ring-2 ring-blue-500/50 shadow-[inset_0_0_20px_rgba(59,130,246,0.3)]';
          } else if (gameType === GameType.XIANGQI) {
            bgColor = 'bg-[#f4d6a0] border border-[#8b4513]/30'; // Traditional wood/paper color
            
            // River (The Chu River and Han Border)
            if (r === 4 || r === 5) {
               bgColor = 'bg-[#e0c080] border-y-2 border-[#8b4513]/20';
            }
            
            // Palaces (3x3 area in center of each side)
            const isRedPalace = r >= 0 && r <= 2 && c >= 3 && c <= 5;
            const isBluePalace = r >= 7 && r <= 9 && c >= 3 && c <= 5;
            if (isRedPalace || isBluePalace) {
              bgColor = 'bg-[#eec080] border-2 border-[#8b4513]/10';
            }
          } else if (gameType === GameType.ARMY_CHESS) {
            bgColor = 'bg-stone-700 border border-stone-600';
            
            // Camps (Standard positions for Luzhanqi)
            const isCamp = (side: number) => {
              const base = side === 0 ? 0 : 7;
              return (r === base + 2 && (c === 1 || c === 3)) ||
                     (r === base + 3 && c === 2) ||
                     (r === base + 4 && (c === 1 || c === 3));
            };
            
            if (isCamp(0) || isCamp(1)) {
              bgColor = 'bg-stone-800 rounded-full border-2 border-stone-500 shadow-inner';
            }
            
            // Headquarters
            const isHQ = (r === 0 && (c === 1 || c === 3)) || (r === 11 && (c === 1 || c === 3));
            if (isHQ) {
              bgColor = 'bg-stone-900 border-2 border-amber-500/30 ring-1 ring-amber-500/20';
            }
            
            // Railways (Simplified)
            const isRailway = c === 0 || c === 4 || r === 1 || r === 5 || r === 6 || r === 10;
            if (isRailway && !isHQ && !isCamp(0) && !isCamp(1)) {
              bgColor = 'bg-stone-600/50 border border-stone-500/30';
            }
          } else if (gameType === GameType.LADDER_SNAKE) {
            const isEven = (r + c) % 2 === 0;
            bgColor = isEven ? 'bg-amber-100' : 'bg-red-100';
            
            // Decorative accents for ladder/snake board
            if (r % 3 === 0 && c % 3 === 0) bgColor += ' ring-1 ring-inset ring-amber-500/10';
          }

          const IconComponent = piece ? AnimalIconMap[piece.animal] : null;
          const squareNumber = gameType === GameType.LADDER_SNAKE ? getSquareForPosition(r, c) : null;
          const isShortcut = squareNumber && LADDER_SNAKE_MAP[squareNumber];
          const isUp = isShortcut && LADDER_SNAKE_MAP[squareNumber]! > squareNumber!;

          return (
            <motion.div
              key={`${r}-${c}`}
              onClick={() => onCellClick(r, c)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`relative w-10 h-10 md:w-12 md:h-12 ${bgColor} flex items-center justify-center rounded cursor-pointer ${
                  selectedPosition?.row === r && selectedPosition?.col === c ? 'ring-4 ring-yellow-400' : ''
                }`}
            >
              {/* Square Numbers for Snakes & Ladders */}
              {squareNumber && (
                <span className="absolute top-0.5 left-1 text-[8px] font-mono font-bold text-neutral-800/40">
                  {squareNumber}
                </span>
              )}

              {/* Shortcut Hints */}
              {isShortcut && (
                <div className={`absolute bottom-0.5 right-1 ${isUp ? 'text-emerald-600' : 'text-red-500'} opacity-60`}>
                  {isUp ? <Move size={10} className="-rotate-45" /> : <Move size={10} className="rotate-135" />}
                </div>
              )}
              
              {/* Special markers */}
              {gameType === GameType.JUNGLE && !piece && isDen(r, c, Player.RED) && <Crown className="absolute opacity-20 text-red-100" size={20} />}
              {gameType === GameType.JUNGLE && !piece && isDen(r, c, Player.BLUE) && <Crown className="absolute opacity-20 text-blue-100" size={20} />}
              
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
                    className={`${piece.player === Player.RED ? 'text-red-600' : 'text-blue-600'} ${piece.player === currentPlayer ? 'drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]' : ''} z-10 
                      ${gameType === GameType.XIANGQI ? 'bg-amber-100 rounded-full border-2 border-amber-900 p-1 w-8 h-8 flex items-center justify-center' : ''}
                      ${gameType === GameType.ARMY_CHESS ? 'bg-neutral-800 rounded-md border border-neutral-600 p-1 w-8 h-10 flex flex-col items-center justify-center' : ''}`}
                  >
                    <IconComponent size={gameType === GameType.ARMY_CHESS ? 16 : 20} />
                    {gameType === GameType.ARMY_CHESS && (
                      <span className="text-[8px] font-bold mt-0.5 leading-none opacity-80 uppercase">
                        {piece.animal.replace('A_', '').split('_')[0]}
                      </span>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {isValidMoveDest(r, c) && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-3 h-3 bg-amber-400 rounded-full opacity-50 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                </div>
              )}
            </motion.div>
          );
        })
      )}
    </div>
  );
}
