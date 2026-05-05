import { ANIMAL_RANKS, GameType } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Crown, Sparkles } from 'lucide-react';
import { ZODIAC_RANKS } from '../zodiacConstants';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: GameType;
}

export default function RulesModal({ isOpen, onClose, mode = GameType.JUNGLE }: RulesModalProps) {
  const isZodiac = mode === GameType.ZODIAC;
  const isXiangqi = mode === GameType.XIANGQI;
  const isLadderSnake = mode === GameType.LADDER_SNAKE;
  const isArmyChess = mode === GameType.ARMY_CHESS;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-neutral-950/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-neutral-800 p-8 rounded-2xl border-2 border-amber-800/50 max-w-xl w-full shadow-2xl relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
              <Sparkles size={120} className="text-amber-500" />
            </div>

            <div className="flex items-center gap-3 mb-6 relative">
              <Crown className="text-amber-500" size={32} />
              <h2 className="text-3xl font-black text-amber-500 uppercase tracking-tighter">
                {isZodiac ? 'Zodiac Chronicles' : isXiangqi ? 'Xiangqi Legends' : isLadderSnake ? 'Ladder Snakes' : isArmyChess ? 'Strategic Front' : 'Ancient Jungle Wisdom'}
              </h2>
            </div>

            <div className="text-neutral-300 space-y-6 relative overflow-y-auto max-h-[60vh] pr-2">
              <p className="text-lg leading-relaxed italic text-amber-100/70 border-l-4 border-amber-600 pl-4">
                {isZodiac 
                  ? "Twelve spirits descend from the heavens. Only the strongest can reach the opposite palace." 
                  : isXiangqi 
                    ? "The ancient battle of the generals. Protect your King at all costs."
                    : isLadderSnake
                      ? "A simple race. Watch out for snakes!"
                      : isArmyChess
                        ? "Command your forces through the railways and camps. Protect the flag."
                        : "Within the dense jungle, hierarchy is absolute. Move your forces to the heart of the enemy den."}
              </p>
              
              {!(isLadderSnake || isArmyChess || isXiangqi) && (
                <div className="bg-neutral-900/50 p-4 rounded-xl border border-neutral-700">
                  <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                    <div className="w-2 h-6 bg-amber-500" />
                    Divine Rankings:
                  </h3>
                  <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {Object.entries(isZodiac ? ZODIAC_RANKS : ANIMAL_RANKS)
                      .sort(([, a], [, b]) => a - b)
                      .map(([name, rank]) => (
                        <li key={name} className="flex items-center justify-between bg-neutral-800 p-2 rounded border border-neutral-700/50 group hover:border-amber-500/50 transition-colors">
                          <span className="text-xs font-bold text-neutral-400 uppercase">{name}</span>
                          <span className="text-amber-500 font-mono font-bold">Lvl {rank}</span>
                        </li>
                      ))}
                  </ul>
                </div>
              )}
              
              <div className="space-y-3">
                <h3 className="font-bold text-white">Combat Invariants:</h3>
                <ul className="list-disc list-inside text-sm space-y-2 text-neutral-400">
                  {isArmyChess ? (
                    <>
                      <li>Higher military rank captures lower rank.</li>
                      <li className="text-amber-300 font-medium">Camps: Safe zones where pieces cannot be captured.</li>
                      <li>Railways: Allow rapid movement across long distances.</li>
                    </>
                  ) : isXiangqi ? (
                    <>
                      <li>Kill the General to win.</li>
                      <li className="text-amber-300 font-medium">Palace: The General and Advisors must stay within the palace.</li>
                      <li>River: Limits the movement of Elephants and Pawns.</li>
                    </>
                  ) : isZodiac ? (
                    <>
                      <li>Superior or equal rank captures the inferior.</li>
                      <li className="text-amber-300 font-medium">The Cycle: The Rat (1) outwits and captures the mighty Pig (12)!</li>
                    </>
                  ) : isLadderSnake ? (
                    <>
                      <li>Race to the final square!</li>
                      <li className="text-amber-300 font-medium">Ladders take you up, Snakes bring you down.</li>
                    </>
                  ) : (
                    <>
                      <li>Superior or equal rank captures the inferior.</li>
                      <li className="text-amber-300 font-medium">Special: The Mouse (1) crawls into the Elephant's (8) ear to capture it!</li>
                      <li>Water: Only Mice can enter the river. Lion and Tigers can jump over it.</li>
                    </>
                  )}
                  <li>Entering your own den/HQ is usually forbidden.</li>
                </ul>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="mt-8 w-full py-3 bg-gradient-to-r from-amber-700 to-amber-900 hover:from-amber-600 hover:to-amber-800 text-white font-black uppercase tracking-widest rounded-xl shadow-lg border-b-4 border-amber-950 active:translate-y-1 active:border-b-0 transition-all"
            >
              Enter the Arena
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
