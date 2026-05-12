import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useGame } from '../context/GameContext';
import { db } from '../lib/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { ChevronLeft, Download, Database, Users, Calendar, Table as TableIcon, Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function AdminScreen() {
  const { setStep } = useGame();
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'game_results'), orderBy('timestamp', 'desc'), limit(100));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate().toLocaleString() || 'N/A'
      }));
      setResults(data);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

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
        
        <button 
          onClick={exportToExcel}
          disabled={results.length === 0 || exporting}
          className="bg-thai-gold hover:bg-thai-gold-dark text-slate-900 px-6 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all disabled:opacity-50"
        >
          {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          <span>Excel Export</span>
        </button>
      </header>

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
      </main>
    </div>
  );
}
