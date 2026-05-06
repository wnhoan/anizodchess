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
  return (
    <div className="flex flex-col items-center gap-4">
      <motion.div
        animate={isRolling ? { 
          rotate: [0, 90, 180, 270, 360],
          scale: [1.1, 0.9, 1.1],
        } : {}}
        transition={isRolling ? { 
          repeat: Infinity, 
          duration: 0.15,
          ease: "linear"
        } : {}}
        className={`w-20 h-20 flex items-center justify-center bg-white rounded-2xl shadow-xl text-neutral-900 border-4 ${isRolling ? 'border-amber-500 text-amber-500' : 'border-neutral-200'}`}
      >
        <span className="text-4xl font-black">{value}</span>
      </motion.div>
      <button
        onClick={onRoll}
        disabled={disabled || isRolling}
        className="px-8 py-3 bg-amber-500 hover:bg-amber-400 text-neutral-900 font-black rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-sm"
      >
        {isRolling ? 'Rolling...' : 'Roll Dice (1-9)'}
      </button>
    </div>
  );
}
