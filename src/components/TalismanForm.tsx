'use client';

import { useState, useEffect } from 'react';
import { UserTalisman, TalismanTemplate, SLOT_MAPPINGS, RARITY_OPTIONS } from '@/types/talisman';
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
    name: '',
    rarity: '稀有度5',
    skill1: '',
    skill1Level: 0,
    skill2: '',
    skill2Level: 0,
    skill3: '',
    skill3Level: 0,
    slotDescription: '防具1级孔x1',
    slotPt: 1,
    notes: ''
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
        name: '',
        rarity: '稀有度5',
        skill1: '',
        skill1Level: 0,
        skill2: '',
        skill2Level: 0,
        skill3: '',
        skill3Level: 0,
        slotDescription: '防具1级孔x1',
        slotPt: 1,
        notes: ''
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
      name: formData.name || `Talisman ${Date.now()}`,
      rarity: formData.rarity || '稀有度5',
      skill1: formData.skill1 || '',
      skill1Level: formData.skill1Level || 0,
      skill2: formData.skill2 || '',
      skill2Level: formData.skill2Level || 0,
      skill3: formData.skill3 || '',
      skill3Level: formData.skill3Level || 0,
      slotDescription: formData.slotDescription || '',
      slotPt: formData.slotPt || 1,
      notes: formData.notes || ''
    };

    onSubmit(talisman);
    
    if (!editingTalisman) {
      setFormData({
        name: '',
        rarity: '稀有度5',
        skill1: '',
        skill1Level: 0,
        skill2: '',
        skill2Level: 0,
        skill3: '',
        skill3Level: 0,
        slotDescription: '防具1级孔x1',
        slotPt: 1,
        notes: ''
      });
    }
  };

  return (
    <div className="mh-card p-6 rounded-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {editingTalisman ? 'Edit Talisman' : 'Add New Talisman'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Talisman Name
            </label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="mh-input w-full"
              placeholder="Enter talisman name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rarity
            </label>
            <select
              value={formData.rarity || '稀有度5'}
              onChange={(e) => setFormData(prev => ({ ...prev, rarity: e.target.value }))}
              className="mh-select w-full"
            >
              {RARITY_OPTIONS.map(rarity => (
                <option key={rarity} value={rarity}>{rarity}</option>
              ))}
            </select>
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
            <div key={slotNum} className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
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
              <input
                type="number"
                min="0"
                max="7"
                value={formData[`skill${slotNum}Level` as keyof typeof formData] as number || 0}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  [`skill${slotNum}Level`]: parseInt(e.target.value) || 0 
                }))}
                className="mh-input w-full"
                placeholder="Level"
              />
            </div>
          ))}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes
          </label>
          <textarea
            value={formData.notes || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            className="mh-input w-full h-20"
            placeholder="Additional notes..."
          />
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
