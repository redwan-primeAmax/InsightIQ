import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ScreenContainer } from '../layout/ScreenContainer';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { Brain, Star, ChevronRight, Activity, Zap, Layers, Trophy, AlertCircle, Quote } from 'lucide-react';
import { AIReport, TelemetryData } from '../../types';
import * as Icons from 'lucide-react';

interface ResultPageProps {
  telemetry: TelemetryData;
}

export const ResultPage: React.FC<ResultPageProps> = ({ telemetry }) => {
  const [report, setReport] = useState<AIReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const analyzeData = async () => {
      try {
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ telemetry }),
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'এআই বিশ্লেষণ ব্যর্থ হয়েছে।');
        }
        setReport(data);
      } catch (err: any) {
        setError(err.message || 'এআই বিশ্লেষণ ব্যর্থ হয়েছে। অনুগ্রহ করে পুনরায় চেষ্টা করুন।');
      } finally {
        setLoading(false);
      }
    };

    analyzeData();
  }, [telemetry]);

  if (loading) {
    return (
      <ScreenContainer id="loading-screen" className="flex flex-col items-center justify-center">
        <motion.div
           animate={{ rotate: 360 }}
           transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
           className="relative mb-8"
        >
          <div className="w-24 h-24 rounded-full border-t-2 border-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.5)]" />
          <Brain className="absolute inset-0 m-auto w-10 h-10 text-cyan-400" />
        </motion.div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent animate-pulse">
            Neural Architecture বিশ্লেষণ করা হচ্ছে...
        </h2>
        <p className="text-slate-500 mt-4 text-sm max-w-xs text-center leading-relaxed">
            আপনার প্রতিক্রিয়ার মিলি-সেকেন্ড ডাটা এবং কগনিটিভ প্যাটার্ন এআই প্রসেস করছে।
        </p>
      </ScreenContainer>
    );
  }

  if (error || !report) {
    return (
       <ScreenContainer id="error-screen">
          <div className="text-center p-8 rounded-3xl bg-rose-500/10 border border-rose-500/20">
            <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">ত্রুটি ঘটেছে</h2>
            <p className="text-slate-400 mb-6">{error}</p>
            <button onClick={() => window.location.reload()} className="px-6 py-2 bg-rose-500 text-white rounded-xl">পুনরায় চেষ্টা করুন</button>
          </div>
       </ScreenContainer>
    );
  }

  const radarData = [
    { subject: 'ফোকাস', A: report.neuralArchitecture.focus },
    { subject: 'স্মৃতি', A: report.neuralArchitecture.memory },
    { subject: 'স্থানিক', A: report.neuralArchitecture.spatial },
    { subject: 'প্যাটার্ন', A: report.neuralArchitecture.pattern },
    { subject: 'ইমপালস', A: report.neuralArchitecture.impulse },
    { subject: 'ওয়ার্কিং', A: report.neuralArchitecture.workingMemory },
  ];

  // Helper to get icon by name
  const ArchetypeIcon = (Icons as any)[report.archetype.icon] || Icons.HelpCircle;

  return (
    <div className="min-h-screen bg-[#0B0B0F] text-white p-4 py-12 md:p-12 overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Module */}
        <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-center space-y-4"
        >
            <div className="inline-block py-1 px-3 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-bold text-cyan-400 uppercase tracking-widest">
                মাস্টারপিস এআই রিপোর্ট
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter">
                আপনার <span className="text-cyan-400">কগনিটিভ</span> প্রোফাইল
            </h1>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Module 1: Radar Chart */}
            <motion.div 
                 initial={{ scale: 0.9, opacity: 0 }}
                 animate={{ scale: 1, opacity: 1 }}
                 transition={{ delay: 0.2 }}
                 className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800/50 backdrop-blur-xl h-[400px] flex flex-col items-center"
            >
                <h3 className="text-lg font-bold text-slate-300 mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-cyan-400" />
                    Neural Architecture
                </h3>
                <div className="w-full h-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                            <PolarGrid stroke="#3f3f46" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#a1a1aa', fontSize: 12, fontWeight: 500 }} />
                            <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                            <Radar
                                name="Scores"
                                dataKey="A"
                                stroke="#f43f5e"
                                strokeWidth={3}
                                fill="#f43f5e"
                                fillOpacity={0.4}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

            {/* Module 2: Archetype Identity */}
            <motion.div 
                 initial={{ scale: 0.9, opacity: 0 }}
                 animate={{ scale: 1, opacity: 1 }}
                 transition={{ delay: 0.3 }}
                 className="p-8 rounded-3xl bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 backdrop-blur-xl flex flex-col items-center justify-center text-center group"
            >
                <div className="w-24 h-24 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-400/30 mb-6 shadow-[0_0_50px_rgba(99,102,241,0.3)] group-hover:scale-110 transition-transform">
                    <ArchetypeIcon className="w-12 h-12 text-indigo-400" />
                </div>
                <h2 className="text-3xl font-black text-white mb-1 uppercase italic tracking-tight">{report.archetype.name}</h2>
                <div className="text-indigo-300 font-bold text-sm uppercase tracking-widest mb-4">{report.archetype.title}</div>
                <p className="text-slate-400 text-sm leading-relaxed italic">"{report.archetype.description}"</p>
            </motion.div>
        </div>

        {/* Module 3: Deep Reality Cognitive Profile */}
        <motion.div 
             initial={{ y: 20, opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             transition={{ delay: 0.4 }}
             className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800/80 relative overflow-hidden"
        >
            <Quote className="absolute top-4 left-4 w-12 h-12 text-slate-800 opacity-20" />
            <h3 className="text-xl font-bold text-cyan-400 mb-6 flex items-center gap-2">
                <Brain className="w-6 h-6" />
                Deep Cognitive Analysis (99% Reality)
            </h3>
            <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed space-y-4">
                {report.deepProfile.split('\n').map((para, i) => (
                    <p key={i}>{para}</p>
                ))}
            </div>
        </motion.div>

        {/* Module 4 & 5 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div 
                 initial={{ x: -20, opacity: 0 }}
                 animate={{ x: 0, opacity: 1 }}
                 transition={{ delay: 0.5 }}
                 className="p-8 rounded-3xl bg-emerald-900/20 border border-emerald-500/20"
            >
                <h3 className="text-xl font-bold text-emerald-400 mb-6 flex items-center gap-2">
                    <Zap className="w-6 h-6" />
                    Bio-Hacks ও সমাধান
                </h3>
                <ul className="space-y-4">
                    {report.bioHacks.map((hack, i) => (
                        <li key={i} className="flex gap-4 items-start text-sm text-slate-300">
                            <div className="min-w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">{i+1}</div>
                            {hack}
                        </li>
                    ))}
                </ul>
            </motion.div>

            <motion.div 
                 initial={{ x: 20, opacity: 0 }}
                 animate={{ x: 0, opacity: 1 }}
                 transition={{ delay: 0.6 }}
                 className="p-8 rounded-3xl bg-purple-900/20 border border-purple-500/20 flex flex-col justify-between"
            >
                <div>
                   <h3 className="text-xl font-bold text-purple-400 mb-2 flex items-center gap-2">
                        <Trophy className="w-6 h-6" />
                        Global Benchmarking
                    </h3>
                    <p className="text-slate-400 text-xs mb-8">বিশ্বের সামগ্রিক জনসংখ্যার তুলনায় আপনার অবস্থান</p>
                </div>
                
                <div className="space-y-6">
                    <div className="relative h-4 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div 
                           initial={{ width: 0 }}
                           animate={{ width: `${report.percentile}%` }}
                           transition={{ duration: 2, delay: 1 }}
                           className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-600 to-indigo-500"
                        />
                    </div>
                    <div className="flex justify-between items-end">
                        <div className="text-slate-500 text-xs font-bold uppercase">Beginner</div>
                        <div className="text-center">
                            <span className="text-4xl md:text-5xl font-black text-white italic">
                              {report.percentile === 0 
                                ? "N/A" 
                                : `Top ${Math.min(99.9, Math.max(0.1, 100 - report.percentile)).toFixed(1)}%`
                              }
                            </span>
                            <div className="text-xs text-purple-400 font-bold uppercase tracking-widest mt-1">Global Thinkers</div>
                        </div>
                        <div className="text-slate-500 text-xs font-bold uppercase">Elite</div>
                    </div>
                </div>
            </motion.div>
        </div>

        <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            onClick={() => window.location.reload()}
            className="w-full py-4 rounded-xl border border-slate-800 text-slate-500 text-sm hover:text-slate-300 hover:bg-slate-900/50 transition-all"
        >
            নতুন সেশন শুরু করুন
        </motion.button>
      </div>
    </div>
  );
};
