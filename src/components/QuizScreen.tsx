import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGame } from '../context/GameContext';
import { QUESTIONS } from '../questions';
import { Clock, AlertCircle, CheckCircle2, ArrowRight, Home } from 'lucide-react';

export default function QuizScreen() {
  const { setStep, playerData, setPlayerData } = useGame();
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const currentQuestion = QUESTIONS[currentQuestionIdx];

  const MAX_TIME = 20;
  const GRACE_PERIOD = 3;

  useEffect(() => {
    startTimer();
    return () => stopTimer();
  }, [currentQuestionIdx]);

  const startTimer = () => {
    setElapsed(0);
    stopTimer();
    timerRef.current = setInterval(() => {
      setElapsed((prev) => {
        const next = Math.round((prev + 0.1) * 10) / 10;
        if (next >= MAX_TIME) {
          handleAnswer(-1); // Timeout
          return MAX_TIME;
        }
        return next;
      });
    }, 100);
  };

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const calculatePoints = (timeElapsed: number) => {
    if (timeElapsed <= GRACE_PERIOD) return 200;
    const penaltyRatio = (timeElapsed - GRACE_PERIOD) / (MAX_TIME - GRACE_PERIOD);
    return Math.max(0, Math.round(200 - (penaltyRatio * 200)));
  };

  const handleAnswer = (idx: number) => {
    if (isCorrect === true) return; // Prevent multiple clicks on correct answer

    const correctIdx = currentQuestion.getCorrectIndex(playerData);
    const isAnswerCorrect = idx === correctIdx;
    
    setSelectedOption(idx);
    setIsCorrect(isAnswerCorrect);

    if (isAnswerCorrect) {
      stopTimer();
      const points = calculatePoints(elapsed);
      setScore(prev => prev + points);
      setShowHint(false);
    } else {
      setScore(prev => Math.max(0, prev - 50));
      setShowHint(true);
    }
  };

  const handleNext = () => {
    if (currentQuestionIdx < QUESTIONS.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
      setSelectedOption(null);
      setIsCorrect(null);
      setShowHint(false);
    } else {
      setPlayerData({ totalScore: score });
      setStep('RESULT');
    }
  };

  const progress = ((currentQuestionIdx) / QUESTIONS.length) * 100;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-slate-200 sticky top-0 z-30">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className="h-full bg-thai-gold"
        />
      </div>

      <header className="px-6 py-6 border-b border-slate-200 bg-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              if(confirm('ต้องการออกจากการทำแบบทดสอบและกลับสู่หน้าหลักหรือไม่?')) {
                setStep('HOME');
              }
            }}
            className="p-2 -ml-2 text-slate-400 hover:text-thai-blue transition-colors"
          >
            <Home className="w-6 h-6" />
          </button>
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-thai">Question {currentQuestionIdx + 1}</h3>
            <p className="text-sm font-bold text-slate-700 font-thai">แบบทดสอบความรู้</p>
          </div>
        </div>

        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${elapsed > MAX_TIME - 5 ? 'border-red-200 bg-red-50 text-red-600' : 'border-slate-200 bg-slate-50 text-slate-600'}`}>
          <Clock className={`w-4 h-4 ${elapsed > MAX_TIME - 5 ? 'animate-pulse' : ''}`} />
          <span className="font-mono font-bold text-sm">{Math.ceil(MAX_TIME - elapsed)}s</span>
        </div>
      </header>

      <main className="flex-1 px-6 py-10 max-w-md mx-auto w-full flex flex-col">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-slate-800 font-thai leading-relaxed mb-4">
            {currentQuestion.text}
          </h2>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-thai">คะแนนที่ได้รับหากตอบถูก</span>
              <span className="text-sm font-bold text-thai-blue font-sans">{calculatePoints(elapsed)}</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
              <motion.div 
                initial={false}
                animate={{ 
                  width: `${(calculatePoints(elapsed) / 200) * 100}%`,
                  backgroundColor: elapsed <= GRACE_PERIOD ? '#1e3a8a' : '#d4af37' 
                }}
                className="h-full transition-colors"
              />
            </div>
            {elapsed <= GRACE_PERIOD && (
              <p className="text-[9px] text-green-600 font-bold font-thai">🔥 ช่วงเวลาโบนัส! คะแนนเต็ม 200</p>
            )}
          </div>

          <div className="flex items-center gap-2 mt-4">
             <div className="text-[10px] uppercase font-bold text-thai-gold px-2 py-0.5 border border-thai-gold/30 rounded">
               Score: {score}
             </div>
          </div>
        </div>

        <div className="space-y-4 flex-1">
          {currentQuestion.options.map((option, idx) => {
            const isSelected = selectedOption === idx;
            const isAnswerCorrect = idx === currentQuestion.getCorrectIndex(playerData);
            
            let statusClasses = "border-slate-200 hover:border-thai-blue/50 bg-white";
            if (isSelected) {
              statusClasses = isCorrect ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50";
            }

            return (
              <motion.button
                key={idx}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleAnswer(idx)}
                disabled={isCorrect === true}
                className={`w-full p-5 rounded-2xl border-2 text-left transition-all flex items-center justify-between group ${statusClasses}`}
              >
                <span className={`font-thai font-medium ${isSelected ? (isCorrect ? 'text-green-700' : 'text-red-700') : 'text-slate-600'}`}>
                  {option}
                </span>
                {isSelected && (
                  isCorrect ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <AlertCircle className="w-5 h-5 text-red-500" />
                )}
              </motion.button>
            );
          })}
        </div>

        <AnimatePresence>
          {showHint && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mt-6 p-4 bg-amber-50 border border-amber-100 rounded-xl flex gap-3"
            >
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-bold text-amber-800 uppercase tracking-widest mb-1">Law Hint</p>
                <p className="text-xs text-amber-700 font-thai leading-relaxed">{currentQuestion.hint}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-10">
          <button
            onClick={handleNext}
            disabled={!isCorrect}
            className={`w-full py-5 rounded-2xl font-thai font-bold flex items-center justify-center gap-3 transition-all ${
              isCorrect 
                ? 'bg-thai-blue text-white shadow-xl shadow-blue-200 text-lg' 
                : 'bg-slate-100 text-slate-300 cursor-not-allowed'
            }`}
          >
            {currentQuestionIdx === QUESTIONS.length - 1 ? 'ดูผลการทดสอบ' : 'ข้อถัดไป'}
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </main>
    </div>
  );
}
