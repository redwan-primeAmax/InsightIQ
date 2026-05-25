import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { ScreenContainer } from '../layout/ScreenContainer';
import { Timer, Compass } from 'lucide-react';

interface GameThreeProps {
  onComplete: (data: any) => void;
}

const SHAPES = [
  "M 20 20 L 80 20 M 20 20 L 20 80 M 50 50 L 80 80",
  "M 10 50 L 90 50 M 50 10 L 50 90 M 10 10 L 90 90",
  "M 20 50 A 30 30 0 1 1 80 50 L 50 50",
  "M 30 20 L 70 20 L 70 80 L 30 80 Z M 50 20 L 50 80",
];

export const GameThree_RotationMatch: React.FC<GameThreeProps> = ({ onComplete }) => {
  const [currentTrial, setCurrentTrial] = useState<any>(null);
  const [trials, setTrials] = useState<any[]>([]);
  const [timeLeft, setTimeLeft] = useState(35);
  const startTimeRef = useRef<number>(0);

  const generateTrial = () => {
    const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    const targetRotation = Math.floor(Math.random() * 4) * 90;
    const options = [
      targetRotation,
      (targetRotation + 90) % 360,
      (targetRotation + 180) % 360,
    ].sort(() => Math.random() - 0.5);

    setCurrentTrial({ shape, targetRotation, options });
    startTimeRef.current = performance.now();
  };

  useEffect(() => {
    generateTrial();
    const interval = setInterval(() => {
      setTimeLeft(v => v > 0 ? v - 1 : 0);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (timeLeft === 0) {
      onComplete({ trials });
    }
  }, [timeLeft]);

  const handleSelect = (rotation: number) => {
    const now = performance.now();
    const delayMs = now - startTimeRef.current;
    const isCorrect = rotation === currentTrial.targetRotation;
    
    setTrials(prev => [...prev, { delayMs, isCorrect, difficulty: Math.abs(rotation - currentTrial.targetRotation) }]);
    generateTrial();
  };

  return (
    <ScreenContainer id="game-three">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-2 text-amber-400">
          <Timer className="w-5 h-5" />
          <span className="font-mono text-xl">{timeLeft}s</span>
        </div>
        <div className="flex items-center gap-2 text-indigo-400">
          <Compass className="w-5 h-5" />
          <span className="font-bold">Spatial Match</span>
        </div>
      </div>

      <div className="flex flex-col items-center">
        <div className="mb-12 p-8 rounded-3xl bg-slate-900/80 border border-slate-700 shadow-xl">
          <svg width="100" height="100" viewBox="0 0 100 100" className="text-cyan-400">
            <path d={currentTrial?.shape} fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
          </svg>
          <div className="text-center mt-4 text-xs text-slate-500 uppercase tracking-widest">মাস্টার অবজেক্ট</div>
        </div>

        <div className="text-sm text-slate-400 mb-6">নিচের সঠিক ঘূর্ণনটি সিলেক্ট করুন:</div>

        <div className="grid grid-cols-3 gap-4 w-full">
          {currentTrial?.options.map((rotate: number, i: number) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(51, 65, 85, 0.8)' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSelect(rotate)}
              className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center transition-colors"
            >
              <svg width="60" height="60" viewBox="0 0 100 100" className="text-indigo-400" style={{ transform: `rotate(${rotate}deg)` }}>
                <path d={currentTrial?.shape} fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
              </svg>
            </motion.button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => onComplete({ trials: [] })}
          className="mt-12 px-6 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800 hover:border-slate-700 transition-all text-xs font-semibold uppercase tracking-wider shadow-md"
        >
          গেমটি বাদ দিন (Skip Game) →
        </button>
      </div>
    </ScreenContainer>
  );
};
