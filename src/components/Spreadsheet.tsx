import React from 'react';

interface SpreadsheetProps {
  headers: string[];
  rowLabels: string[];
  data: (string | number)[][];
  targetCell: string;
  onCellClick?: (label: string) => void;
  activeCell?: string;
  cellValues?: Record<string, string | number>; // For dynamic updates if needed
}

export default function Spreadsheet({ 
  headers, 
  rowLabels, 
  data, 
  targetCell, 
  onCellClick,
  activeCell,
  cellValues = {}
}: SpreadsheetProps) {
  
  // Helper to get column letter (0=A, 1=B, ...)
  const getColLetter = (index: number) => String.fromCharCode(65 + index);

  return (
    <div className="bg-white border-2 border-slate-200 rounded-lg overflow-x-auto shadow-inner font-mono text-[10px]">
      <div className="min-w-[400px]">
        {/* Header Row */}
      <div className="flex bg-slate-100 border-b border-slate-300">
        <div className="w-10 h-6 border-r border-slate-300 bg-slate-200 flex items-center justify-center italic text-slate-500">
          #
        </div>
        {headers.map((header, idx) => (
          <div key={idx} className="flex-1 min-w-[80px] h-6 border-r border-slate-300 flex items-center justify-center font-bold text-black uppercase tracking-tighter">
            {getColLetter(idx)}
          </div>
        ))}
      </div>

      {/* Header Content Row (Labels) */}
      <div className="flex bg-slate-50 border-b border-slate-300 font-sans">
        <div className="w-10 h-8 border-r border-slate-300" />
        {headers.map((header, idx) => (
          <div key={idx} className="flex-1 min-w-[80px] h-8 border-r border-slate-300 flex items-center justify-center text-black font-bold px-1 text-center">
            {header}
          </div>
        ))}
      </div>

      {/* Data Rows */}
      {rowLabels.map((rowLabel, rowIdx) => (
        <div key={rowIdx} className="flex border-b border-slate-200 hover:bg-slate-50 transition-colors">
          {/* Row Label */}
          <div className="w-10 h-10 border-r border-slate-300 bg-slate-100 flex items-center justify-center font-bold text-black">
            {rowLabel}
          </div>

          {/* Cells */}
          {headers.map((_, colIdx) => {
            const colLetter = getColLetter(colIdx);
            const cellLabel = `${colLetter}${rowLabel}`;
            const isTarget = cellLabel === targetCell;
            const isActive = cellLabel === activeCell;
            
            const displayValue = cellValues[cellLabel] !== undefined ? cellValues[cellLabel] : data[rowIdx][colIdx];

            return (
              <div 
                key={colIdx} 
                onClick={() => onCellClick?.(cellLabel)}
                className={`flex-1 min-w-[80px] h-10 border-r border-slate-200 flex items-center px-2 cursor-pointer transition-all ${
                  isActive ? 'ring-2 ring-inset ring-green-500 bg-green-50/50' : ''
                } ${
                  isTarget ? 'bg-yellow-50/50' : ''
                }`}
              >
                <span className={`text-black ${isTarget ? 'font-bold' : ''}`}>
                  {typeof displayValue === 'number' 
                    ? displayValue.toLocaleString() 
                    : displayValue}
                </span>
                {isTarget && displayValue === "" && (
                  <div className="w-full h-1 bg-green-500/20 animate-pulse rounded" />
                )}
              </div>
            );
          })}
        </div>
      ))}
      </div>
    </div>
  );
}
