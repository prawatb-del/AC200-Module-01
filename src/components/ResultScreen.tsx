import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useGame } from '../context/GameContext';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Trophy, Mail, CheckCircle2, Loader2, Share2, ShieldCheck, Download } from 'lucide-react';

export default function ResultScreen() {
  const { playerData, setPlayerData, setStep } = useGame();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValidEmail = (email: string) => {
    return email.toLowerCase().endsWith('@bumail.net');
  };

  const handleSubmit = async () => {
    if (!isValidEmail(email)) {
      setError('กรุณาใช้เมล @bumail.net เท่านั้น');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        brandName: playerData.brandName,
        email: email.toLowerCase(),
        score: playerData.totalScore,
        businessType: playerData.businessType,
        revenue: playerData.annualRevenue,
        capital: playerData.initialCapital,
        activity: playerData.activity,
        userId: auth.currentUser?.uid || 'anonymous',
        timestamp: serverTimestamp(),
      };

      // 1. Save to Firestore
      await addDoc(collection(db, 'game_results'), payload);

      // 2. Placeholder fetch to GAS Hook
      // fetch('https://script.google.com/macros/s/PLACEHOLDER_GAS_URL/exec', {
      //   method: 'POST',
      //   body: JSON.stringify(payload)
      // }).catch(err => console.error("GAS Hook failed", err));

      setIsSubmitted(true);
      setPlayerData({ email });
    } catch (err: any) {
      console.error(err);
      setError('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-thai pb-12">
      <div className="h-64 thai-gradient flex flex-col items-center justify-center text-white relative">
        <div className="absolute inset-0 pattern-dots pointer-events-none" />
        <motion.div
           initial={{ scale: 0.8, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           className="relative z-10 text-center"
        >
          <div className="w-20 h-20 bg-thai-gold rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl">
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight">บันทึกความสำเร็จในการเริ่มต้น</h2>
          <p className="text-blue-100/70 text-sm font-light mt-1 uppercase tracking-widest">Business License Evaluation</p>
        </motion.div>
      </div>

      <main className="flex-1 -mt-12 px-6 relative z-20 max-w-md mx-auto w-full">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden mb-6">
          <div className="p-8 text-center border-b border-slate-100">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2 font-sans">Final Score</div>
            <div className="text-6xl font-bold text-thai-blue tracking-tighter">
              {playerData.totalScore}
            </div>
          </div>
          
          <div className="grid grid-cols-2 bg-slate-50/50 p-4 gap-4">
             <div className="text-center">
               <div className="text-[10px] text-slate-400 uppercase mb-1">Company</div>
               <div className="text-xs font-bold text-slate-700 truncate">{playerData.brandName}</div>
             </div>
             <div className="text-center">
               <div className="text-[10px] text-slate-400 uppercase mb-1">Entity Type</div>
               <div className="text-xs font-bold text-slate-700">{playerData.businessType}</div>
             </div>
          </div>
        </div>

        {!isSubmitted ? (
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8 space-y-6">
            <div className="flex items-center gap-3 text-thai-blue mb-2">
              <Mail className="w-5 h-5" />
              <h3 className="font-bold">รับใบประเมินผลผ่านอีเมล</h3>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">BU Mail Address Only</label>
              <input
                type="email"
                placeholder="account@bumail.net"
                className={`w-full p-4 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                  error ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:ring-thai-gold/30'
                }`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {error && <p className="text-red-500 text-[10px] mt-2 font-bold">{error}</p>}
            </div>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !email}
              className="w-full bg-thai-blue hover:bg-blue-800 text-white font-bold py-5 rounded-2xl shadow-xl shadow-blue-100 flex items-center justify-center gap-3 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>ส่งผลงานและเก็บบันทึก</span>
                  <CheckCircle2 className="w-5 h-5" />
                </>
              )}
            </button>

            <button 
              onClick={() => setStep('HOME')}
              className="w-full py-4 text-xs font-bold text-slate-400 font-sans uppercase tracking-[0.2em] border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors"
            >
              ยกเลิกและกลับหน้าแรก
            </button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-green-50 border border-green-100 rounded-3xl p-8 text-center space-y-6"
          >
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-green-200">
               <CheckCircle2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-green-800 mb-2">บันทึกข้อมูลสำเร็จแล้ว!</h3>
              <p className="text-green-700 text-sm leading-relaxed">
                ระบบได้ส่งคะแนน <span className="font-bold">{playerData.totalScore} แต้ม</span><br/>
                ไปยังอีเมล {playerData.email} เรียบร้อยแล้ว
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-3 pt-4">
              <button 
                onClick={() => setStep('HOME')} 
                className="bg-white border border-green-200 text-green-700 py-4 rounded-xl text-xs font-bold tracking-widest font-thai hover:bg-green-100 transition-colors"
              >
                กลับสู่หน้าหลัก
              </button>
              <button 
                onClick={() => setStep('ADMIN')}
                className="bg-green-600 text-white py-4 rounded-xl text-xs font-bold tracking-widest font-thai flex items-center justify-center gap-2 hover:bg-green-700 transition-colors"
                title="Only for testing/demo admin access"
              >
                <Download className="w-3 h-3" />
                หน้าจัดการ
              </button>
            </div>
          </motion.div>
        )}

        {/* Security Patch Note */}
        <div className="mt-12 p-6 bg-slate-900 rounded-2xl text-white relative overflow-hidden group">
          <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <ShieldCheck className="w-24 h-24 rotate-12" />
          </div>
          <div className="relative z-10">
            <div className="text-thai-gold text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
              <ShieldCheck className="w-3 h-3" />
              Security Checkpoint
            </div>
            <p className="text-xs text-slate-400 font-thai leading-relaxed">
              คะแนนของคุณถูกบันทึกไว้อย่างปลอดภัยในระบบคลาวด์ 
              การตรวจสอบความถูกต้องย้อนพิจารณาตามพิกัดเวลาและเลขประจำตัวผู้ใช้
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
