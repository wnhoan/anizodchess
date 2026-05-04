import { ElementType } from 'react';
import { Piece, Player } from '../types';
import { Mouse, Cat, Dog, Sparkle, Zap, Crown, Circle, Bird, Flame, Smile, Move, Ghost, Rabbit, Rat } from 'lucide-react';

const AnimalIconMap: Record<string, ElementType> = {
  // Jungle
  MOUSE: Mouse,
  CAT: Cat,
  WOLF: Dog,
  DOG: Dog,
  LEOPARD: Sparkle,
  TIGER: Zap,
  LION: Crown,
  ELEPHANT: Circle,
  
  // Zodiac
  RAT: Rat,
  OX: Ghost,
  RABBIT: Rabbit,
  DRAGON: Flame,
  SNAKE: Sparkle,
  HORSE: Move,
  GOAT: Circle,
  MONKEY: Smile,
  ROOSTER: Bird,
  PIG: Cat,
};

interface CapturedPiecesProps {
  pieces: Piece[];
}

export default function CapturedPieces({ pieces }: CapturedPiecesProps) {
  return (
    <div className="mt-8 w-full max-w-2xl px-4">
      <div className="flex items-center gap-2 mb-4 border-b border-neutral-700 pb-2">
        <Crown size={20} className="text-amber-500" />
        <h2 className="text-white text-lg font-bold">Captured Trophies</h2>
      </div>
      <div className="flex flex-wrap gap-2">
        {pieces.map((piece, index) => {
          const IconComponent = AnimalIconMap[piece.animal];
          return (
            <div 
              key={index}
              className={`p-2 rounded ${piece.player === Player.RED ? 'bg-blue-950 text-blue-300' : 'bg-red-950 text-red-300'}`}
              title={`Captured ${piece.animal} (${piece.player})`}
            >
              <IconComponent size={20} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
