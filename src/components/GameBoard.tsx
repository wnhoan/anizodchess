import React, { ElementType } from 'react';
import { 
  Mouse, Cat, Dog, Sparkle, Zap, Crown, Circle, Bird, Flame, Smile, Move, Ghost, Rabbit, Rat,
  Flag, Shield, Swords, Target, User, Users, Anchor, Bomb, Construction, Trophy,
  CircleDot,
  Castle, Crosshair
} from 'lucide-react';
import { Piece, Player, Animal, Position, GameType } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { RIVER_POSITIONS, TRAP_POSITIONS, DEN_POSITIONS } from '../constants';
import { getSquareForPosition, getPositionForSquare, LADDER_SNAKE_MAP } from '../snakeLadderConstants';

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

  // Western Chess Pieces
  [Animal.C_KING]: Crown,
  [Animal.C_QUEEN]: Sparkle,
  [Animal.C_ROOK]: Castle,
  [Animal.C_BISHOP]: Crosshair,
  [Animal.C_KNIGHT]: Move,
  [Animal.C_PAWN]: Circle,
};

interface BoardProps {
  board: (Piece | null)[][];
  onCellClick: (row: number, col: number) => void;
  currentPlayer: Player;
  selectedPosition: Position | null;
  validMoves?: Position[];
  gameType: GameType;
  gameSeed?: number;
}

