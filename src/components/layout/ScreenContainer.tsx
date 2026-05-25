import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';

interface ScreenContainerProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export const ScreenContainer: React.FC<ScreenContainerProps> = ({ children, className, id }) => {
  return (
    <motion.div
      id={id}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className={cn(
        "min-h-screen w-full bg-[#0B0B0F] text-white overflow-hidden flex flex-col items-center justify-center p-6 relative",
        className
      )}
    >
      {/* Background radial gradients for atmosphere */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-900/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-900/10 rounded-full blur-[100px]" />
      
      <div className="relative z-10 w-full max-w-lg mx-auto">
        {children}
      </div>
    </motion.div>
  );
};
