import React from 'react';
import { motion } from 'motion/react';
import { 
  Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 
} from 'lucide-react';

interface DiceProps {
  value: number;
  isRolling: boolean;
  onRoll: () => void;
  disabled?: boolean;
}

export default function Dice({ value, isRolling, onRoll, disabled }: DiceProps) {
  const getIcon = () => {
    switch (value) {
      case 1: return <Dice1 size={48} />;
      case 2: return <Dice2 size={48} />;
      case 3: return <Dice3 size={48} />;
      case 4: return <Dice4 size={48} />;
      case 5: return <Dice5 size={48} />;
      case 6: return <Dice6 size={48} />;
      default: return <Dice1 size={48} />;
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <motion.div
        animate={isRolling ? { 
          rotate: [0, 90, 180, 270, 360],
          scale: [1, 1.1, 1],
        } : {}}
        transition={isRolling ? { 
          repeat: Infinity, 
          duration: 0.2,
          ease: "linear"
        } : {}}
        className={`p-4 bg-white rounded-2xl shadow-xl text-neutral-900 ${isRolling ? 'text-amber-500' : ''}`}
      >
        {getIcon()}
      </motion.div>
      <button
        onClick={onRoll}
        disabled={disabled || isRolling}
        className="px-8 py-3 bg-amber-500 hover:bg-amber-400 text-neutral-900 font-black rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest"
      >
        {isRolling ? 'Rolling...' : 'Roll Dice'}
      </button>
    </div>
  );
}
