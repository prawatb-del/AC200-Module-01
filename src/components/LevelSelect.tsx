import React from 'react';
import { motion } from 'motion/react';
import { useGame } from '../context/GameContext';
import { SCENARIOS } from '../data/scenarios';
import { ChevronLeft, Lock, CheckCircle2, ChevronRight, Trophy } from 'lucide-react';

export default function LevelSelect() {
  const { setStep, gameState, updateGameState } = useGame();

  const handleLevelSelect = (levelId: number) => {
    // Only allow if previous levels are completed or it's the first level
    if (levelId === 1 || gameState.completedLevels.includes(levelId - 1)) {
      updateGameState({ currentLevel: levelId });
      setStep('GAMEPLAY');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      <header className="p-6 flex items-center justify-between border-b border-white/5 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-20">
        <button 
          onClick={() => setStep('HOME')}
          className="p-2 -ml-2 text-slate-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-green-500">Training Modules</h2>
        <div className="flex items-center gap-2 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
          <Trophy className="w-3 h-3 text-green-500" />
          <span className="text-[10px] font-bold text-white">{gameState.totalScore}</span>
        </div>
      </header>

      <main className="flex-1 p-6 space-y-4">
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-1">Select your Scenario</h3>
          <p className="text-xs text-slate-500">Initiate training modules based on data complexity.</p>
        </div>

        <div className="space-y-4">
          {SCENARIOS.map((scenario) => {
            const isCompleted = gameState.completedLevels.includes(scenario.id);
            const isLocked = scenario.id !== 1 && !gameState.completedLevels.includes(scenario.id - 1);
            
            return (
              <motion.button
                key={scenario.id}
                whileHover={!isLocked ? { x: 4 } : {}}
                whileTap={!isLocked ? { scale: 0.98 } : {}}
                onClick={() => handleLevelSelect(scenario.id)}
                disabled={isLocked}
                className={`w-full p-5 rounded-2xl border flex items-center justify-between transition-all text-left relative overflow-hidden group ${
                  isLocked 
                    ? 'bg-slate-900/40 border-white/5 opacity-50 grayscale' 
                    : isCompleted
                      ? 'bg-green-500/5 border-green-500/30'
                      : 'bg-white/5 border-white/10 hover:border-green-500/50'
                }`}
              >
                {isCompleted && (
                  <div className="absolute top-0 right-0 p-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  </div>
                )}
                
                <div className="flex gap-4 items-center">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg ${
                    isLocked ? 'bg-slate-800' : isCompleted ? 'bg-green-500 text-slate-900' : 'bg-white/10 text-white'
                  }`}>
                    {scenario.id < 10 ? `0${scenario.id}` : scenario.id}
                  </div>
                  
                  <div>
                    <h4 className="font-bold text-sm mb-1">{scenario.title}</h4>
                    <p className="text-[10px] text-slate-500 font-thai line-clamp-1">{scenario.problem}</p>
                  </div>
                </div>

                <div>
                  {isLocked ? <Lock className="w-4 h-4 text-slate-700" /> : <ChevronRight className="w-5 h-5 text-green-500" />}
                </div>
              </motion.button>
            );
          })}
        </div>
      </main>

      <footer className="p-6 border-t border-white/5 text-center">
        <p className="text-[10px] text-slate-600 uppercase tracking-widest font-bold">
          Master SUM, AVERAGE, IF, VLOOKUP & More
        </p>
      </footer>
    </div>
  );
}
