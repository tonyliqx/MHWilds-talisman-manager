'use client';

import { useState } from 'react';
import { UserTalisman, RARITY_LABELS } from '@/types/talisman';

interface TalismanTableProps {
  talismans: UserTalisman[];
  onEdit: (talisman: UserTalisman) => void;
  onDelete: (id: string) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
}

export default function TalismanTable({ talismans, onEdit, onDelete, onReorder }: TalismanTableProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (sectionKey: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));
    if (dragIndex !== dropIndex) {
      onReorder(dragIndex, dropIndex);
    }
  };

  if (talismans.length === 0) {
    return (
      <div className="mh-card p-8 text-center rounded-lg">
        <p className="text-gray-700 text-lg">No talismans added yet. Add your first talisman above!</p>
      </div>
    );
  }

  // Group talismans by rarity
  const rarity8 = talismans.filter(t => t.rarity === '稀有度8');
  const rarity7 = talismans.filter(t => t.rarity === '稀有度7');
  const rarity6 = talismans.filter(t => t.rarity === '稀有度6');
  const rarity5 = talismans.filter(t => t.rarity === '稀有度5');
  const rarityUnknown = talismans.filter(t => t.rarity === 'unknown');

  const renderTalismanRow = (talisman: UserTalisman, index: number) => (
    <tr
      key={talisman.id}
      draggable
      onDragStart={(e) => handleDragStart(e, index)}
      onDragOver={handleDragOver}
      onDrop={(e) => handleDrop(e, index)}
      className="hover:bg-amber-50/50 transition-colors cursor-move"
    >
      <td className="border border-amber-300/20 px-4 py-3 text-gray-700">
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          talisman.rarity === 'unknown' ? 'bg-red-200 text-red-800' :
          talisman.rarity === '稀有度8' ? 'bg-yellow-200 text-yellow-800' :
          talisman.rarity === '稀有度7' ? 'bg-purple-200 text-purple-800' :
          talisman.rarity === '稀有度6' ? 'bg-blue-200 text-blue-800' :
          'bg-gray-200 text-gray-800'
        }`}>
          {RARITY_LABELS[talisman.rarity as keyof typeof RARITY_LABELS]}
        </span>
      </td>
      <td className="border border-amber-300/20 px-4 py-3 text-gray-700">
        <div className="space-y-1">
          {talisman.skill1 && (
            <div className="text-sm font-medium">{talisman.skill1}</div>
          )}
          {talisman.skill2 && (
            <div className="text-sm font-medium">{talisman.skill2}</div>
          )}
          {talisman.skill3 && (
            <div className="text-sm font-medium">{talisman.skill3}</div>
          )}
        </div>
      </td>
      <td className="border border-amber-300/20 px-4 py-3 text-gray-700 text-sm">
        {talisman.slotDescription}
      </td>
      <td className="border border-amber-300/20 px-4 py-3">
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(talisman)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(talisman.id)}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );

  const renderRaritySection = (rarityTalismans: UserTalisman[], rarityLabel: string, rarityColor: string, sectionKey: string) => {
    if (rarityTalismans.length === 0) return null;

    const isExpanded = expandedSections[sectionKey] || false;

    return (
      <div className="mh-card p-6 rounded-lg" key={rarityLabel}>
        <button
          onClick={() => toggleSection(sectionKey)}
          className="w-full flex items-center justify-between text-left mb-4"
        >
          <h3 className={`text-xl font-bold ${rarityColor}`}>
            {rarityLabel} ({rarityTalismans.length})
          </h3>
          <span className="text-2xl text-gray-500">
            {isExpanded ? '−' : '+'}
          </span>
        </button>
        
        {isExpanded && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-amber-200/10">
                  <th className="border border-amber-300/20 px-4 py-3 text-left text-gray-700 font-semibold">
                    Rarity
                  </th>
                  <th className="border border-amber-300/20 px-4 py-3 text-left text-gray-700 font-semibold">
                    Skills
                  </th>
                  <th className="border border-amber-300/20 px-4 py-3 text-left text-gray-700 font-semibold">
                    Slots
                  </th>
                  <th className="border border-amber-300/20 px-4 py-3 text-left text-gray-700 font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {rarityTalismans.map((talisman) => {
                  const globalIndex = talismans.indexOf(talisman);
                  return renderTalismanRow(talisman, globalIndex);
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {renderRaritySection(rarity8, 'Rarity 8 Talismans', 'text-yellow-700', 'rarity8')}
      {renderRaritySection(rarity7, 'Rarity 7 Talismans', 'text-purple-700', 'rarity7')}
      {renderRaritySection(rarity6, 'Rarity 6 Talismans', 'text-blue-700', 'rarity6')}
      {renderRaritySection(rarity5, 'Rarity 5 Talismans', 'text-gray-700', 'rarity5')}
      {renderRaritySection(rarityUnknown, 'Unknown Rarity Talismans', 'text-red-700', 'unknown')}
    </div>
  );
}
