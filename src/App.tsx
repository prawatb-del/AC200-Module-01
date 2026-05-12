import React, { useEffect, useState } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import HomeScreen from './components/HomeScreen';
import LevelSelect from './components/LevelSelect';
import GameplayScreen from './components/GameplayScreen';
import AuthScreen from './components/AuthScreen';
import ResultScreen from './components/ResultScreen';
import AdminScreen from './components/AdminScreen';
import { auth } from './lib/firebase';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { AlertCircle } from 'lucide-react';

function MainContent() {
  const { currentStep, setStep } = useGame();
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // Listen for auth state
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("Authenticated as:", user.uid);
        setAuthError(null);
      }
    });

    // Initial Auth
    const tryAuth = async () => {
      try {
        await signInAnonymously(auth);
        setAuthError(null);
      } catch (err: any) {
        console.error("Firebase Auth Error:", err);
        if (err.code === 'auth/admin-restricted-operation') {
          setAuthError('Anonymous Login is disabled in Firebase Console. Please enable it to save your results.');
        } else {
          setAuthError(err.message);
        }
      }
    };
    
    tryAuth();

    // Secret Admin Access via URL: ?admin=true
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('admin') === 'true') {
      setStep('ADMIN');
    }

    return () => unsubscribe();
  }, [setStep]);

  return (
    <div className="w-full min-h-screen bg-slate-900 flex justify-center items-start lg:items-center overflow-x-hidden font-sans">
      <div className="w-full max-w-lg bg-white min-h-screen lg:min-h-[850px] lg:my-8 shadow-2xl relative overflow-hidden transition-all duration-300 lg:rounded-2xl flex flex-col">
        {/* Status Bar for Auth Errors */}
        {authError && (
          <div className="bg-slate-900 text-white p-5 text-xs flex items-start gap-4 z-50 border-b-2 border-green-500 shadow-xl">
            <AlertCircle className="w-6 h-6 shrink-0 text-green-500 animate-bounce mt-1" />
            <div className="flex-1 space-y-2">
              <p className="font-bold text-green-500 uppercase tracking-[0.1em] text-sm">System Connection Issue</p>
              <div className="space-y-1.5 opacity-90 leading-relaxed">
                <p>Unable to connect to Cloud Database. Please verify Firebase Anonymous Auth is enabled:</p>
                <ol className="list-decimal list-inside space-y-1 ml-1 opacity-80">
                  <li>Firebase Console &gt; Authentication &gt; Sign-in method</li>
                  <li>Enable <b>Anonymous</b> provider</li>
                </ol>
              </div>
              <div className="pt-3 flex items-center gap-4">
                <a 
                  href="https://console.firebase.google.com" 
                  target="_blank" 
                  rel="noreferrer"
                  className="bg-green-500 text-slate-900 px-4 py-1.5 rounded-full font-bold hover:bg-white transition-all shadow-lg active:scale-95"
                >
                  Configure Firebase
                </a>
                <button 
                  onClick={() => setAuthError(null)}
                  className="text-slate-400 hover:text-white transition-colors underline text-[10px]"
                >
                  Continue Offline
                </button>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex-1 overflow-y-auto bg-slate-900">
          {currentStep === 'HOME' && <HomeScreen />}
          {currentStep === 'AUTH' && <AuthScreen />}
          {currentStep === 'LEVEL_SELECT' && <LevelSelect />}
          {currentStep === 'GAMEPLAY' && <GameplayScreen />}
          {currentStep === 'RESULT' && <ResultScreen />}
          {currentStep === 'ADMIN' && <AdminScreen />}
          
          {/* Safety Fallback */}
          {!['HOME', 'AUTH', 'LEVEL_SELECT', 'GAMEPLAY', 'RESULT', 'ADMIN'].includes(currentStep) && (
            <div className="h-full flex items-center justify-center p-12 text-center">
              <div>
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-2">Navigation Error</h2>
                <p className="text-slate-500 text-sm mb-6">The system lost track of the current module phase ({currentStep})</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold"
                >
                  Reboot System
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <GameProvider>
      <MainContent />
    </GameProvider>
  );
}
