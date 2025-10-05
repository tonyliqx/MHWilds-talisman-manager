'use client';

import { useState, useEffect } from 'react';
import { UserTalisman } from '@/types/talisman';
import TalismanForm from '@/components/TalismanForm';
import TalismanTable from '@/components/TalismanTable';
import ImportExport from '@/components/ImportExport';

const STORAGE_KEY = 'mhwilds-talismans';

export default function Home() {
  const [talismans, setTalismans] = useState<UserTalisman[]>([]);
  const [editingTalisman, setEditingTalisman] = useState<UserTalisman | null>(null);

  // Load talismans from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setTalismans(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading saved talismans:', error);
      }
    }
  }, []);

  // Save talismans to localStorage whenever the list changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(talismans));
  }, [talismans]);

  const handleAddTalisman = (talisman: UserTalisman) => {
    if (editingTalisman) {
      // Update existing talisman
      setTalismans(prev => 
        prev.map(t => t.id === talisman.id ? talisman : t)
      );
      setEditingTalisman(null);
    } else {
      // Add new talisman
      setTalismans(prev => [...prev, talisman]);
    }
  };

  const handleEditTalisman = (talisman: UserTalisman) => {
    setEditingTalisman(talisman);
    // Scroll to form
    document.getElementById('talisman-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDeleteTalisman = (id: string) => {
    setTalismans(prev => prev.filter(t => t.id !== id));
  };

  const handleReorder = (fromIndex: number, toIndex: number) => {
    setTalismans(prev => {
      const newTalismans = [...prev];
      const [movedItem] = newTalismans.splice(fromIndex, 1);
      newTalismans.splice(toIndex, 0, movedItem);
      return newTalismans;
    });
  };

  const handleImport = (importedTalismans: UserTalisman[]) => {
    if (confirm(`Import ${importedTalismans.length} talismans? This will replace your current list.`)) {
      setTalismans(importedTalismans);
    }
  };

  const handleCancelEdit = () => {
    setEditingTalisman(null);
  };

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="mh-card p-4 text-center rounded-lg">
          <div className="text-2xl font-bold text-amber-800">{talismans.length}</div>
          <div className="text-sm text-gray-700">Total Talismans</div>
        </div>
                <div className="mh-card p-4 text-center rounded-lg">
                  <div className="text-2xl font-bold text-amber-800">
                    {talismans.filter(t => t.rarity === '稀有度8').length}
                  </div>
                  <div className="text-sm text-gray-700">Rarity 8</div>
                </div>
                <div className="mh-card p-4 text-center rounded-lg">
                  <div className="text-2xl font-bold text-red-800">
                    {talismans.filter(t => t.rarity === 'unknown').length}
                  </div>
                  <div className="text-sm text-gray-700">Unknown</div>
                </div>
        <div className="mh-card p-4 text-center rounded-lg">
          <div className="text-2xl font-bold text-amber-800">
            {talismans.filter(t => t.skill1 || t.skill2 || t.skill3).length}
          </div>
          <div className="text-sm text-gray-700">With Skills</div>
        </div>
        <div className="mh-card p-4 text-center rounded-lg">
          <div className="text-2xl font-bold text-amber-800">
            {new Set(talismans.map(t => t.slotPt)).size}
          </div>
          <div className="text-sm text-gray-700">Slot Types</div>
        </div>
      </div>

      {/* Talisman Form */}
      <div id="talisman-form">
        <TalismanForm
          onSubmit={handleAddTalisman}
          editingTalisman={editingTalisman}
          onCancel={handleCancelEdit}
        />
      </div>

      {/* Import/Export */}
      <ImportExport
        talismans={talismans}
        onImport={handleImport}
      />

      {/* Talisman Table */}
      <TalismanTable
        talismans={talismans}
        onEdit={handleEditTalisman}
        onDelete={handleDeleteTalisman}
        onReorder={handleReorder}
      />
    </div>
  );
}
