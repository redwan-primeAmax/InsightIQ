import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { ScreenContainer } from '../layout/ScreenContainer';
import { Timer, Puzzle } from 'lucide-react';

interface GameFourProps {
  onComplete: (data: any) => void;
}

interface PatternItem {
  id: string;
  render: (colorClass: string) => React.ReactNode;
  value: string;
}

interface TrialData {
  type: string;
  sequence: PatternItem[];
  correctAnswer: PatternItem;
  options: PatternItem[];
  colorClass: string;
}

export const GameFour_GridContinuity: React.FC<GameFourProps> = ({ onComplete }) => {
  const [currentTrial, setCurrentTrial] = useState<TrialData | null>(null);
  const [trials, setTrials] = useState<any[]>([]);
  const [timeLeft, setTimeLeft] = useState(35);
  const [level, setLevel] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [flashType, setFlashType] = useState<'success' | 'error' | null>(null);

  const startTimeRef = useRef<number>(0);
  const levelRef = useRef<number>(1);

  // SVG Render Helper Functions
  const drawArrow = (angle: number) => (color: string) => (
    <svg width="60" height="60" viewBox="0 0 100 100" className={color} style={{ transform: `rotate(${angle}deg)` }}>
      <path d="M 50 15 L 50 85 M 50 15 L 25 40 M 50 15 L 75 40" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  const drawCircle = (radius: number) => (color: string) => (
    <svg width="60" height="60" viewBox="0 0 100 100" className={color}>
      <circle cx="50" cy="50" r={radius} fill="none" stroke="currentColor" strokeWidth="8" />
    </svg>
  );

  const drawTriangle = (size: number) => (color: string) => (
    <svg width="60" height="60" viewBox="0 0 100 100" className={color}>
      <polygon points={`50,${50 - size} ${50 - size},${50 + size} ${50 + size},${50 + size}`} fill="none" stroke="currentColor" strokeWidth="8" strokeLinejoin="round" />
    </svg>
  );

  const drawSquare = (size: number) => (color: string) => (
    <svg width="60" height="60" viewBox="0 0 100 100" className={color}>
      <rect x={50 - size} y={50 - size} width={size * 2} height={size * 2} fill="none" stroke="currentColor" strokeWidth="8" strokeLinejoin="round" />
    </svg>
  );

  const drawHexagon = () => (color: string) => (
    <svg width="60" height="60" viewBox="0 0 100 100" className={color}>
      <polygon points="50,15 80,32 80,68 50,85 20,68 20,32" fill="none" stroke="currentColor" strokeWidth="8" strokeLinejoin="round" />
    </svg>
  );

  const drawNested = (outerShape: 'square' | 'circle', innerShape: 'square' | 'circle') => (color: string) => (
    <svg width="60" height="60" viewBox="0 0 100 100" className={color}>
      {outerShape === 'square' ? (
        <rect x="20" y="20" width="60" height="60" fill="none" stroke="currentColor" strokeWidth="8" strokeLinejoin="round" />
      ) : (
        <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="8" />
      )}
      {innerShape === 'square' ? (
        <rect x="35" y="35" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="6" strokeLinejoin="round" />
      ) : (
        <circle cx="50" cy="50" r="15" fill="none" stroke="currentColor" strokeWidth="6" />
      )}
    </svg>
  );

  const generateTrial = () => {
    setIsTransitioning(false);
    setFlashType(null);

    // Pick a random template pattern type
    const patternType = Math.floor(Math.random() * 4);
    let sequence: PatternItem[] = [];
    let correctAnswer: PatternItem;
    let options: PatternItem[] = [];
    let colorClass = "text-cyan-400";

    if (patternType === 0) {
      // Rotation Progression (0 -> 90 -> 180 -> 270 -> Answer: 0/360)
      const startAngle = Math.floor(Math.random() * 4) * 90;
      colorClass = "text-cyan-400";
      
      const angles = [
        startAngle % 360,
        (startAngle + 90) % 360,
        (startAngle + 180) % 360,
        (startAngle + 270) % 360
      ];

      sequence = angles.map(deg => ({
        id: `arrow-${deg}`,
        render: drawArrow(deg),
        value: `${deg}`
      }));

      const nextDeg = (startAngle + 360) % 360;
      correctAnswer = {
        id: `arrow-${nextDeg}`,
        render: drawArrow(nextDeg),
        value: `${nextDeg}`
      };

      // Distractors
      const distAngles = [
        (nextDeg + 90) % 360,
        (nextDeg + 180) % 360,
        (nextDeg + 270) % 360
      ];

      options = [
        correctAnswer,
        ...distAngles.map(deg => ({
          id: `arrow-dist-${deg}`,
          render: drawArrow(deg),
          value: `${deg}`
        }))
      ].sort(() => Math.random() - 0.5);

    } else if (patternType === 1) {
      // Alternating Color Pattern (Alternates layout or specific shape)
      // Circle -> Square -> Circle -> Square -> Answer: Circle
      colorClass = "text-purple-400";
      const circleItem: PatternItem = { id: 'circle-item', render: drawCircle(30), value: 'circle' };
      const squareItem: PatternItem = { id: 'square-item', render: drawSquare(28), value: 'square' };
      const triangleItem: PatternItem = { id: 'triangle-item', render: drawTriangle(28), value: 'triangle' };

      const rand = Math.random() > 0.5;
      const first = rand ? circleItem : squareItem;
      const second = rand ? squareItem : circleItem;

      sequence = [first, second, first, second];
      correctAnswer = first;

      options = [
        correctAnswer,
        second,
        triangleItem,
        { id: 'hex-item', render: drawHexagon(), value: 'hexagon' }
      ].sort(() => Math.random() - 0.5);

    } else if (patternType === 2) {
      // Alternate Size Scaling pattern (Large -> Small -> Large -> Small -> Answer: Large)
      colorClass = "text-amber-400";
      const sizeType = Math.random() > 0.5;
      
      const smallItem: PatternItem = {
        id: 'small-item',
        render: sizeType ? drawCircle(15) : drawSquare(15),
        value: 'small'
      };
      const largeItem: PatternItem = {
        id: 'large-item',
        render: sizeType ? drawCircle(32) : drawSquare(32),
        value: 'large'
      };

      sequence = [largeItem, smallItem, largeItem, smallItem];
      correctAnswer = largeItem;

      options = [
        correctAnswer,
        smallItem,
        { id: 'tri-dist', render: drawTriangle(20), value: 'triangle-dist' },
        { id: 'hex-dist', render: drawHexagon(), value: 'hexagon-dist' }
      ].sort(() => Math.random() - 0.5);

    } else {
      // Template D: Nested shapes alternation
      // Circle inside Square -> Square inside Circle -> Circle inside Square -> Square inside Circle -> Answer: Circle inside Square
      colorClass = "text-emerald-400";
      const itemA: PatternItem = { id: 'nest-cs', render: drawNested('square', 'circle'), value: 'cs' };
      const itemB: PatternItem = { id: 'nest-sc', render: drawNested('circle', 'square'), value: 'sc' };

      sequence = [itemA, itemB, itemA, itemB];
      correctAnswer = itemA;

      options = [
        correctAnswer,
        itemB,
        { id: 'dis-cs-1', render: drawCircle(28), value: 'pure-circle' },
        { id: 'dis-cs-2', render: drawSquare(28), value: 'pure-square' }
      ].sort(() => Math.random() - 0.5);
    }

    setCurrentTrial({
      type: `pattern-${patternType}`,
      sequence,
      correctAnswer,
      options,
      colorClass
    });

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

  const handleSelect = (selected: PatternItem) => {
    if (isTransitioning || timeLeft === 0 || !currentTrial) return;

    const now = performance.now();
    const solveTimeMs = now - startTimeRef.current;
    const isCorrect = selected.value === currentTrial.correctAnswer.value;

    setIsTransitioning(true);
    setFlashType(isCorrect ? 'success' : 'error');

    const trialData = {
      solveTimeMs,
      isCorrect,
      stallTimeMs: solveTimeMs > 4000 ? solveTimeMs : 0
    };

    setTrials(prev => [...prev, trialData]);

    if (isCorrect) {
      levelRef.current = levelRef.current + 1;
      setLevel(levelRef.current);
    }

    setTimeout(() => {
      generateTrial();
    }, 600);
  };

  return (
    <ScreenContainer id="game-four">
       <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-2 text-rose-500">
          <Timer className="w-5 h-5" />
          <span className="font-mono text-xl">{timeLeft}s</span>
        </div>
        <div className="flex items-center gap-2 text-emerald-400">
          <Puzzle className="w-5 h-5" />
          <span className="font-bold">লেভেল: {level}</span>
        </div>
      </div>

      <div className="flex flex-col items-center">
        <h2 className="text-xl font-medium text-slate-300 mb-8 h-8 text-center px-2">
          {isTransitioning && flashType === 'success' ? (
            <span className="text-emerald-400 font-bold">চমৎকার! সঠিক হয়েছে।</span>
          ) : isTransitioning && flashType === 'error' ? (
            <span className="text-rose-400 font-bold">ভুল উত্তর! আবার চেষ্টা করুন।</span>
          ) : (
            "পরবর্তী লজিক্যাল প্যাটার্নটি নির্বাচন করুন"
          )}
        </h2>

        {/* 1x5 Sequence display frame with final mystery block */}
        <div className="grid grid-cols-5 gap-2 p-4 bg-slate-900/40 border border-slate-800 rounded-2xl w-full mb-10 relative overflow-hidden">
          {currentTrial?.sequence.map((item, idx) => (
            <div key={idx} className="aspect-square bg-slate-950/60 border border-slate-900 rounded-xl flex items-center justify-center p-2">
              {item.render(currentTrial.colorClass)}
            </div>
          ))}
          <div className="aspect-square bg-slate-950/90 border border-cyan-500/30 rounded-xl flex items-center justify-center p-2 relative animate-pulse shadow-[0_0_15px_rgba(6,182,212,0.1)]">
            <span className="text-cyan-400 font-black text-2xl">?</span>
          </div>

          {/* Overlay state color flashes */}
          {flashType === 'success' && (
            <div className="absolute inset-0 bg-emerald-500/10 pointer-events-none border border-emerald-500/20 rounded-2xl transition-all duration-300" />
          )}
          {flashType === 'error' && (
            <div className="absolute inset-0 bg-rose-500/10 pointer-events-none border border-rose-500/20 rounded-2xl transition-all duration-300" />
          )}
        </div>

        {/* 2x2 option selectors */}
        <div className="grid grid-cols-2 gap-4 w-full">
          {currentTrial?.options.map((opt, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelect(opt)}
              className="p-6 rounded-2xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 flex items-center justify-center transition-all min-h-[100px] shadow-lg shadow-black/40"
            >
              {opt.render(currentTrial.colorClass)}
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