export default function Board({ board, onCellClick, currentPlayer, selectedPosition, validMoves = [], gameType, gameSeed = 0 }: BoardProps) {
  const isRiver = (r: number, c: number) => RIVER_POSITIONS.some(p => p.row === r && p.col === c);
  const isTrap = (r: number, c: number) => TRAP_POSITIONS.some(p => p.row === r && p.col === c);
  const isDen = (r: number, c: number, p: Player) => DEN_POSITIONS[p].row === r && DEN_POSITIONS[p].col === c;
  const isValidMoveDest = (r: number, c: number) => validMoves.some(p => p.row === r && p.col === c);

  const rows = board.length;
  const cols = board[0]?.length || 0;

  const renderShortcuts = () => {
    if (gameType !== GameType.LADDER_SNAKE) return null;

    return (
      <svg 
        className="absolute inset-0 pointer-events-none z-10" 
        width="100%" 
        height="100%" 
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="ladderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
           <filter id="glow">
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
            <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        {Object.entries(LADDER_SNAKE_MAP).map(([start, end]) => {
          const sNum = parseInt(start);
          const sPos = getPositionForSquare(sNum);
          const ePos = getPositionForSquare(end);
          const isLadder = end > sNum;

          // Stable visual seeds based on positions
          const visualSeed = (sNum * 123.45) + (end * 67.89);
          const hue = Math.floor(visualSeed % 360);

          // Convert grid coords to viewBox (0-100) coords
          const x1 = (sPos.col + 0.5) * (100 / cols);
          const y1 = (sPos.row + 0.5) * (100 / rows);
          const x2 = (ePos.col + 0.5) * (100 / cols);
          const y2 = (ePos.row + 0.5) * (100 / rows);

          if (isLadder) {
            // Draw a ladder
            const dx = x2 - x1;
            const dy = y2 - y1;
            const angle = Math.atan2(dy, dx);
            const dist = Math.sqrt(dx * dx + dy * dy);
            const width = 2.5;
            const offset = width / 2;
            
            // Perpendicular vector for side rails
            const px = Math.sin(angle) * offset;
            const py = -Math.cos(angle) * offset;

            const rungs = Math.floor(dist / 4);
            const rungElements = [];
            for (let i = 1; i < rungs; i++) {
              const t = i / rungs;
              const tx = x1 + dx * t;
              const ty = y1 + dy * t;
              rungElements.push(
                <line 
                  key={`rung-${sNum}-${i}`}
                  x1={tx + px} y1={ty + py} 
                  x2={tx - px} y2={ty - py} 
                  stroke={`hsl(${hue}, 70%, 30%)`} 
                  strokeWidth="0.8" 
                />
              );
            }

            return (
              <g key={`shortcut-${sNum}`} className="opacity-80" filter="url(#glow)">
                <line x1={x1 + px} y1={y1 + py} x2={x2 + px} y2={y2 + py} stroke={`hsl(${hue}, 80%, 50%)`} strokeWidth="1.2" strokeLinecap="round" />
                <line x1={x1 - px} y1={y1 - py} x2={x2 - px} y2={y2 - py} stroke={`hsl(${hue}, 80%, 50%)`} strokeWidth="1.2" strokeLinecap="round" />
                {rungElements}
              </g>
            );
          } else {
            // Draw a snake
            const idHash = sNum * 123.456;
            const offsetDist = 8 + (Math.sin(idHash) * 10);
            const mx = (x1 + x2) / 2 + (Math.sin(idHash) * offsetDist);
            const my = (y1 + y2) / 2 + (Math.cos(idHash) * offsetDist);
            
            // Calculate angle for head and tail
            const angleHead = Math.atan2(y1 - my, x1 - mx);
            const angleTail = Math.atan2(y2 - my, x2 - mx);

            return (
              <g key={`shortcut-${sNum}`} className="opacity-90" filter="url(#glow)">
                {/* Shadow/Glow underbody */}
                <path 
                  d={`M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`} 
                  fill="none" 
                  stroke={`hsl(${hue}, 80%, 20%)`} 
                  strokeWidth="4" 
                  strokeLinecap="round"
                  className="opacity-40"
                />
                {/* Main Body */}
                <path 
                  d={`M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`} 
                  fill="none" 
                  stroke={`hsl(${hue}, 80%, 45%)`} 
                  strokeWidth="3.2" 
                  strokeLinecap="round"
                />
                {/* Pattern/Highlights */}
                <path 
                  d={`M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`} 
                  fill="none" 
                  stroke="white" 
                  strokeWidth="1.2" 
                  strokeLinecap="round"
                  strokeDasharray="2 6"
                  className="opacity-40"
                />
                
                {/* Snake Head (at start position - where player slides from) */}
                <g transform={`translate(${x1}, ${y1}) rotate(${angleHead * 180 / Math.PI + 90})`}>
                  <ellipse cx="0" cy="0" rx="3.5" ry="4.5" fill={`hsl(${hue}, 80%, 40%)`} />
                  <circle cx="-1.2" cy="-1.5" r="0.8" fill="white" />
                  <circle cx="1.2" cy="-1.5" r="0.8" fill="white" />
                  <circle cx="-1.2" cy="-1.7" r="0.3" fill="black" />
                  <circle cx="1.2" cy="-1.7" r="0.3" fill="black" />
                  {/* Tongue */}
                  <path d="M 0 -4.5 L -0.5 -6 M 0 -4.5 L 0.5 -6" stroke="#ef4444" strokeWidth="0.5" fill="none" />
                </g>

                {/* Snake Tail (at end position - where player lands) */}
                <g transform={`translate(${x2}, ${y2}) rotate(${angleTail * 180 / Math.PI - 90})`}>
                  <path d="M -2 0 L 2 0 L 0 5 Z" fill={`hsl(${hue}, 80%, 35%)`} />
                </g>
              </g>
            );
          }
        })}
      </svg>
    );
  };

  return (
    <div className="relative">
      {renderShortcuts()}
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
          } else if (gameType === GameType.CHESS) {
            bgColor = (r + c) % 2 === 0 ? 'bg-[#eeeed2]' : 'bg-[#769656]';
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

          // Generate unique physical variation based on piece ID and game seed
          const idHash = piece ? piece.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : 0;
          const visualSeed = (idHash + Math.floor(gameSeed * 1000));
          const randomTiltX = piece ? (visualSeed % 14) - 7 : 0;
          const randomTiltY = piece ? ((visualSeed / 3) % 14) - 7 : 0;
          const randomRotate = piece ? (visualSeed % 24) - 12 : 0;

          return (
            <motion.div
              layout
              key={`${r}-${c}`}
              onClick={() => onCellClick(r, c)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`relative w-10 h-10 md:w-12 md:h-12 ${bgColor} flex items-center justify-center rounded cursor-pointer ${
                  selectedPosition?.row === r && selectedPosition?.col === c ? 'ring-4 ring-yellow-400 z-30' : ''
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
                    initial={{ opacity: 0, scale: 0.5, y: -40 }}
                    animate={{ 
                      opacity: 1, 
                      scale: piece.player === currentPlayer ? 1.15 : 1, 
                      y: 0,
                      rotate: randomRotate,
                      rotateX: randomTiltX,
                      rotateY: randomTiltY,
                      z: piece.player === currentPlayer ? 30 : 0
                    }}
                    whileHover={{ 
                      scale: 1.25, 
                      rotateX: 10,
                      rotateY: 10,
                      filter: 'brightness(1.15) contrast(1.1)',
                      z: 60,
                      transition: { duration: 0.2 }
                    }}
                    exit={{ 
                      opacity: 0, 
                      scale: 2.5,
                      rotate: 180,
                      y: -100,
                      filter: "brightness(2) blur(12px)",
                    }}
                    transition={{ 
                      type: "spring", 
                      stiffness: 450, 
                      damping: 30,
                      exit: { duration: 0.3 }
                    }}
                    className={`relative z-20 w-8 h-8 md:w-10 md:h-10 rounded-full flex flex-col items-center justify-center
                      shadow-[0_6px_0_0_rgba(0,0,0,0.3),0_12px_24px_-4px_rgba(0,0,0,0.5),inset_0_2px_4px_rgba(255,255,255,0.4)]
                      perspective-500 transform-gpu transition-all duration-300
                      ${piece.player === Player.RED 
                        ? 'bg-linear-to-br from-red-400 via-red-600 to-red-900 text-white border-b-4 border-red-950/40' 
                        : 'bg-linear-to-br from-blue-400 via-blue-600 to-blue-900 text-white border-b-4 border-blue-950/40'
                      }
                      ${piece.player === currentPlayer ? 'ring-2 ring-white/60 ring-offset-2 ring-offset-neutral-800' : ''}
                      ${gameType === GameType.ARMY_CHESS ? 'rounded-lg h-10 w-8 md:h-11 md:w-9 sm:rounded-md' : ''}
                    `}
                  >
                    <IconComponent 
                      size={gameType === GameType.ARMY_CHESS ? 14 : 22} 
                      className="drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)] transition-transform group-hover:scale-110"
                    />
                    {gameType === GameType.ARMY_CHESS && (
                      <span className="text-[7px] font-black mt-0.5 leading-none opacity-90 uppercase tracking-tighter drop-shadow-sm">
                        {piece.animal.replace('A_', '').split('_')[0]}
                      </span>
                    )}
                    
                    {/* Realistic Glossy Highlight */}
                    <div className="absolute top-1 left-2 w-3 h-1.5 bg-white/40 rounded-full blur-[1.5px] rotate-[-15deg] pointer-events-none" />
                    {/* Bottom Rim Reflection */}
                    <div className="absolute bottom-1 right-2 w-1.5 h-1 bg-white/10 rounded-full blur-[1px] pointer-events-none" />
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
    </div>
  );
}
