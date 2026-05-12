import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGame } from '../context/GameContext';
import { SCENARIOS } from '../data/scenarios';
import Spreadsheet from './Spreadsheet';
import { ChevronLeft, Info, Send, CheckCircle2, AlertCircle, Lightbulb, SkipForward } from 'lucide-react';

export default function GameplayScreen() {
  const { gameState, updateGameState, setStep } = useGame();
  const scenario = SCENARIOS.find(s => s.id === gameState.currentLevel) || SCENARIOS[0];
  
  const [userInput, setUserInput] = useState('');
  const [status, setStatus] = useState<'IDLE' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [showHint, setShowHint] = useState(false);
  const [hintIndex, setHintIndex] = useState(0);
  const [scenarioStartTime, setScenarioStartTime] = useState(Date.now());
  const [attempts, setAttempts] = useState(0);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [displayValue, setDisplayValue] = useState<string | null>(null);

  useEffect(() => {
    setScenarioStartTime(Date.now());
    setCurrentTime(Date.now());
    setAttempts(0);
    setDisplayValue(null);
  }, [gameState.currentLevel]);

  // Score decay timer logic
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const elapsedSeconds = Math.round((currentTime - scenarioStartTime) / 1000);
  const gracePeriod = 10;
  const decayPenalty = Math.max(0, elapsedSeconds - gracePeriod) * 2;
  const potentialScore = Math.max(10, 100 - decayPenalty - (hintIndex * 20));

  const normalizeFormula = (input: string) => {
    return input.replace(/\s+/g, '').toUpperCase();
  };

  const getCalculatedValue = (id: number) => {
    switch (id) {
      case 1: return "700";
      case 2: return "22,500";
      case 3: return "20,100";
      case 4: return "44,900";
      case 5: return "2,250";
      case 6: return "APPROVE";
      case 7: return "BONUS";
      case 8: return "3,000";
      case 9: return "110";
      case 10: return "BUFFER";
      default: return "OK";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAttempts(prev => prev + 1);
    
    if (!userInput.startsWith('=')) {
      setStatus('ERROR');
      return;
    }

    const normalizedInput = normalizeFormula(userInput);
    const isCorrect = scenario.expectedFormula.some(expected => normalizeFormula(expected) === normalizedInput);

    if (isCorrect) {
      setStatus('SUCCESS');
      setDisplayValue(getCalculatedValue(scenario.id));
      
      const timeTaken = Math.round((Date.now() - scenarioStartTime) / 1000);
      const scenarioScore = potentialScore;
      const newScore = gameState.totalScore + scenarioScore;
      
      const scenarioLog = {
        scenarioId: scenario.id,
        timeTaken,
        score: scenarioScore,
        attempts: attempts + 1
      };

      setTimeout(() => {
        const nextLevel = gameState.currentLevel + 1;
        const newCompleted = [...new Set([...gameState.completedLevels, gameState.currentLevel])];
        const newLogs = [...gameState.scenariosLog, scenarioLog];
        
        updateGameState({
          totalScore: newScore,
          completedLevels: newCompleted,
          scenariosLog: newLogs
        });

        if (nextLevel > SCENARIOS.length) {
          setStep('RESULT');
        } else {
          updateGameState({ currentLevel: nextLevel });
          setUserInput('');
          setStatus('IDLE');
          setHintIndex(0);
          setShowHint(false);
          setDisplayValue(null);
        }
      }, 2000);
    } else {
      setStatus('ERROR');
      setTimeout(() => setStatus('IDLE'), 2000);
    }
  };

  const handleNextHint = () => {
    if (hintIndex < scenario.hints.length - 1) {
      setHintIndex(prev => prev + 1);
    }
    setShowHint(true);
  };

  const handleSkip = () => {
    const timeTaken = Math.round((Date.now() - scenarioStartTime) / 1000);
    const scenarioLog = {
      scenarioId: scenario.id,
      timeTaken,
      score: -50,
      attempts: attempts
    };

    const nextLevel = gameState.currentLevel + 1;
    const newCompleted = [...new Set([...gameState.completedLevels, gameState.currentLevel])];
    const newLogs = [...gameState.scenariosLog, scenarioLog];
    
    updateGameState({
      totalScore: gameState.totalScore - 50,
      completedLevels: newCompleted,
      scenariosLog: newLogs
    });

    if (nextLevel > SCENARIOS.length) {
      setStep('RESULT');
    } else {
      updateGameState({ currentLevel: nextLevel });
      setUserInput('');
      setStatus('IDLE');
      setHintIndex(0);
      setShowHint(false);
      setDisplayValue(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-slate-900 text-white p-4 flex items-center justify-between sticky top-0 z-20 shadow-lg">
        <div className="flex items-center gap-3">
          <button onClick={() => setStep('LEVEL_SELECT')} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-[10px] uppercase tracking-widest text-green-500 font-bold">Scenario {scenario.id}</h2>
            <h1 className="text-sm font-bold truncate max-w-[150px]">{scenario.title}</h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[8px] uppercase text-slate-500 font-bold">Efficiency</p>
            <div className="w-24 h-2.5 bg-slate-800/50 rounded-full mt-0.5 overflow-hidden border border-white/10">
               <motion.div 
                 initial={{ width: "100%" }}
                 animate={{ width: `${Math.max(10, (potentialScore / 100) * 100)}%` }}
                 className={`h-full transition-colors duration-500 ${potentialScore > 70 ? 'bg-green-500' : potentialScore > 30 ? 'bg-yellow-500' : 'bg-red-500'}`}
               />
            </div>
          </div>
          <div className="text-right">
            <p className="text-[8px] uppercase text-slate-500 font-bold">Total Score</p>
            <p className="text-xs font-mono font-bold text-green-500">{gameState.totalScore.toLocaleString()}</p>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row p-4 gap-4 overflow-hidden relative">
        {/* Left Panel: Problem (1/3 Width) */}
        <aside className="lg:w-1/3 flex flex-col gap-4 lg:sticky lg:top-4 h-fit shrink-0">
          <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm min-h-[450px]">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-500/10 rounded-xl flex items-center justify-center shrink-0">
                <Info className="w-4 h-4 text-blue-500" />
              </div>
              <div>
                <h3 className="text-[10px] uppercase font-bold text-slate-400 mb-1 tracking-widest">Business Case</h3>
                <p className="text-xs font-bold text-slate-900 mb-2">{scenario.title}</p>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {scenario.problem}
                </p>
              </div>
            </div>
          </section>

          {/* Hint Section */}
          <AnimatePresence>
            {showHint && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl flex items-start gap-3"
              >
                <Lightbulb className="w-4 h-4 text-yellow-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] uppercase font-bold text-yellow-700 mb-1">Internal Consultant Hint ({hintIndex + 1})</p>
                  <p className="text-xs italic text-yellow-800">{scenario.hints[hintIndex]}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </aside>

        {/* Center Panel: Spreadsheet */}
        <section className="flex-1 flex flex-col gap-2 overflow-hidden bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[10px] uppercase font-bold text-slate-400 tracking-widest flex items-center gap-2">
              <TableIcon className="w-3 h-3" /> Real-time Simulation Data
            </h3>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[9px] font-bold text-slate-400 uppercase">Live Sheet</span>
            </div>
          </div>
          <div className="flex-1 overflow-auto">
            <Spreadsheet 
              headers={scenario.headers}
              rowLabels={scenario.rowLabels}
              data={scenario.data.map(row => 
                row.map((cell, colIdx) => {
                  const cellAddress = String.fromCharCode(65 + colIdx) + (scenario.data.indexOf(row) + 1);
                  if (cellAddress === scenario.targetCell && displayValue) return displayValue;
                  return cell;
                })
              )}
              targetCell={scenario.targetCell}
              activeCell={scenario.targetCell}
            />
          </div>
          <p className="text-[9px] text-slate-400 mt-2 italic text-center">
            * Select cell {scenario.targetCell} and enter the correct formula to proceed.
          </p>
        </section>
      </main>

      {/* Formula Bar (Floating Bottom) */}
      <footer className="fixed bottom-0 left-0 right-0 p-4 bg-slate-900 border-t border-white/10 shadow-[0_-10px_25px_rgba(0,0,0,0.2)] z-30">
        <div className="max-w-lg mx-auto">
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="flex items-center justify-between mb-1">
              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${status === 'SUCCESS' ? 'bg-green-500' : status === 'ERROR' ? 'bg-red-500' : 'bg-blue-500'}`} />
                Excel Formula Bar
              </label>
              <div className="flex items-center gap-3">
                <button 
                  type="button"
                  onClick={handleNextHint}
                  className="text-[9px] font-bold text-green-500 hover:text-green-400 uppercase tracking-widest flex items-center gap-1 transition-colors"
                >
                  <Lightbulb className="w-3 h-3" /> Get Hint
                </button>
                <div className="w-px h-3 bg-white/10" />
                <button 
                  type="button"
                  onClick={handleSkip}
                  className="text-[9px] font-bold text-orange-400 hover:text-orange-300 uppercase tracking-widest flex items-center gap-1 transition-colors"
                >
                  <SkipForward className="w-3 h-3" /> Pass Scenario
                </button>
              </div>
            </div>
            
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-xl font-bold select-none">=</span>
              <input 
                type="text"
                value={userInput}
                onChange={(e) => {
                   let val = e.target.value;
                   if (val && !val.startsWith('=')) val = '=' + val;
                   setUserInput(val);
                }}
                placeholder="Enter formula here (e.g., =SUM...)"
                disabled={status === 'SUCCESS'}
                className={`w-full bg-black/50 border-2 rounded-xl pl-9 pr-12 py-4 font-mono text-lg transition-all focus:outline-none ${
                    status === 'SUCCESS' ? 'border-green-500 text-green-500 bg-green-500/10' :
                    status === 'ERROR' ? 'border-red-500 text-red-500 shake' :
                    'border-white/10 text-white focus:border-green-500'
                }`}
              />
              <button 
                type="submit"
                disabled={status === 'SUCCESS' || !userInput}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center hover:bg-green-400 transition-colors disabled:opacity-30 disabled:grayscale"
              >
                {status === 'SUCCESS' ? <CheckCircle2 className="w-5 h-5 text-slate-900" /> : <Send className="w-5 h-5 text-slate-900" />}
              </button>
            </div>

            {status === 'ERROR' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-red-400">
                <AlertCircle className="w-3 h-3" />
                <span className="text-[9px]">Syntax or Logic Error! Please re-verify your ranges and keywords.</span>
              </motion.div>
            )}

             {status === 'SUCCESS' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-green-400">
                <CheckCircle2 className="w-3 h-3" />
                <span className="text-[9px] italic font-bold">Calculated! Analysis verified. Synchronizing next module...</span>
              </motion.div>
            )}
          </form>
        </div>
      </footer>
    </div>
  );
}

function TableIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3h18v18H3z"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M9 3v18"/><path d="M15 3v18"/>
    </svg>
  );
}
