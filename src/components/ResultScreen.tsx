import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useGame } from '../context/GameContext';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Trophy, ArrowLeft, Loader2, Mail, CheckCircle2, AlertCircle, FileText, Download, Briefcase, User, Calendar } from 'lucide-react';
import { handleFirestoreError, OperationType } from '../lib/firestore-utils';

export default function ResultScreen() {
  const { gameState, setStep, resetGame } = useGame();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adminClicks, setAdminClicks] = useState(0);

  const handleAdminTrigger = () => {
    setAdminClicks(prev => prev + 1);
  };

  const handleReturnHome = () => {
    resetGame();
    setStep('HOME');
  };

  useEffect(() => {
    if (gameState.playerEmail) {
      setEmail(gameState.playerEmail);
    }
  }, [gameState.playerEmail]);

  const isValidEmail = (email: string) => {
    const lower = email.toLowerCase();
    return lower.endsWith('@bumail.net') || lower.endsWith('@bu.ac.th');
  };

  const sendResultToGAS = async (data: any) => {
    const GAS_URL = import.meta.env.VITE_GAS_URL;
    
    if (!GAS_URL || GAS_URL.includes('YOUR_SCRIPT_ID')) {
      console.warn('System Notice: Google Apps Script URL is not configured. Email notification will be inactive.');
      return false;
    }

    console.log('Transmitting result to audit system:', data);
    try {
       await fetch(GAS_URL, {
         method: 'POST',
         mode: 'no-cors', 
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(data)
       });
       return true;
    } catch (e) {
      console.error('Transmission error during audit:', e);
      return false;
    }
  };

  const handleSubmit = async () => {
    if (!isValidEmail(email)) {
      setError('Please use @bumail.net or @bu.ac.th email addresses only.');
      return;
    }

    if (!auth.currentUser) {
      setError('Authentication system is unavailable. Please check Firebase configuration.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const path = 'excel_master_results';
    try {
      const totalTime = gameState.scenariosLog.reduce((acc, log) => acc + log.timeTaken, 0);
      
      const payload = {
        playerName: gameState.playerName || 'Anonymous Analyst',
        email: email.toLowerCase(),
        score: gameState.totalScore,
        completedLevels: gameState.completedLevels.length,
        totalTimeTaken: totalTime,
        detailedLogs: gameState.scenariosLog,
        userId: auth.currentUser.uid,
        timestamp: new Date().toISOString(),
      };

      try {
        await addDoc(collection(db, path), {
          ...payload,
          timestamp: serverTimestamp(),
        });
      } catch (fErr) {
        handleFirestoreError(fErr, OperationType.WRITE, path);
      }
      
      await sendResultToGAS(payload);
      setIsSubmitted(true);
    } catch (err: any) {
      setError('An error occurred during submission. System might be offline.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalTime = gameState.scenariosLog.reduce((acc, log) => acc + log.timeTaken, 0);

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col font-sans p-4 sm:p-8">
      <header className="mb-8 flex justify-between items-start max-w-2xl mx-auto w-full">
        <div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter">Performance <span className="text-green-500">Report</span></h1>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Audit ID: EX-{Math.random().toString(36).substr(2, 6).toUpperCase()}</p>
        </div>
        <div className="bg-green-500/10 border border-green-500/20 px-3 py-1 rounded text-[10px] font-black text-green-500 uppercase tracking-widest"> Verified Analyst </div>
      </header>

      <main className="max-w-2xl mx-auto w-full space-y-6">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-3xl overflow-hidden shadow-2xl relative"
        >
          {/* Internal Header */}
          <div className="bg-slate-900 p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-green-500" />
              <span className="text-xs font-black uppercase tracking-widest text-white italic">Analytical Assessment Summary</span>
            </div>
            <div className="text-[10px] text-slate-500 font-bold uppercase">{new Date().toLocaleDateString()}</div>
          </div>

          <div className="p-8 space-y-8 text-slate-900">
            {/* Subject Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 border-b border-slate-100 pb-8">
              <div>
                <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">Subject Name</label>
                <div className="flex items-center gap-2">
                  <User className="w-3 h-3 text-slate-400" />
                  <span className="text-sm font-black text-slate-900 uppercase">{gameState.playerName}</span>
                </div>
              </div>
              <div>
                <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">Institution Identity (Audit Target)</label>
                {!isSubmitted ? (
                  <div className="relative group">
                    <Mail className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 group-focus-within:text-green-500 transition-colors" />
                    <input 
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name.s@bumail.net"
                      className="w-full bg-transparent border-b border-slate-200 pl-6 pr-2 py-1 text-sm font-black text-slate-900 uppercase focus:outline-none focus:border-green-500 transition-all font-mono"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3 h-3 text-green-500" />
                    <span className="text-sm font-black text-slate-900 uppercase truncate">{email}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Metric Grids */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Modules Cleared</label>
                <span className="text-xl font-black text-slate-900 italic">{gameState.completedLevels.length}/10</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Time</label>
                <span className="text-xl font-black text-slate-900 italic">{totalTime}s</span>
              </div>
              <div className="bg-green-500 p-4 rounded-2xl shadow-lg shadow-green-500/20">
                <label className="block text-[8px] font-black text-white uppercase tracking-widest mb-1">Performance DX</label>
                <span className="text-xl font-black text-white italic">{gameState.totalScore.toLocaleString()}</span>
              </div>
            </div>

            {/* Modular Logs */}
            <div>
              <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-3">Modular Breakdown</label>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {gameState.scenariosLog.map((log, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-slate-50/50 p-3 rounded-xl border border-slate-100 text-[10px]">
                    <div className="flex items-center gap-3">
                      <span className="w-5 h-5 bg-slate-900 text-white rounded flex items-center justify-center font-black">{log.scenarioId}</span>
                      <span className="font-bold text-slate-600 uppercase">Module {log.scenarioId} Verification</span>
                    </div>
                    <div className="flex gap-4 font-mono font-bold">
                       <span className="text-slate-400">{log.timeTaken}s</span>
                       <span className={`text-green-600 ${log.score < 0 ? 'text-red-500' : ''}`}>{log.score > 0 ? '+' : ''}{log.score}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Submission Section */}
            {!isSubmitted ? (
              <div className="pt-4 space-y-4">
                {error && (
                  <div className="bg-red-50 text-red-500 p-3 rounded-xl flex items-center gap-2 text-[10px] font-bold border border-red-100">
                    <AlertCircle className="w-4 h-4" /> {error}
                  </div>
                )}
                <button 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 shadow-xl transition-all active:scale-95 disabled:opacity-50 uppercase tracking-widest text-xs"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      Sign Audit & Commit to Cloud
                    </>
                  )}
                </button>
              </div>
            ) : (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-green-50 border-2 border-green-200 p-8 rounded-3xl text-center"
              >
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/20">
                  <CheckCircle2 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-1 uppercase tracking-tighter italic">Data Certified</h3>
                <p className="text-slate-600 text-[10px] font-bold uppercase tracking-widest mb-6">
                  Milestones saved successfully. Record transmitted to central audit system.
                </p>
                <button 
                  onClick={handleReturnHome}
                  className="w-full bg-slate-900 text-white text-sm font-black py-5 rounded-2xl uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl active:scale-95"
                >
                  Return to Base
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>

        {!isSubmitted && (
          <button 
            onClick={handleReturnHome}
            className="w-full bg-slate-800 hover:bg-slate-700 text-white py-5 rounded-2xl uppercase tracking-widest text-[11px] font-black transition-all flex items-center justify-center gap-2 shadow-xl border border-white/5 font-sans"
          >
            <ArrowLeft className="w-4 h-4 text-green-500" /> Return to Home Page / Restart Assessment
          </button>
        )}
      </main>

      <footer className="mt-auto py-8 text-center opacity-20">
        <p onClick={handleAdminTrigger} className="text-[7px] text-slate-500 uppercase tracking-[0.3em] font-black cursor-default select-none">
          AC432 SECURITY PROTOCOL • OFFICIAL ACADEMIC ASSESSMENT RECORD • BU-DXS v2.4
        </p>
        {adminClicks >= 5 && (
          <button 
            onClick={() => setStep('ADMIN')}
            className="mt-2 px-3 py-1 border border-green-500/50 rounded-full bg-green-500/10 text-green-500 text-[8px] font-bold uppercase tracking-widest"
          >
            Admin Panel Unlocked
          </button>
        )}
      </footer>
    </div>
  );
}
