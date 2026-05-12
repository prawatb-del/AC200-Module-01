import React, { useEffect } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import HomeScreen from './components/HomeScreen';
import SetupScreen from './components/SetupScreen';
import QuizScreen from './components/QuizScreen';
import ResultScreen from './components/ResultScreen';
import AdminScreen from './components/AdminScreen';
import { auth } from './lib/firebase';
import { signInAnonymously } from 'firebase/auth';

function MainContent() {
  const { currentStep } = useGame();

  useEffect(() => {
    // Initial Auth
    signInAnonymously(auth).catch(err => console.error("Firebase Auth Error:", err));
  }, []);

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen shadow-2xl relative overflow-hidden border-x-[12px] border-thai-blue uppercase tracking-tight">
      {currentStep === 'HOME' && <HomeScreen />}
      {currentStep === 'SETUP' && <SetupScreen />}
      {currentStep === 'QUIZ' && <QuizScreen />}
      {currentStep === 'RESULT' && <ResultScreen />}
      {currentStep === 'ADMIN' && <AdminScreen />}
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
