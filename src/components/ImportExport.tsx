'use client';

import { useState } from 'react';
import { UserTalisman } from '@/types/talisman';
import { talismanToCSV, csvToTalisman, CSV_HEADER } from '@/lib/talisman-utils';

interface ImportExportProps {
  talismans: UserTalisman[];
  onImport: (talismans: UserTalisman[]) => void;
}

export default function ImportExport({ talismans, onImport }: ImportExportProps) {
  const [csvText, setCsvText] = useState('');
  const [error, setError] = useState('');

  const exportToCSV = () => {
    // Export only the data rows, no header
    const csvContent = talismans.map(talismanToCSV).join('\n');
    
    setCsvText(csvContent);
  };

  const downloadCSV = () => {
    const csvContent = [
      CSV_HEADER,
      ...talismans.map(talismanToCSV)
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'talismans.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImport = () => {
    try {
      setError('');
      
      if (!csvText.trim()) {
        setError('Please enter CSV data');
        return;
      }

      const lines = csvText.trim().split('\n');
      
      if (lines.length < 1) {
        setError('CSV must contain at least one data row');
        return;
      }

      // For textbox import, assume no header row - all lines are data
      const dataLines = lines;
      const importedTalismans: UserTalisman[] = [];
      
      dataLines.forEach((line, index) => {
        if (line.trim()) {
          try {
            const talisman = csvToTalisman(line, index);
            importedTalismans.push(talisman);
          } catch (err) {
            setError(`Error parsing row ${index + 1}: ${err instanceof Error ? err.message : 'Unknown error'}`);
            return;
          }
        }
      });

              // Check for unknown rarity items
              const unknownRarityItems = importedTalismans.filter(t => t.rarity === 'unknown');
              
              onImport(importedTalismans);
              setCsvText('');
              
              if (unknownRarityItems.length > 0) {
                setError(`Warning: ${unknownRarityItems.length} talisman(s) could not have their rarity determined and are marked as unknown. They will appear in red in the list.`);
              } else {
                setError('');
              }
    } catch (err) {
      setError(`Import failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setCsvText(content);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="mh-card p-6 rounded-lg">
      <h2 className="text-2xl font-bold text-gray-700 mb-6">Import / Export Talismans</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Export Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">Export</h3>
          
          <div className="space-y-3">
            <button
              onClick={exportToCSV}
              className="mh-button w-full"
            >
              Generate CSV Text
            </button>
            
            <button
              onClick={downloadCSV}
              className="mh-button-secondary w-full"
              disabled={talismans.length === 0}
            >
              Download CSV File
            </button>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CSV Data (for copying/pasting)
            </label>
            <textarea
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              className="mh-input w-full h-32 font-mono text-sm text-gray-700"
              placeholder="CSV data will appear here after export, or paste data here to import..."
              style={{ color: '#374151' }}
            />
            <button
              onClick={handleImport}
              className="mh-button w-full mt-2"
              disabled={!csvText.trim()}
            >
              Import from CSV Text
            </button>
          </div>
        </div>

        {/* Import Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">Import</h3>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload CSV File
              </label>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-amber-600 file:text-white hover:file:bg-amber-700"
                style={{ color: '#374151' }}
              />
            </div>
            
          </div>
          
                  {error && (
                    <div className={`px-4 py-3 rounded ${
                      error.includes('Warning:') 
                        ? 'bg-yellow-100 border border-yellow-400 text-yellow-700'
                        : 'bg-red-100 border border-red-400 text-red-700'
                    }`}>
                      {error}
                    </div>
                  )}
          
          <div className="text-sm text-gray-700/70">
            <p className="font-medium mb-2">CSV Format (12 columns):</p>
            <p className="font-mono text-xs bg-gray-100 p-2 rounded">
              Skill1,Skill1Level,Skill2,Skill2Level,Skill3,Skill3Level,ArmorSlot1,ArmorSlot2,ArmorSlot3,WeaponSlot1,WeaponSlot2,WeaponSlot3
            </p>
            <p className="text-xs mt-1">
              Use "无" for empty skills. Rarity is automatically inferred from skill and slot data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
