import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { ScreenContainer } from '../layout/ScreenContainer';
import { Timer, Zap } from 'lucide-react';

interface GameFiveProps {
  onComplete: (data: any) => void;
}

export const GameFive_ReverseCommand: React.FC<GameFiveProps> = ({ onComplete }) => {
  const [currentCmd, setCurrentCmd] = useState<{ text: string, type: 'normal' | 'reverse' } | null>(null);
  const [trials, setTrials] = useState<any[]>([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const startTimeRef = useRef<number>(0);
  const timeoutRef = useRef<any>(null);
  const currentCmdRef = useRef<{ text: string, type: 'normal' | 'reverse' } | null>(null);

  const generateCommand = () => {
    const isReverse = Math.random() > 0.5;
    const isTap = Math.random() > 0.5;
    
    const newCmd = {
      text: isTap ? "TAP!" : "DONT TAP!",
      type: (isReverse ? 'reverse' : 'normal') as 'normal' | 'reverse'
    };
    
    setCurrentCmd(newCmd);
    currentCmdRef.current = newCmd;
    startTimeRef.current = performance.now();

    // After 2 seconds, if user did NOT tap, evaluate if they were supposed to stay quiet or tap
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
       const activeCmd = currentCmdRef.current;
       if (!activeCmd) return;
       
       // Success without tapping conditions:
       // 1. "DONT TAP!" under normal context
       // 2. "TAP!" under reverse context (reverse of TAP! is DO NOT TAP!)
       if ((activeCmd.text === "DONT TAP!" && activeCmd.type === 'normal') ||
           (activeCmd.text === "TAP!" && activeCmd.type === 'reverse')) {
          handleAutoPass(true);
       } else {
          // Failed to tap within 2 seconds when requested
          handleAutoPass(false);
       }
    }, 2000);
  };

  const handleAutoPass = (correct: boolean) => {
     setTrials(prev => [...prev, { 
       delayMs: 2000, 
       isCorrect: correct, 
       type: currentCmdRef.current?.type, 
       isImpulsive: false 
     }]);
     generateCommand();
  };

  useEffect(() => {
    generateCommand();
    const interval = setInterval(() => {
      setTimeLeft(v => v > 0 ? v - 1 : 0);
    }, 1000);
    return () => {
      clearInterval(interval);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (timeLeft === 0) {
      onComplete({ trials });
    }
  }, [timeLeft]);

  const handleTap = () => {
    const activeCmd = currentCmdRef.current;
    if (!activeCmd) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    const now = performance.now();
    const delayMs = now - startTimeRef.current;
    
    // Correct tap conditions:
    // 1. Normal type + TAP!
    // 2. Reverse type + DONT TAP! (Wait, reverse means opposite. If text is DONT TAP, reverse means TAP)
    let isCorrect = false;
    if (activeCmd.type === 'normal') {
        isCorrect = activeCmd.text === "TAP!";
    } else {
        isCorrect = activeCmd.text === "DONT TAP!";
    }

    const isImpulsive = !isCorrect && delayMs < 400;

    setTrials(prev => [...prev, { delayMs, isCorrect, type: activeCmd.type, isImpulsive }]);
    generateCommand();
  };

  return (
    <ScreenContainer id="game-five" className={currentCmd?.type === 'reverse' ? 'bg-rose-950/20' : 'bg-emerald-950/20'}>
      <div className="flex justify-between items-center mb-12">
        <div className="flex items-center gap-2 text-white">
          <Timer className="w-5 h-5" />
          <span className="font-mono text-xl">{timeLeft}s</span>
        </div>
        <div className="flex items-center gap-2 text-cyan-400">
          <Zap className="w-5 h-5" />
          <span className="font-bold">Impulse Guard</span>
        </div>
      </div>

      <div className="flex flex-col items-center">
        <div className="text-center mb-8">
            <p className="text-slate-400 text-xs uppercase tracking-[0.2em] mb-2 font-bold">
                {currentCmd?.type === 'reverse' ? 'উল্টো নির্দেশ' : 'সরাসরি নির্দেশ'}
            </p>
            <div className={`h-1 w-24 mx-auto rounded-full ${currentCmd?.type === 'reverse' ? 'bg-rose-500' : 'bg-emerald-500'}`} />
        </div>

        <motion.button
          key={currentCmd?.text + currentCmd?.type}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleTap}
          className={`w-64 h-64 rounded-full border-4 flex items-center justify-center transition-all duration-300 shadow-2xl ${
            currentCmd?.type === 'reverse' 
                ? 'border-rose-500 bg-rose-500/10 text-rose-500 shadow-rose-500/20' 
                : 'border-emerald-500 bg-emerald-500/10 text-emerald-500 shadow-emerald-500/20'
          }`}
        >
          <span className="text-4xl font-black italic tracking-tighter">{currentCmd?.text}</span>
        </motion.button>

        <p className="mt-12 text-slate-500 text-sm italic">
            নির্দেশ অনুযায়ী ট্যাপ করুন অথবা শান্ত থাকুন
        </p>

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
