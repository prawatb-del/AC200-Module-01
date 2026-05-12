import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useGame } from '../context/GameContext';
import { ArrowRight, ChevronLeft, Info } from 'lucide-react';

const businessTypes = [
  { id: 'SOLE', label: 'เจ้าของคนเดียว (Sole Proprietorship)' },
  { id: 'ORD_PART', label: 'ห้างหุ้นส่วนสามัญ (Ordinary Partnership)' },
  { id: 'REG_ORD_PART', label: 'ห้างหุ้นส่วนสามัญจดทะเบียน (Registered Ordinary Partnership)' },
  { id: 'LIM_PART', label: 'ห้างหุ้นส่วนจำกัด (Limited Partnership)' },
  { id: 'LIM_CO', label: 'บริษัทจำกัด (Limited Company)' },
];

export default function SetupScreen() {
  const { setStep, setPlayerData, playerData } = useGame();
  const [formData, setFormData] = useState({
    brandName: playerData.brandName,
    activity: playerData.activity,
    businessType: playerData.businessType,
    annualRevenue: playerData.annualRevenue || '',
    initialCapital: playerData.initialCapital || '',
  });

  const revenueNum = Number(formData.annualRevenue);
  const capitalNum = Number(formData.initialCapital);
  const isFormValid = formData.brandName && formData.activity && formData.businessType && formData.annualRevenue && formData.initialCapital;

  const handleStartChallenge = () => {
    if (!isFormValid) return;
    setPlayerData({
      brandName: formData.brandName,
      activity: formData.activity,
      businessType: formData.businessType,
      annualRevenue: revenueNum,
      initialCapital: capitalNum,
    });
    setStep('QUIZ');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-slate-50 border-b border-slate-200 px-6 py-6 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <button onClick={() => setStep('HOME')} className="p-2 -ml-2 text-slate-400 hover:text-thai-blue transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-thai-blue font-thai uppercase tracking-tight">ลงทะเบียนกิจการใหม่</h2>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-blue-100 text-thai-blue text-[10px] font-bold rounded-full border border-blue-200">ปีภาษี 2567</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 px-6 py-8 max-w-md mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden"
        >
          <div className="p-8 space-y-6">
            {/* Brand Name */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 font-thai">ชื่อแบรนด์ / ชื่อทางการค้า</label>
              <input
                type="text"
                placeholder="เช่น ไทยรุ่งเรือง ซอฟต์แวร์"
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-thai-gold/50 transition-all font-thai placeholder:text-slate-300"
                value={formData.brandName}
                onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
              />
            </div>

            {/* Business Activity */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 font-thai">กิจกรรมหลักของธุรกิจ</label>
              <input
                type="text"
                placeholder="เช่น รับจ้างเขียนโปรแกรมคอมพิวเตอร์"
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-thai-gold/50 transition-all font-thai placeholder:text-slate-300"
                value={formData.activity}
                onChange={(e) => setFormData({ ...formData, activity: e.target.value })}
              />
            </div>

            {/* Business Type */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 font-thai">รูปแบบการจัดตั้งธุรกิจ</label>
              <div className="relative">
                <select
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-thai-gold/50 transition-all font-thai appearance-none cursor-pointer"
                  value={formData.businessType}
                  onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                >
                  <option value="" disabled>เลือกประเภทธุรกิจ</option>
                  {businessTypes.map((type) => (
                    <option key={type.id} value={type.id}>{type.label}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <ArrowRight className="w-4 h-4 rotate-90" />
                </div>
              </div>
            </div>

            {/* Annual Revenue */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 font-thai">ประมาณการรายได้ต่อปี (บาท)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-thai">฿</span>
                <input
                  type="number"
                  placeholder="2,500,000"
                  className="w-full p-4 pl-8 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-thai-gold/50 transition-all font-thai placeholder:text-slate-300"
                  value={formData.annualRevenue}
                  onChange={(e) => setFormData({ ...formData, annualRevenue: e.target.value })}
                />
              </div>
            </div>

            {/* Initial Capital */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 font-thai">ทุนเริ่มต้นธุรกิจ (บาท)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-thai">฿</span>
                <input
                  type="number"
                  placeholder="1,000,000"
                  className="w-full p-4 pl-8 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-thai-gold/50 transition-all font-thai placeholder:text-slate-300"
                  value={formData.initialCapital}
                  onChange={(e) => setFormData({ ...formData, initialCapital: e.target.value })}
                />
              </div>
            </div>

            <button
              onClick={handleStartChallenge}
              disabled={!isFormValid}
              className={`w-full py-5 rounded-2xl font-thai font-bold flex items-center justify-center gap-3 transition-all shadow-xl ${
                isFormValid 
                  ? 'bg-thai-gold hover:bg-thai-gold-dark text-white shadow-amber-200/50' 
                  : 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none'
              }`}
            >
              <span className="text-lg">เริ่มการทดสอบ</span>
              <ArrowRight className={`w-5 h-5 ${isFormValid ? 'group-hover:translate-x-1' : ''} transition-transform`} />
            </button>
          </div>
          
          <div className="bg-slate-50 p-4 text-center border-t border-slate-200">
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-medium font-thai">
              Powered by Firebase Anonymous Auth | Firestore
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
