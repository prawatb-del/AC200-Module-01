import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useGame } from '../context/GameContext';
import { db } from '../lib/firebase';
import { collection, query, orderBy, limit, getDocs, deleteDoc, doc, writeBatch } from 'firebase/firestore';
import { ChevronLeft, Download, Database, Users, Calendar, Table as TableIcon, Loader2, Trash2, AlertTriangle, FileSpreadsheet, Key } from 'lucide-react';
import * as XLSX from 'xlsx';
import { handleFirestoreError, OperationType } from '../lib/firestore-utils';

export default function AdminScreen() {
  const { setStep } = useGame();
  const [results, setResults] = useState<any[]>([]);
  const [accessCodes, setAccessCodes] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'RESULTS' | 'ACCESS_CODES'>('RESULTS');
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      if (activeTab === 'RESULTS') {
        fetchResults();
      } else {
        fetchAccessCodes();
      }
    }
  }, [isAuthenticated, activeTab]);

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
    const path = 'excel_master_results';
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

  const fetchAccessCodes = async () => {
    setLoading(true);
    const path = 'access_codes';
    try {
      const q = query(collection(db, path), orderBy('timestamp', 'desc'), limit(100));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: (doc.data() as any).timestamp?.toDate().toLocaleString() || 'N/A'
      }));
      setAccessCodes(data);
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    } finally {
      setLoading(false);
    }
  };

  const clearCurrentData = async () => {
    setClearing(true);
    const path = activeTab === 'RESULTS' ? 'excel_master_results' : 'access_codes';
    const targetData = activeTab === 'RESULTS' ? results : accessCodes;
    
    try {
      const batch = writeBatch(db);
      targetData.forEach((res) => {
        batch.delete(doc(db, path, res.id));
      });
      await batch.commit();
      
      if (activeTab === 'RESULTS') setResults([]);
      else setAccessCodes([]);
      
      setShowConfirmDelete(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, null);
    } finally {
      setClearing(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 font-sans">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 blur-3xl rounded-full" />
          
          <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg">
            <Database className="text-slate-900 w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-white text-center mb-1 uppercase tracking-tighter italic">Admin <span className="text-green-500">Terminal</span></h2>
          <p className="text-[10px] text-slate-500 text-center mb-8 uppercase font-bold tracking-widest">AUTHORIZED PERSONNEL ONLY</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="PASSWORD"
                className={`w-full bg-black/40 border-2 ${loginError ? 'border-red-500/50' : 'border-white/10'} rounded-xl px-4 py-4 text-center text-lg tracking-[0.5em] focus:outline-none focus:border-green-500 transition-all font-mono`}
                autoFocus
              />
              {loginError && <p className="text-red-500 text-[10px] mt-2 text-center font-bold uppercase tracking-widest">Access Denied: Invalid Key</p>}
            </div>
            <button 
              type="submit"
              className="w-full bg-green-500 hover:bg-green-400 text-slate-900 font-black py-4 rounded-xl transition-all active:scale-95 shadow-lg shadow-green-500/20 uppercase tracking-widest"
            >
              Login Terminal
            </button>
            <button 
              type="button"
              onClick={() => setStep('HOME')}
              className="w-full text-slate-500 hover:text-white py-2 text-[10px] transition-colors uppercase font-bold tracking-widest"
            >
              Back to Home
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  const exportToExcel = () => {
    setExporting(true);
    try {
      const dataToExport = activeTab === 'RESULTS' ? results : accessCodes;
      const sheetName = activeTab === 'RESULTS' ? "AC432 BU EXCEL MASTER 11 Results" : "Access Logs";
      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      
      const fileName = `${sheetName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
    } catch (err) {
      console.error("Export failed", err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col font-sans">
      <header className="px-6 py-6 border-b border-white/10 flex items-center justify-between sticky top-0 bg-slate-900 z-30">
        <div className="flex items-center gap-4">
          <button onClick={() => setStep('HOME')} className="p-2 -ml-2 text-slate-500 hover:text-white transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-lg font-black italic uppercase tracking-tighter">Admin <span className="text-green-500">Console</span></h1>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.2em]">Data Management Environment</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowConfirmDelete(true)}
            disabled={(activeTab === 'RESULTS' ? results.length : accessCodes.length) === 0 || clearing}
            className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-all disabled:opacity-50 border border-red-500/20"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button 
            onClick={exportToExcel}
            disabled={(activeTab === 'RESULTS' ? results.length : accessCodes.length) === 0 || exporting}
            className="bg-green-500 hover:bg-green-400 text-slate-900 px-4 py-2 rounded-lg text-[10px] font-black flex items-center gap-2 transition-all disabled:opacity-50 uppercase tracking-widest"
          >
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span className="hidden sm:inline">Export XLSX</span>
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="px-6 pt-4 flex gap-4 border-b border-white/5">
        <button 
          onClick={() => setActiveTab('RESULTS')}
          className={`pb-4 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'RESULTS' ? 'text-green-500 border-b-2 border-green-500' : 'text-slate-500'}`}
        >
          Game Results
        </button>
        <button 
          onClick={() => setActiveTab('ACCESS_CODES')}
          className={`pb-4 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'ACCESS_CODES' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-slate-500'}`}
        >
          Access Code Logs
        </button>
      </div>

      {/* Confirmation Modal */}
      {showConfirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md bg-slate-900 border border-red-500/30 rounded-3xl p-8 text-center shadow-2xl"
          >
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-black mb-2 uppercase italic tracking-tight">Destructive Action</h3>
            <p className="text-xs text-slate-400 mb-8 uppercase tracking-wide">
              Wipe all records in "{activeTab === 'RESULTS' ? 'Game Results' : 'Access Codes'}"? This cannot be undone.
            </p>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={clearCurrentData}
                disabled={clearing}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-black py-4 rounded-xl transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
              >
                {clearing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Confirm Wipe
              </button>
              <button 
                onClick={() => setShowConfirmDelete(false)}
                disabled={clearing}
                className="w-full text-slate-400 hover:text-white py-2 text-[10px] font-black uppercase tracking-widest"
              >
                Cancel Process
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <main className="p-6">
        <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
             <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
               {activeTab === 'RESULTS' ? <Users className="w-4 h-4 text-green-500" /> : <Key className="w-4 h-4 text-blue-500" />}
               {activeTab === 'RESULTS' ? 'Recent Analyst Submissions' : 'Generated Access Codes'}
             </div>
             <button onClick={activeTab === 'RESULTS' ? fetchResults : fetchAccessCodes} className="text-[9px] text-slate-500 hover:text-white uppercase font-black tracking-widest transition-colors border border-white/10 px-2 py-1 rounded">Sync Data</button>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-green-500" />
                <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Querying Firestore...</span>
              </div>
            ) : (activeTab === 'RESULTS' ? results : accessCodes).length === 0 ? (
              <div className="py-20 text-center text-slate-600 text-[10px] font-black uppercase tracking-widest">No data available in this sector</div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-white/5 text-[9px] uppercase font-sans font-black text-slate-500 border-b border-white/5">
                  {activeTab === 'RESULTS' ? (
                    <tr>
                      <th className="px-6 py-4">Timestamp</th>
                      <th className="px-6 py-4">Analyst Name</th>
                      <th className="px-6 py-4">Email Address</th>
                      <th className="px-6 py-4 text-center">Time (s)</th>
                      <th className="px-6 py-4 text-center">Score</th>
                    </tr>
                  ) : (
                    <tr>
                      <th className="px-6 py-4">Timestamp</th>
                      <th className="px-6 py-4">Email Address</th>
                      <th className="px-6 py-4 text-center">Generated Code</th>
                      <th className="px-6 py-4 text-right">Status</th>
                    </tr>
                  )}
                </thead>
                <tbody className="text-[11px] font-mono">
                  {activeTab === 'RESULTS' ? (
                    results.map((row) => (
                      <tr key={row.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                        <td className="px-6 py-4 text-slate-500 whitespace-nowrap">{row.timestamp}</td>
                        <td className="px-6 py-4 font-black text-white uppercase tracking-tighter truncate max-w-[120px]">{row.playerName || 'USER_NA'}</td>
                        <td className="px-6 py-4 text-green-500/80 italic">{row.email}</td>
                        <td className="px-6 py-4 text-center text-slate-400 font-mono">{row.totalTimeTaken || 0}</td>
                        <td className="px-6 py-4 text-center font-black text-white">{(row.score || 0).toLocaleString()}</td>
                      </tr>
                    ))
                  ) : (
                    accessCodes.map((row) => (
                      <tr key={row.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                        <td className="px-6 py-4 text-slate-500 whitespace-nowrap">{row.timestamp}</td>
                        <td className="px-6 py-4 text-blue-400 font-bold italic">{row.email}</td>
                        <td className="px-6 py-4 text-center font-black text-white text-lg tracking-widest">{row.code}</td>
                        <td className="px-6 py-4 text-right">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${row.used ? 'bg-slate-700 text-slate-400' : 'bg-blue-500/20 text-blue-400'}`}>
                            {row.used ? 'EXPIRED' : 'ACTIVE'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
