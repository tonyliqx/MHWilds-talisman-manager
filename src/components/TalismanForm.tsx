'use client';

import { useState, useEffect } from 'react';
import { UserTalisman, TalismanTemplate, SLOT_MAPPINGS, RARITY_OPTIONS, RARITY_LABELS } from '@/types/talisman';
import { loadTalismanTemplates, getAllSkills, getSkillsForSlot, generateTalismanId } from '@/lib/talisman-utils';

interface TalismanFormProps {
  onSubmit: (talisman: UserTalisman) => void;
  editingTalisman?: UserTalisman | null;
  onCancel?: () => void;
}

export default function TalismanForm({ onSubmit, editingTalisman, onCancel }: TalismanFormProps) {
  const [templates, setTemplates] = useState<TalismanTemplate[]>([]);
  const [allSkills, setAllSkills] = useState<string[]>([]);
  const [formData, setFormData] = useState<Partial<UserTalisman>>({
    rarity: '稀有度5',
    skill1: '',
    skill2: '',
    skill3: '',
    slotDescription: '防具1级孔x1',
    slotPt: 1
  });

  useEffect(() => {
    loadTalismanTemplates().then(data => {
      setTemplates(data);
      setAllSkills(getAllSkills(data));
    });
  }, []);

  useEffect(() => {
    if (editingTalisman) {
      setFormData(editingTalisman);
    } else {
      setFormData({
        rarity: '稀有度5',
        skill1: '',
        skill2: '',
        skill3: '',
        slotDescription: '防具1级孔x1',
        slotPt: 1
      });
    }
  }, [editingTalisman]);

  const handleSlotChange = (slotPt: number) => {
    const mapping = SLOT_MAPPINGS.find(m => m.slotPt === slotPt);
    setFormData(prev => ({
      ...prev,
      slotPt,
      slotDescription: mapping?.description || ''
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const talisman: UserTalisman = {
      id: editingTalisman?.id || generateTalismanId(),
      rarity: formData.rarity || '稀有度5',
      skill1: formData.skill1 || '',
      skill2: formData.skill2 || '',
      skill3: formData.skill3 || '',
      slotDescription: formData.slotDescription || '',
      slotPt: formData.slotPt || 1
    };

    onSubmit(talisman);
    
    if (!editingTalisman) {
      setFormData({
        rarity: '稀有度5',
        skill1: '',
        skill2: '',
        skill3: '',
        slotDescription: '防具1级孔x1',
        slotPt: 1
      });
    }
  };

  return (
    <div className="mh-card p-6 rounded-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {editingTalisman ? 'Edit Talisman' : 'Add New Talisman'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rarity
          </label>
          <div className="flex gap-2">
            {RARITY_OPTIONS.map(rarity => (
              <button
                key={rarity}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, rarity }))}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  formData.rarity === rarity
                    ? 'bg-amber-600 text-white'
                    : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                }`}
              >
                {RARITY_LABELS[rarity as keyof typeof RARITY_LABELS]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Decoration Slots
          </label>
          <select
            value={formData.slotPt || 1}
            onChange={(e) => handleSlotChange(parseInt(e.target.value))}
            className="mh-select w-full"
          >
            {SLOT_MAPPINGS.map(mapping => (
              <option key={mapping.slotPt} value={mapping.slotPt}>
                {mapping.description}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(slotNum => (
            <div key={slotNum}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Skill {slotNum}
              </label>
              <select
                value={formData[`skill${slotNum}` as keyof typeof formData] as string || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  [`skill${slotNum}`]: e.target.value 
                }))}
                className="mh-select w-full"
              >
                <option value="">No skill</option>
                {allSkills.map(skill => (
                  <option key={skill} value={skill}>{skill}</option>
                ))}
              </select>
            </div>
          ))}
        </div>


        <div className="flex gap-4 pt-4">
          <button type="submit" className="mh-button">
            {editingTalisman ? 'Update Talisman' : 'Add Talisman'}
          </button>
          {editingTalisman && onCancel && (
            <button type="button" onClick={onCancel} className="mh-button-secondary">
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
