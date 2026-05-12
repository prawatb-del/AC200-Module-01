import React from 'react';
import { motion } from 'motion/react';
import { useGame } from '../context/GameContext';
import { Table, BarChart3, Database, Play, Award } from 'lucide-react';

export default function HomeScreen() {
  const { setStep } = useGame();
  const [adminClicks, setAdminClicks] = React.useState(0);

  const handleAdminTrigger = () => {
    setAdminClicks(prev => prev + 1);
  };

  return (
    <div className="min-h-screen flex flex-col pt-12 pb-8 px-6 bg-slate-900 text-white overflow-hidden relative">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 blur-[100px] rounded-full" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full" />
      
      {/* Excel-like Grid Pattern Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '100px 40px' }} />

      <header className="text-center z-10">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 bg-green-600 rounded-3xl mx-auto flex items-center justify-center shadow-2xl shadow-green-500/20 mb-6 border-b-8 border-green-800"
        >
          <Table className="w-12 h-12 text-white" strokeWidth={2.5} />
        </motion.div>
        
        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-4xl font-black mb-2 tracking-tight text-white uppercase italic"
        >
          AC432 BU <span className="text-green-500">EXCEL MASTER 11</span>
        </motion.h1>
        
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-slate-400 text-sm tracking-wide max-w-xs mx-auto mb-12"
        >
          Master advanced Business Analyst logic through 10 challenging scenarios using IF and SUMIF formulas.
        </motion.p>
      </header>

      <main className="flex-1 flex flex-col gap-6 z-10">
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
              <BarChart3 className="text-green-500 mb-2 w-5 h-5" />
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Skill Focus</p>
              <p className="text-xs font-bold">Sales Analysis</p>
            </div>
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
              <Database className="text-blue-500 mb-2 w-5 h-5" />
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Data Level</p>
              <p className="text-xs font-bold">Enterprise Logic</p>
            </div>
          </div>

          <button 
            onClick={() => setStep('AUTH')}
            className="w-full bg-green-500 hover:bg-green-400 text-slate-900 font-bold py-6 rounded-2xl shadow-xl shadow-green-500/20 flex items-center justify-center gap-3 active:scale-95 transition-all"
          >
            <Play className="fill-slate-900 w-5 h-5" />
            <span className="text-lg">START TRAINING</span>
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 bg-green-900/20 border border-green-500/20 p-6 rounded-3xl"
        >
          <h3 className="flex items-center gap-2 text-green-500 font-bold text-xs uppercase tracking-widest mb-4">
            <Award className="w-4 h-4" /> Assessment Objectives (Total: 1,000 Points)
          </h3>
          <ul className="space-y-2 text-[11px] text-slate-300">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              Conditional Logic: Advanced IF nesting
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              Criteria Summing: Complex SUMIF ranges
            </li>
            <li className="flex items-center gap-2 font-bold text-green-400">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              10 Dynamic Scenarios (Easy to Very Hard)
            </li>
          </ul>
        </motion.div>
      </main>

      <footer className="mt-8 py-8 text-center opacity-40 text-[10px] uppercase tracking-[0.2em] z-10 flex flex-col items-center gap-4 text-slate-500">
        <p onClick={handleAdminTrigger} className="cursor-default select-none">
          Enterprise Business Analyst Training v2.0
        </p>
        
        {adminClicks >= 5 && (
          <motion.button 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => setStep('ADMIN')}
            className="px-4 py-2 border border-green-500/50 rounded-full bg-green-500/10 hover:bg-green-500/20 transition-all text-green-500 font-bold"
          >
            Admin Panel Unlocked
          </motion.button>
        )}
      </footer>
    </div>
  );
}
