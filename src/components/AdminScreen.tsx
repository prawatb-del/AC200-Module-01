import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useGame } from '../context/GameContext';
import { db } from '../lib/firebase';
import { collection, query, orderBy, limit, getDocs, deleteDoc, doc, writeBatch } from 'firebase/firestore';
import { ChevronLeft, Download, Database, Users, Calendar, Table as TableIcon, Loader2, Trash2, AlertTriangle } from 'lucide-react';
import * as XLSX from 'xlsx';
import { handleFirestoreError, OperationType } from '../lib/firestore-utils';

export default function AdminScreen() {
  const { setStep } = useGame();
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchResults();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'BUADMIN2024') {
      setIsAuthenticated(true);
      setLoginError(false);
    } else {
      setLoginError(true);
      setPassword('');
    }
  };

  const fetchResults = async () => {
    setLoading(true);
    const path = 'game_results';
    try {
      const q = query(collection(db, path), orderBy('timestamp', 'desc'), limit(100));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: (doc.data() as any).timestamp?.toDate().toLocaleString() || 'N/A'
      }));
      setResults(data);
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    } finally {
      setLoading(false);
    }
  };

  const clearAllSubmissions = async () => {
    setClearing(true);
    const path = 'game_results';
    try {
      const batch = writeBatch(db);
      results.forEach((res) => {
        batch.delete(doc(db, path, res.id));
      });
      await batch.commit();
      setResults([]);
      setShowConfirmDelete(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, null);
    } finally {
      setClearing(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 font-thai">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl"
        >
          <div className="w-16 h-16 bg-thai-gold rounded-2xl flex items-center justify-center mb-6 mx-auto">
            <Database className="text-slate-900 w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-thai-gold text-center mb-2 uppercase tracking-widest">Admin Authorization</h2>
          <p className="text-xs text-slate-400 text-center mb-8 font-thai">เฉพาะผู้ดูแลระบบเท่านั้นที่สามารถเข้าถึงข้อมูลนี้ได้</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="รหัสผ่านผู้ดูแลระบบ"
                className={`w-full bg-black/40 border ${loginError ? 'border-red-500' : 'border-white/10'} rounded-xl px-4 py-4 text-center text-lg tracking-[0.5em] focus:outline-none focus:border-thai-gold transition-all`}
                autoFocus
              />
              {loginError && <p className="text-red-500 text-[10px] mt-2 text-center font-bold">รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่</p>}
            </div>
            <button 
              type="submit"
              className="w-full bg-thai-gold hover:bg-thai-gold-dark text-slate-900 font-bold py-4 rounded-xl transition-all active:scale-95 shadow-lg"
            >
              เข้าสู่ระบบ
            </button>
            <button 
              type="button"
              onClick={() => setStep('HOME')}
              className="w-full text-slate-500 hover:text-white py-2 text-xs transition-colors"
            >
              กลับสู่หน้าหลัก
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  const exportToExcel = () => {
    setExporting(true);
    try {
      const worksheet = XLSX.utils.json_to_sheet(results);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Game Results");
      
      // Modern way to generate file name with date
      const fileName = `FounderMaster_Results_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
    } catch (err) {
      console.error("Export failed", err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col font-thai">
      <header className="px-6 py-6 border-b border-white/10 flex items-center justify-between sticky top-0 bg-slate-900 z-30">
        <div className="flex items-center gap-4">
          <button onClick={() => setStep('HOME')} className="p-2 -ml-2 text-slate-500 hover:text-white transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-lg font-bold uppercase tracking-widest text-thai-gold">Dashboard</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase font-sans">Admin Export Center</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowConfirmDelete(true)}
            disabled={results.length === 0 || clearing}
            className="bg-red-500/10 hover:bg-red-500/20 text-red-500 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all disabled:opacity-50 border border-red-500/20"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Clear All</span>
          </button>
          <button 
            onClick={exportToExcel}
            disabled={results.length === 0 || exporting}
            className="bg-thai-gold hover:bg-thai-gold-dark text-slate-900 px-6 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all disabled:opacity-50"
          >
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span>Excel Export</span>
          </button>
        </div>
      </header>

      {/* Confirmation Modal */}
      {showConfirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md bg-slate-900 border border-red-500/30 rounded-3xl p-8 text-center"
          >
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-bold mb-2">ยืนยันการลบข้อมูลทั้งหมด?</h3>
            <p className="text-sm text-slate-400 mb-8 font-thai">การกระทำนี้ไม่สามารถย้อนกลับได้ ข้อมูลผลลัพธ์ของผู้เล่นทั้งหมด {results.length} รายการจะถูกลบถาวร</p>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={clearAllSubmissions}
                disabled={clearing}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {clearing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                ลบข้อมูลทั้งหมดเดี๋ยวนี้
              </button>
              <button 
                onClick={() => setShowConfirmDelete(false)}
                disabled={clearing}
                className="w-full text-slate-400 hover:text-white py-2 font-bold"
              >
                ยกเลิก
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <main className="p-6">
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
            <div className="flex items-center gap-2 text-thai-gold mb-1">
              <Users className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase font-sans">Total Players</span>
            </div>
            <div className="text-3xl font-bold">{results.length}</div>
          </div>
          <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
            <div className="flex items-center gap-2 text-thai-gold mb-1">
              <Database className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase font-sans">Database</span>
            </div>
            <div className="text-3xl font-bold">LIVE</div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
             <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
               <TableIcon className="w-4 h-4 text-thai-gold" />
               Recent Submissions
             </div>
             <button onClick={fetchResults} className="text-[10px] text-slate-400 hover:text-white uppercase font-bold transition-colors">Refresh</button>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-thai-gold" />
                <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">Syncing with Firestore...</span>
              </div>
            ) : results.length === 0 ? (
              <div className="py-20 text-center text-slate-500 text-xs font-bold uppercase tracking-widest">No records found</div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-[#002244] text-[10px] uppercase font-sans font-bold text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Timestamp</th>
                    <th className="px-4 py-3">Brand</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3 text-right">Revenue</th>
                    <th className="px-4 py-3 text-right">Capital</th>
                    <th className="px-4 py-3 text-right">Score</th>
                  </tr>
                </thead>
                <tbody className="text-[11px] font-thai">
                  {results.map((row) => (
                    <tr key={row.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{row.timestamp}</td>
                      <td className="px-4 py-3 font-bold text-white truncate max-w-[100px]">{row.brandName}</td>
                      <td className="px-4 py-3 text-thai-gold">{row.email}</td>
                      <td className="px-4 py-3 uppercase text-[9px] font-sans font-bold">{row.businessType}</td>
                      <td className="px-4 py-3 text-right font-sans">{(row.revenue || 0).toLocaleString()}</td>
                      <td className="px-4 py-3 text-right font-sans">{(row.capital || 0).toLocaleString()}</td>
                      <td className="px-4 py-3 text-right font-bold text-green-400 font-sans">{row.score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Integration Guide */}
        <div className="mt-8 bg-white/5 border border-white/10 rounded-3xl p-8 mb-12">
          <h3 className="text-thai-gold font-bold mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-thai-gold/20 flex items-center justify-center">
              <Database className="w-4 h-4 text-thai-gold" />
            </span>
            Google Sheets & Email Integration Setup
          </h3>
          <div className="space-y-4 text-xs font-thai text-slate-300 leading-relaxed">
            <p>เพื่อให้ระบบส่งอีเมลและบันทึกลง Google Sheet อัตโนมัติ ให้ทำตามขั้นตอนดังนี้:</p>
            <ol className="list-decimal list-inside space-y-3 bg-white/5 p-4 rounded-xl">
              <li>ไปที่ <a href="https://script.google.com" target="_blank" className="text-blue-400 underline">script.google.com</a> แล้วสร้าง New Project</li>
              <li>นำโค้ดด้านล่างไปวางใน <code className="bg-black px-1.5 py-0.5 text-green-400 rounded">Code.gs</code> แทนที่โค้ดเดิม</li>
              <li>กด Deploy &gt; New Deployment &gt; เลือก Type เป็น 'Web App'</li>
              <li>เลือก 'Execute as' เป็น **Me** และ 'Who has access' เป็น **Anyone** (สำคัญมาก)</li>
              <li>คัดลอก Web App URL ไปใส่ในไฟล์ <code className="bg-black px-1.5 py-0.5 text-blue-400 rounded font-sans">ResultScreen.tsx</code> ที่ตัวแปร <code className="bg-black px-1.5 py-0.5 text-thai-gold font-sans">GAS_URL</code></li>
            </ol>
            
            <div className="mt-6 bg-black/50 p-6 rounded-2xl border border-white/5 overflow-x-auto relative group">
               <div className="absolute top-4 right-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Google Apps Script</div>
              <pre className="text-[10px] text-green-400 font-mono leading-relaxed">
{`function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  
  // 1. บันทึกลง Google Sheet
  sheet.appendRow([
    new Date(), 
    data.email, 
    data.brandName, 
    data.score, 
    data.businessType,
    data.revenue,
    data.capital,
    data.activity
  ]);

  // 2. ส่งอีเมลสรุปผล
  var emailBody = "<h3>ขอแสดงความยินดีกับคุณ " + data.brandName + "!</h3>" +
                  "<p>คุณทำคะแนนได้: <b>" + data.score + " แต้ม</b></p>" +
                  "<hr/>" +
                  "<p>ประเภทธุรกิจ: " + data.businessType + "</p>" +
                  "<p>ทุนจดทะเบียน: " + data.capital.toLocaleString() + " บาท</p>";

  MailApp.sendEmail({
    to: data.email,
    subject: "Business Success Report: " + data.brandName,
    htmlBody: emailBody
  });

  return ContentService.createTextOutput("Success").setMimeType(ContentService.MimeType.TEXT);
}`}
              </pre>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
