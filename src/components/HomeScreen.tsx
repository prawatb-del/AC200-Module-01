import React from 'react';
import { motion } from 'motion/react';
import { useGame } from '../context/GameContext';
import { Building2, Landmark, Rocket, ShieldCheck } from 'lucide-react';

export default function HomeScreen() {
  const { setStep } = useGame();
  const [adminClicks, setAdminClicks] = React.useState(0);

  const handleAdminTrigger = () => {
    setAdminClicks(prev => prev + 1);
  };

  return (
    <div className="min-h-screen flex flex-col pt-12 pb-8 px-6 thai-gradient text-white overflow-hidden relative">
      {/* Decorative Ornaments */}
      <div className="absolute inset-0 pattern-dots pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-thai-gold/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-thai-gold/10 rounded-full blur-3xl" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 flex flex-col items-center justify-center text-center z-10"
      >
        <div className="w-16 h-16 bg-thai-gold rounded flex items-center justify-center mb-8 shadow-lg shadow-black/20">
          <Landmark className="text-thai-blue w-10 h-10" />
        </div>
        
        <h1 className="text-3xl md:text-5xl font-bold mb-4 font-thai tracking-tight leading-tight">
          BUSINESS FOUNDER<br/>
          <span className="text-thai-gold">MASTER</span>
        </h1>
        
        <p className="text-sm text-blue-100/70 mb-12 max-w-[280px] font-thai font-light leading-relaxed uppercase tracking-widest">
          ก้าวแรกสู่การเป็นผู้ประกอบการระดับมืออาชีพตามกฎหมายไทย
        </p>

        <div className="flex flex-col gap-3 w-full max-w-xs mb-12">
          <div className="bg-[#002244] border border-white/10 p-4 rounded-xl flex items-center gap-4 text-left">
            <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-[10px] font-bold shrink-0">01</div>
            <div>
              <div className="text-[10px] uppercase tracking-widest text-thai-gold font-bold">Concept</div>
              <div className="text-xs font-thai text-white/80">จำลองการจดทะเบียนนิติบุคคล</div>
            </div>
          </div>
          <div className="bg-[#002244] border border-white/10 p-4 rounded-xl flex items-center gap-4 text-left">
            <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-[10px] font-bold shrink-0">02</div>
            <div>
              <div className="text-[10px] uppercase tracking-widest text-thai-gold font-bold">Taxation</div>
              <div className="text-xs font-thai text-white/80">พื้นฐานภาษีและบัญชีไทย</div>
            </div>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setStep('SETUP')}
          className="group w-full max-w-xs bg-thai-gold hover:bg-thai-gold-dark text-white font-bold py-5 rounded-2xl shadow-xl shadow-black/20 flex items-center justify-center gap-3 transition-all"
        >
          <span className="font-thai text-lg">เริ่มต้นสร้างธุรกิจ</span>
          <Rocket className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </motion.button>
      </motion.div>

      <footer className="mt-auto py-8 text-center opacity-60 text-[10px] uppercase tracking-[0.2em] font-thai z-10 flex flex-col items-center gap-4">
        <p onClick={handleAdminTrigger} className="cursor-default select-none">
          Professional Thai Business Simulator
        </p>
        
        {adminClicks >= 5 && (
          <motion.button 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => setStep('ADMIN')}
            className="px-4 py-2 border border-thai-gold/50 rounded-full bg-thai-gold/10 hover:bg-thai-gold/20 transition-all text-thai-gold font-bold"
          >
            Admin Access Revealed
          </motion.button>
        )}
      </footer>
    </div>
  );
}
