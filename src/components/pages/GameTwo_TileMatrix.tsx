import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { ScreenContainer } from '../layout/ScreenContainer';
import { Timer, Brain } from 'lucide-react';

interface GameTwoProps {
  onComplete: (data: any) => void;
}

export const GameTwo_TileMatrix: React.FC<GameTwoProps> = ({ onComplete }) => {
  const [grid, setGrid] = useState<number[]>(Array(9).fill(0));
  const [level, setLevel] = useState(1);
  const [sequence, setSequence] = useState<number[]>([]);
  const [userInput, setUserInput] = useState<number[]>([]);
  const [isShowing, setIsShowing] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(40);
  const [errors, setErrors] = useState<any[]>([]);
  const [flashType, setFlashType] = useState<'success' | 'error' | null>(null);
  
  const levelRef = useRef<number>(1);
  const trialStartRef = useRef<number>(0);

  const startLevel = (nextLevel: number) => {
    setIsTransitioning(true);
    const numTiles = Math.min(3 + Math.floor(nextLevel / 2), 6);
    const newSequence: number[] = [];
    while (newSequence.length < numTiles) {
      const rand = Math.floor(Math.random() * 9);
      if (!newSequence.includes(rand)) newSequence.push(rand);
    }
    setSequence(newSequence);
    setUserInput([]);
    setIsShowing(true);
    setGrid(Array(9).fill(0));
    setFlashType(null);
    
    setTimeout(() => {
      setIsShowing(false);
      setIsTransitioning(false);
      trialStartRef.current = performance.now();
    }, 1500);
  };

  useEffect(() => {
    startLevel(levelRef.current);
    const interval = setInterval(() => {
      setTimeLeft(v => v > 0 ? v - 1 : 0);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (timeLeft === 0) {
      onComplete({ maxLevel: levelRef.current, errors });
    }
  }, [timeLeft]);

  const handleTileClick = (index: number) => {
    if (isShowing || isTransitioning || timeLeft === 0) return;
    
    if (sequence.includes(index)) {
      if (userInput.includes(index)) return;
      const newUserInput = [...userInput, index];
      setUserInput(newUserInput);
      
      if (newUserInput.length === sequence.length) {
        setIsTransitioning(true);
        setFlashType('success');
        levelRef.current = levelRef.current + 1;
        setLevel(levelRef.current);
        setTimeout(() => {
          startLevel(levelRef.current);
        }, 600);
      }
    } else {
      // Wrong tap
      setIsTransitioning(true);
      setFlashType('error');
      const hesitationMs = performance.now() - trialStartRef.current;
      setErrors(prev => [...prev, { hesitationMs }]);
      // Flash red then restart level
      setGrid(g => g.map((v, i) => i === index ? 2 : v));
      setTimeout(() => {
        setGrid(Array(9).fill(0));
        startLevel(levelRef.current);
      }, 600);
    }
  };

  return (
    <ScreenContainer id="game-two">
      <div className="flex justify-between items-center mb-12">
        <div className="flex items-center gap-2 text-purple-400">
          <Timer className="w-5 h-5" />
          <span className="font-mono text-xl">{timeLeft}s</span>
        </div>
        <div className="flex items-center gap-2 text-cyan-400">
          <Brain className="w-5 h-5" />
          <span className="font-bold">লেভেল: {level}</span>
        </div>
      </div>

      <div className="flex flex-col items-center">
        <h2 className="text-xl font-medium text-slate-300 mb-8 h-8">
          {isShowing 
            ? "প্যাটার্নটি মনে রাখুন..." 
            : flashType === 'success' 
            ? "চমৎকার! সঠিক হয়েছে।" 
            : flashType === 'error' 
            ? "ভুল উত্তর! আবার চেষ্টা করুন।" 
            : "সরল ৪×৪ বা ৩×৩ গ্রিডে টাইলগুলো সিলেক্ট করুন"}
        </h2>

        <div className="grid grid-cols-3 gap-3 p-4 bg-slate-900/40 border border-slate-800 rounded-2xl relative overflow-hidden">
          {Array(9).fill(0).map((_, i) => (
            <motion.button
              key={i}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleTileClick(i)}
              className={`w-24 h-24 rounded-2xl border-2 transition-all duration-300 ${
                isShowing && sequence.includes(i)
                  ? "bg-cyan-500 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.6)]"
                  : userInput.includes(i)
                  ? "bg-slate-800 border-emerald-500 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                  : grid[i] === 2
                  ? "bg-rose-500 border-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.4)]"
                  : "bg-slate-950 border-slate-800 hover:border-slate-700"
              }`}
            />
          ))}
          
          {/* Overlay color flashes */}
          {flashType === 'success' && (
            <div className="absolute inset-0 bg-emerald-500/10 pointer-events-none border border-emerald-500/20 rounded-2xl transition-all duration-300" />
          )}
          {flashType === 'error' && (
            <div className="absolute inset-0 bg-rose-500/10 pointer-events-none border border-rose-500/20 rounded-2xl transition-all duration-300" />
          )}
        </div>

        <button
          type="button"
          onClick={() => onComplete({ maxLevel: 0, errors: [] })}
          className="mt-12 px-6 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800 hover:border-slate-700 transition-all text-xs font-semibold uppercase tracking-wider shadow-md"
        >
          গেমটি বাদ দিন (Skip Game) →
        </button>
      </div>
    </ScreenContainer>
  );
};
