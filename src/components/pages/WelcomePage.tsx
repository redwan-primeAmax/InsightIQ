import React from 'react';
import { motion } from 'motion/react';
import { ScreenContainer } from '../layout/ScreenContainer';
import { Brain, Star, Activity, Eye, Zap, Layers } from 'lucide-react';

interface WelcomePageProps {
  onStart: () => void;
}

const domains = [
  { icon: Zap, title: 'ফোকাস', desc: 'তথ্যের মধ্যে সামঞ্জস্য ও অমিল দ্রুত চিহ্নিত করার ক্ষমতা।' },
  { icon: Layers, title: 'স্মৃতিশক্তি', desc: 'ভিজ্যুয়াল তথ্যের প্যাটার্ন মনে রাখার গভীরতা।' },
  { icon: Eye, title: 'স্থানিক সচেতনতা', desc: 'জ্যামিতিক গঠন এবং তাদের ঘূর্ণন বোঝার সক্ষমতা।' },
  { icon: Brain, title: 'প্যাটার্ন রিকগনিশন', desc: 'লজিক্যাল সিকোয়েন্স এবং প্যাটার্নের ধারাবাহিকতা নির্ণয়।' },
  { icon: Activity, title: 'আবেগ নিয়ন্ত্রণ', desc: 'তাৎক্ষণিক তাড়না দমন করে সঠিক সিদ্ধান্ত গ্রহণ।' },
  { icon: Star, title: 'ওয়ার্কিং মেমরি', desc: 'অল্প সময়ে একাধিক তথ্য মনে রেখে তা ব্যবহার করার ক্ষমতা।' },
];

export const WelcomePage: React.FC<WelcomePageProps> = ({ onStart }) => {
  return (
    <ScreenContainer id="welcome-page">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center mb-8"
      >
        <div className="inline-block p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 mb-4">
          <Brain className="w-12 h-12 text-cyan-400" />
        </div>
        <h1 className="text-5xl font-black tracking-tighter mb-2 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent italic">
          InsightIQ
        </h1>
        <p className="text-slate-400 text-sm">
          অত্যাধুনিক কগনিটিভ ডায়াগনস্টিক প্ল্যাটফর্ম
        </p>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 mb-10">
        {domains.map((domain, index) => (
          <motion.div
            key={domain.title}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 + index * 0.1 }}
            className="flex items-start gap-4 p-4 rounded-xl bg-slate-900/40 border border-slate-800/50 hover:border-cyan-500/30 transition-colors group"
          >
            <div className="p-2 rounded-lg bg-slate-800 text-cyan-400 group-hover:text-cyan-300 transition-colors">
              <domain.icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-100 text-sm mb-1">{domain.title}</h3>
              <p className="text-slate-400 text-xs leading-relaxed">{domain.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.button
        id="start-test-btn"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onStart}
        className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-500 text-white font-bold text-lg shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-all relative overflow-hidden group"
      >
        <span className="relative z-10">Cognitive Test শুরু করুন</span>
        <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
      </motion.button>
    </ScreenContainer>
  );
};
