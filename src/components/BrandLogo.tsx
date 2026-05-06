import React from 'react';
import { Crown, Sparkles, Flame, Shield } from 'lucide-react';
import { GameType } from '../types';

interface BrandLogoProps {
  gameType: GameType;
}

export default function BrandLogo({ gameType }: BrandLogoProps) {
  const getIcon = () => {
    switch (gameType) {
      case GameType.JUNGLE: return <Crown size={32} className="text-amber-500" />;
      case GameType.ZODIAC: return <Sparkles size={32} className="text-purple-400" />;
      case GameType.XIANGQI: return <Shield size={32} className="text-red-500" />;
      case GameType.ARMY_CHESS: return <Shield size={32} className="text-stone-400" />;
      case GameType.LADDER_SNAKE: return <Flame size={32} className="text-orange-500" />;
      case GameType.CHESS: return <Crown size={32} className="text-white" />;
      default: return <Crown size={32} className="text-amber-500" />;
    }
  };

  const getTitle = () => {
    switch (gameType) {
      case GameType.JUNGLE: return 'Jungle Chess';
      case GameType.ZODIAC: return 'Zodiac Legends';
      case GameType.XIANGQI: return 'Chinese Chess';
      case GameType.ARMY_CHESS: return 'Army Chess';
      case GameType.LADDER_SNAKE: return 'Ladder Snake';
      case GameType.CHESS: return 'Grand Chess';
      default: return 'Grand Chess';
    }
  };

  const getSubtitle = () => {
    switch (gameType) {
      case GameType.JUNGLE: return 'The Law of the Wild';
      case GameType.ZODIAC: return 'Chronicles of the Heavens';
      case GameType.XIANGQI: return 'The Ancient Battlefield';
      case GameType.ARMY_CHESS: return 'The Strategic Front';
      case GameType.LADDER_SNAKE: return 'The Race to Infinity';
      case GameType.CHESS: return 'The Royal Strategy';
      default: return 'Master the Board';
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-red-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative p-4 bg-neutral-900 rounded-full border border-neutral-800 shadow-2xl flex items-center justify-center">
          {getIcon()}
        </div>
      </div>
      <div className="mt-4 text-center">
        <h1 className="text-4xl font-black bg-gradient-to-b from-white to-neutral-400 bg-clip-text text-transparent uppercase tracking-tighter sm:text-5xl">
          {getTitle()}
        </h1>
        <p className="mt-1 text-amber-500/80 font-mono text-sm uppercase tracking-widest font-bold">
          {getSubtitle()}
        </p>
      </div>
    </div>
  );
}
