import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGame } from '../context/GameContext';
import { db, auth } from '../lib/firebase';
import { signInAnonymously } from 'firebase/auth';
import { collection, addDoc, serverTimestamp, query, where, getDocs, limit } from 'firebase/firestore';
import { Mail, ShieldCheck, ArrowRight, Loader2, AlertCircle, Key, CheckCircle2 } from 'lucide-react';
import { handleFirestoreError, OperationType } from '../lib/firestore-utils';

export default function AuthScreen() {
  const { setStep, updateGameState } = useGame();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setLocalStep] = useState<'EMAIL' | 'PASSWORD'>('EMAIL');
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [showCodePopup, setShowCodePopup] = useState(false);

  const isValidEmail = (email: string) => {
    const lower = email.toLowerCase();
    return lower.endsWith('@bumail.net') || lower.endsWith('@bu.ac.th');
  };

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(email)) {
      setError('Please use a valid @bumail.net or @bu.ac.th email address.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // 1. Ensure signed in
      if (!auth.currentUser) {
        await signInAnonymously(auth);
      }

      // 1. Generate 6 digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      
      // 2. Log to Firestore
      const logPath = 'access_codes';
      try {
        await addDoc(collection(db, logPath), {
          email: email.toLowerCase(),
          code: code,
          timestamp: serverTimestamp(),
          used: false
        });
      } catch (fireErr) {
        handleFirestoreError(fireErr, OperationType.WRITE, logPath);
      }

      setGeneratedCode(code);
      setShowCodePopup(true);
    } catch (err: any) {
      setError('System Error: Unable to initiate verification. Check connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClosePopup = () => {
    setShowCodePopup(false);
    setLocalStep('PASSWORD');
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === generatedCode) {
      updateGameState({ 
        playerEmail: email, 
        isLoggedIn: true,
        playerName: email.split('@')[0]
      });
      setStep('LEVEL_SELECT');
    } else {
      setError('Invalid access code. Please try again.');
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col p-4 sm:p-8 font-sans relative">
      {/* Code Display Popup */}
      <AnimatePresence>
        {showCodePopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm bg-blue-600 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-white/20" />
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Key className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-black mb-2 uppercase italic tracking-tight">Access Code Generated</h3>
              <p className="text-xs text-blue-100 mb-8 uppercase tracking-wide opacity-80">
                Your Access Code is:
              </p>
              
              <div className="bg-white/10 border-2 border-white/20 rounded-2xl py-6 mb-8">
                <span className="text-5xl font-black tracking-[0.2em] text-white font-mono ml-[0.2em]">{generatedCode}</span>
              </div>
              
              <button 
                onClick={handleClosePopup}
                className="w-full bg-white text-blue-600 font-black py-4 rounded-xl transition-all active:scale-95 shadow-lg uppercase tracking-widest text-sm"
              >
                Copy & Continue
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <header className="mb-8 pt-4 sm:mb-12 sm:pt-8 max-w-sm mx-auto w-full">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-blue-500/20"
        >
          <ShieldCheck className="w-8 h-8 text-white" />
        </motion.div>
        <h1 className="text-3xl font-black italic tracking-tight uppercase">User <span className="text-blue-500">Access</span></h1>
        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-2">Analytical Environment Login</p>
      </header>

      <main className="flex-1 max-w-sm w-full mx-auto">
        <AnimatePresence mode="wait">
          {step === 'EMAIL' ? (
            <motion.div
              key="email"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="space-y-6"
            >
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Institutional Email</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                  <input 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name.s@bumail.net"
                    className="w-full bg-black/40 border-2 border-white/5 rounded-xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-blue-500 transition-all font-mono"
                    autoFocus
                  />
                </div>
                <p className="mt-2 text-[9px] text-slate-500 uppercase font-bold tracking-tight">Allowed domains: bumail.net, bu.ac.th</p>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-500 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <p className="text-[10px] font-bold">{error}</p>
                </div>
              )}

              <button 
                onClick={handleRequestCode}
                disabled={isSubmitting || !email}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-5 rounded-xl flex items-center justify-center gap-2 shadow-xl shadow-blue-500/10 active:scale-95 transition-all disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    <span className="uppercase tracking-widest text-sm">Request Access Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="password"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="space-y-6"
            >
              <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl mb-4">
                <div className="flex items-center gap-3 text-blue-400 mb-1">
                  <Key className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Verification Required</span>
                </div>
                <p className="text-xs text-slate-400">Please enter the 6-digit access code displayed in the previous step for <span className="text-white font-bold">{email}</span>.</p>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">6-Digit Access Code</label>
                <div className="relative group">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                  <input 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="000000"
                    maxLength={6}
                    className="w-full bg-black/40 border-2 border-white/5 rounded-xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-blue-500 transition-all font-mono text-2xl tracking-[0.5em] text-center"
                    autoFocus
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-500 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <p className="text-[10px] font-bold">{error}</p>
                </div>
              )}

              <button 
                onClick={handleVerify}
                disabled={password.length !== 6}
                className="w-full bg-green-600 hover:bg-green-500 text-slate-900 font-black py-5 rounded-xl flex items-center justify-center gap-2 shadow-xl shadow-green-500/10 active:scale-95 transition-all disabled:opacity-50"
              >
                <span className="uppercase tracking-widest text-sm text-white">Unlock Training</span>
              </button>

              <button 
                onClick={() => setLocalStep('EMAIL')}
                className="w-full text-slate-500 hover:text-white py-2 text-[10px] transition-colors uppercase font-bold tracking-widest"
              >
                Change Email Address
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>


      <footer className="mt-auto py-8 text-center">
        <p className="text-[10px] text-slate-600 uppercase tracking-widest font-bold">
          Domain Restricted: BU Network Access
        </p>
      </footer>
    </div>
  );
}
