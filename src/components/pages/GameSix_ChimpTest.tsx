import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { ScreenContainer } from '../layout/ScreenContainer';
import { Timer, Hash } from 'lucide-react';

interface GameSixProps {
  onComplete: (data: any) => void;
}

export const GameSix_ChimpTest: React.FC<GameSixProps> = ({ onComplete }) => {
  const [numbers, setNumbers] = useState<{ val: number, pos: number, isFound: boolean }[]>([]);
  const [nextExpected, setNextExpected] = useState(1);
  const [isHidden, setIsHidden] = useState(false);
  const [timeLeft, setTimeLeft] = useState(45);
  const [numCount, setNumCount] = useState(5);
  const [trials, setTrials] = useState<any[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [flashType, setFlashType] = useState<'success' | 'error' | null>(null);
  
  const startTimeRef = useRef<number>(0);
  const numCountRef = useRef<number>(5);

  const generateBoard = (count: number) => {
    setIsTransitioning(true);
    const finalCount = Math.min(count, 15);
    const positions = Array(25).fill(0).map((_, i) => i).sort(() => Math.random() - 0.5).slice(0, finalCount);
    const newNumbers = positions.map((pos, i) => ({ val: i + 1, pos, isFound: false }));
    setNumbers(newNumbers);
    setNextExpected(1);
    setIsHidden(false);
    setFlashType(null);
    setIsTransitioning(false);
    startTimeRef.current = performance.now();
  };

  useEffect(() => {
    generateBoard(numCountRef.current);
    const interval = setInterval(() => {
      setTimeLeft(v => v > 0 ? v - 1 : 0);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (timeLeft === 0) {
      onComplete({ maxSpan: numCountRef.current, holdTimeMs: performance.now() - startTimeRef.current, firstErrorIndex: null });
    }
  }, [timeLeft]);

  const handleTileClick = (val: number) => {
    if (isTransitioning || timeLeft === 0) return;
    
    const finalCount = Math.min(numCountRef.current, 15);
    if (val === nextExpected) {
      if (val === 1) setIsHidden(true);
      
      setNumbers(prev => prev.map(n => n.val === val ? { ...n, isFound: true } : n));
      setNextExpected(prev => prev + 1);

      if (val === finalCount) {
        // level complete
        setIsTransitioning(true);
        setFlashType('success');
        numCountRef.current = Math.min(numCountRef.current + 1, 15);
        setNumCount(numCountRef.current);
        setTimeout(() => {
          generateBoard(numCountRef.current);
        }, 600);
      }
    } else {
      // Game over or restart level
      setIsTransitioning(true);
      setFlashType('error');
      const duration = performance.now() - startTimeRef.current;
      setTrials(prev => [...prev, { span: finalCount, errorAt: val, duration }]);
      
      setTimeout(() => {
        generateBoard(numCountRef.current);
      }, 600);
    }
  };

  return (
    <ScreenContainer id="game-six">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-2 text-cyan-400">
          <Timer className="w-5 h-5" />
          <span className="font-mono text-xl">{timeLeft}s</span>
        </div>
        <div className="flex items-center gap-2 text-purple-400">
          <Hash className="w-5 h-5" />
          <span className="font-bold">Span: {numCount}</span>
        </div>
      </div>

      <div className="flex flex-col items-center">
        <h2 className="text-xl font-medium text-slate-300 mb-8 text-center px-4 leading-relaxed h-14">
            {isTransitioning && flashType === 'success' ? (
              <span className="text-emerald-400 font-bold">চমৎকার! পরবর্তী লেভেল লোড হচ্ছে...</span>
            ) : isTransitioning && flashType === 'error' ? (
              <span className="text-rose-400 font-bold">ভুল হয়েছে! লেভেল রিসেট হচ্ছে...</span>
            ) : isHidden ? (
              "সবগুলো আগের ক্রমানুসারে সিলেক্ট করুন"
            ) : (
              "১ নম্বরে ট্যাপ করলে বাকিগুলো লুকিয়ে যাবে"
            )}
        </h2>

        <div className="grid grid-cols-5 gap-2 w-full aspect-square max-w-sm p-4 bg-slate-900/40 border border-slate-800 rounded-2xl relative overflow-hidden">
          {Array(25).fill(0).map((_, i) => {
            const num = numbers.find(n => n.pos === i);
            return (
              <motion.button
                key={i}
                whileTap={{ scale: 0.95 }}
                onClick={() => num && !num.isFound && handleTileClick(num.val)}
                className={`w-full aspect-square rounded-xl flex items-center justify-center text-2xl font-bold transition-all duration-300 ${
                  num && !num.isFound
                    ? isHidden && num.val !== 1
                       ? "bg-slate-800 border-2 border-slate-700"
                       : "bg-white text-slate-900 border-2 border-white shadow-[0_0_15px_rgba(255,255,255,0.4)]"
                    : num?.isFound 
                        ? "opacity-0"
                        : "bg-slate-950 border border-slate-900"
                }`}
              >
                {num && !num.isFound && (!isHidden || num.val === 1) ? num.val : ""}
              </motion.button>
            );
          })}

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
          onClick={() => onComplete({ maxSpan: 0, holdTimeMs: 0, firstErrorIndex: null })}
          className="mt-12 px-6 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800 hover:border-slate-700 transition-all text-xs font-semibold uppercase tracking-wider shadow-md"
        >
          গেমটি বাদ দিন (Skip Game) →
        </button>
      </div>
    </ScreenContainer>
  );
};
