import React, { useEffect, useState } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import HomeScreen from './components/HomeScreen';
import SetupScreen from './components/SetupScreen';
import QuizScreen from './components/QuizScreen';
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
    <div className="w-full min-h-screen bg-slate-100 flex justify-center items-start lg:items-center overflow-x-hidden">
      <div className="w-full max-w-lg bg-white min-h-screen lg:min-h-[850px] lg:my-8 shadow-2xl relative overflow-hidden border-x-[12px] border-thai-blue transition-all duration-300 lg:rounded-2xl flex flex-col">
        {authError && (
          <div className="bg-slate-900 text-white p-5 text-xs flex items-start gap-4 font-thai z-50 border-b-2 border-thai-gold shadow-xl">
            <AlertCircle className="w-6 h-6 shrink-0 text-thai-gold animate-bounce mt-1" />
            <div className="flex-1 space-y-2">
              <p className="font-bold text-thai-gold uppercase tracking-[0.1em] text-sm">การตั้งค่าไม่สมบูรณ์เพื่อบันทึกผล</p>
              <div className="space-y-1.5 opacity-90 leading-relaxed font-thai">
                <p>กรุณาเปิดใช้งาน <b>Anonymous Sign-in</b> ใน Firebase Console:</p>
                <ol className="list-decimal list-inside space-y-1 ml-1 opacity-80">
                  <li>ไปที่เมนู <span className="text-thai-gold">Build</span> (ไอคอนรูปค้อน 🔨)</li>
                  <li>เลือกเมนู <span className="text-thai-gold">Authentication</span></li>
                  <li>คลิกแถบ <span className="text-thai-gold">Sign-in method</span></li>
                  <li>กดปุ่ม <span className="text-thai-gold">Add new provider</span> และเลือก <span className="text-thai-gold">Anonymous</span></li>
                </ol>
              </div>
              <div className="pt-3 flex items-center gap-4">
                <a 
                  href="https://console.firebase.google.com" 
                  target="_blank" 
                  rel="noreferrer"
                  className="bg-thai-gold text-slate-900 px-4 py-1.5 rounded-full font-bold hover:bg-white transition-all shadow-lg active:scale-95"
                >
                  ไปที่ Firebase Console
                </a>
                <button 
                  onClick={() => setAuthError(null)}
                  className="text-slate-400 hover:text-white transition-colors underline text-[10px]"
                >
                  ข้ามไปก่อน (จะไม่บันทึกคะแนน)
                </button>
              </div>
            </div>
          </div>
        )}
        <div className="flex-1 overflow-y-auto">
          {currentStep === 'HOME' && <HomeScreen />}
          {currentStep === 'SETUP' && <SetupScreen />}
          {currentStep === 'QUIZ' && <QuizScreen />}
          {currentStep === 'RESULT' && <ResultScreen />}
          {currentStep === 'ADMIN' && <AdminScreen />}
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
