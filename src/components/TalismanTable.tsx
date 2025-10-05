'use client';

import { UserTalisman } from '@/types/talisman';

interface TalismanTableProps {
  talismans: UserTalisman[];
  onEdit: (talisman: UserTalisman) => void;
  onDelete: (id: string) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
}

export default function TalismanTable({ talismans, onEdit, onDelete, onReorder }: TalismanTableProps) {
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

  return (
    <div className="mh-card p-6 rounded-lg">
      <h2 className="text-2xl font-bold text-gray-700 mb-6">Your Talismans ({talismans.length})</h2>
      
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
            {talismans.map((talisman, index) => (
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
                    talisman.rarity === '稀有度8' ? 'bg-yellow-200 text-yellow-800' :
                    talisman.rarity === '稀有度7' ? 'bg-purple-200 text-purple-800' :
                    talisman.rarity === '稀有度6' ? 'bg-blue-200 text-blue-800' :
                    'bg-gray-200 text-gray-800'
                  }`}>
                    {talisman.rarity.replace('稀有度', '')}
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
