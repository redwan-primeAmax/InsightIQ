import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { ScreenContainer } from '../layout/ScreenContainer';
import { Check, X, Timer } from 'lucide-react';

interface GameOneProps {
  onComplete: (data: any) => void;
}

const COLORS = [
  { name: 'লাল', hex: '#ef4444', value: 'red' },
  { name: 'নীল', hex: '#3b82f6', value: 'blue' },
  { name: 'সবুজ', hex: '#22c55e', value: 'green' },
  { name: 'হলুদ', hex: '#eab308', value: 'yellow' },
];

export const GameOne_Stroop: React.FC<GameOneProps> = ({ onComplete }) => {
  const [currentTrial, setCurrentTrial] = useState<{ text: string, color: string, isMatch: boolean } | null>(null);
  const [trials, setTrials] = useState<any[]>([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const startTimeRef = useRef<number>(0);

  const generateTrial = () => {
    const textIdx = Math.floor(Math.random() * COLORS.length);
    const colorIdx = Math.floor(Math.random() * COLORS.length);
    const isMatch = textIdx === colorIdx;
    
    // Force more matches sometimes
    if (Math.random() > 0.7) {
      const matchIdx = Math.floor(Math.random() * COLORS.length);
      setCurrentTrial({ text: COLORS[matchIdx].name, color: COLORS[matchIdx].hex, isMatch: true });
    } else {
      setCurrentTrial({ text: COLORS[textIdx].name, color: COLORS[colorIdx].hex, isMatch });
    }
    startTimeRef.current = performance.now();
  };

  useEffect(() => {
    generateTrial();
    const interval = setInterval(() => {
      setTimeLeft(v => {
        if (v <= 1) {
          clearInterval(interval);
          return 0;
        }
        return v - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (timeLeft === 0) {
      onComplete({ trials });
    }
  }, [timeLeft]);

  const handleAnswer = (answer: boolean) => {
    if (!currentTrial) return;
    const now = performance.now();
    const delayMs = now - startTimeRef.current;
    
    const trialData = {
      delayMs,
      isCorrect: answer === currentTrial.isMatch,
      type: currentTrial.isMatch ? 'congruent' : 'incongruent'
    };
    
    setTrials(prev => [...prev, trialData]);
    generateTrial();
  };

  return (
    <ScreenContainer id="game-one">
      <div className="flex justify-between items-center mb-12">
        <div className="flex items-center gap-2 text-cyan-400">
          <Timer className="w-5 h-5" />
          <span className="font-mono text-xl">{timeLeft}s</span>
        </div>
        <div className="text-slate-400 text-sm">পাউন্ড: {trials.length}</div>
      </div>

      <div className="flex flex-col items-center">
        <motion.div
           key={currentTrial?.text + currentTrial?.color}
           initial={{ scale: 0.8, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           className="h-40 flex items-center justify-center mb-16"
        >
          <span 
            className="text-7xl font-bold tracking-tight" 
            style={{ color: currentTrial?.color }}
          >
            {currentTrial?.text}
          </span>
        </motion.div>

        <div className="grid grid-cols-2 gap-4 w-full">
          <button
            onClick={() => handleAnswer(true)}
            className="group flex flex-col items-center gap-4 p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all"
          >
            <div className="p-3 rounded-full bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]">
              <Check className="w-8 h-8" />
            </div>
            <span className="font-bold text-emerald-400 text-lg">মিল আছে</span>
          </button>

          <button
            onClick={() => handleAnswer(false)}
            className="group flex flex-col items-center gap-4 p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 transition-all"
          >
            <div className="p-3 rounded-full bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]">
              <X className="w-8 h-8" />
            </div>
            <span className="font-bold text-rose-400 text-lg">মিল নেই</span>
          </button>
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
