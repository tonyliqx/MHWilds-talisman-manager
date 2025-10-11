'use client';

import { useState, useEffect } from 'react';
import { UserTalisman, TalismanTemplate, SLOT_MAPPINGS, RARITY_OPTIONS, RARITY_LABELS } from '@/types/talisman';
import { loadTalismanTemplates, getAvailableSlots, getAvailableSkills1, getAvailableSkills2, getAvailableSkills3, generateTalismanId } from '@/lib/talisman-utils';

interface TalismanFormProps {
  onSubmit: (talisman: UserTalisman) => void;
  editingTalisman?: UserTalisman | null;
  onCancel?: () => void;
}

interface SkillAutocompleteProps {
  label: string;
  value: string;
  availableSkills: string[];
  onChange: (value: string) => void;
  fieldId: string; // Unique identifier for this field
}

function SkillAutocomplete({ label, value, availableSkills, onChange, fieldId }: SkillAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [filteredSkills, setFilteredSkills] = useState<string[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  // Update input value when prop value changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Filter skills based on input
  useEffect(() => {
    if (inputValue.trim() === '') {
      setFilteredSkills(availableSkills);
    } else {
      const filtered = availableSkills.filter(skill =>
        skill.toLowerCase().includes(inputValue.toLowerCase())
      );
      setFilteredSkills(filtered);
    }
    setHighlightedIndex(-1); // Reset highlight when filter changes
  }, [inputValue, availableSkills]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0) {
      const element = document.getElementById(`${fieldId}-option-${highlightedIndex}`);
      element?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [highlightedIndex, fieldId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setIsOpen(true);
    onChange(newValue);
  };

  const handleSkillSelect = (skill: string) => {
    if (!skill) return; // Safety check: don't select undefined/null/empty
    setInputValue(skill);
    setIsOpen(false);
    setHighlightedIndex(-1);
    onChange(skill);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
    setHighlightedIndex(-1); // Reset to allow Tab to start from first option
  };

  const handleInputBlur = () => {
    // Delay closing to allow for click on dropdown item
    setTimeout(() => {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }, 150);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (filteredSkills.length > 0) {
          setIsOpen(true);
          setHighlightedIndex(0);
        }
      }
      return;
    }

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;

      case 'ArrowDown':
        e.preventDefault();
        if (filteredSkills.length > 0) {
          setHighlightedIndex(prev => 
            prev < filteredSkills.length - 1 ? prev + 1 : prev
          );
        }
        break;

      case 'ArrowUp':
        e.preventDefault();
        if (filteredSkills.length > 0) {
          setHighlightedIndex(prev => (prev > 0 ? prev - 1 : 0));
        }
        break;

      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredSkills.length && filteredSkills[highlightedIndex]) {
          handleSkillSelect(filteredSkills[highlightedIndex]);
        } else if (filteredSkills.length === 1 && filteredSkills[0]) {
          // If there's only one option, select it
          handleSkillSelect(filteredSkills[0]);
        }
        break;

      case 'Tab':
        if (e.shiftKey) {
          // Shift+Tab: Move backward
          if (highlightedIndex <= 0 || filteredSkills.length === 0) {
            // At first option or before, or no options, close dropdown and let default Tab behavior work
            setIsOpen(false);
            setHighlightedIndex(-1);
            // Don't prevent default - let tab move to previous field naturally
          } else {
            e.preventDefault();
            setHighlightedIndex(prev => prev - 1);
          }
        } else {
          // Tab: Move forward
          if (filteredSkills.length === 0) {
            // No options available, close and move to next field
            setIsOpen(false);
            setHighlightedIndex(-1);
            // Don't prevent default - let tab move to next field naturally
          } else if (highlightedIndex === -1) {
            // No option selected yet, move to first option
            e.preventDefault();
            setHighlightedIndex(0);
          } else if (highlightedIndex < filteredSkills.length - 1) {
            // In the middle of options, move to next option
            e.preventDefault();
            setHighlightedIndex(prev => prev + 1);
          } else if (highlightedIndex === filteredSkills.length - 1 && filteredSkills[highlightedIndex]) {
            // At last option and it exists, select it and close, then let tab move to next field
            handleSkillSelect(filteredSkills[highlightedIndex]);
            setIsOpen(false);
            setHighlightedIndex(-1);
            // Don't prevent default - let tab move to next field naturally
          } else {
            // Safety fallback: close and move on
            setIsOpen(false);
            setHighlightedIndex(-1);
            // Don't prevent default - let tab move to next field naturally
          }
        }
        break;
    }
  };

  return (
    <div className="skill-autocomplete-container">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          placeholder="Type to search skills..."
          className="mh-autocomplete-input w-full"
        />
        {isOpen && filteredSkills.length > 0 && (
          <div className="absolute z-[9999] w-full mt-1 mh-autocomplete-dropdown max-h-60 overflow-y-auto p-2 space-y-1">
            {filteredSkills.map((skill, index) => (
              <button
                key={skill}
                id={`${fieldId}-option-${index}`}
                type="button"
                onClick={() => handleSkillSelect(skill)}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={`w-full px-4 py-2.5 text-left text-sm font-medium rounded-lg transition-all duration-150 ${
                  index === highlightedIndex 
                    ? 'bg-amber-600 text-white shadow-md transform scale-[1.02]' 
                    : 'bg-amber-50 text-amber-900 hover:bg-amber-200'
                }`}
              >
                {skill}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function TalismanForm({ onSubmit, editingTalisman, onCancel }: TalismanFormProps) {
  const [templates, setTemplates] = useState<TalismanTemplate[]>([]);
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

  // Auto-update slot when rarity changes and current slot is no longer valid
  useEffect(() => {
    if (templates.length > 0) {
      const availableSlots = getAvailableSlots(templates, formData.rarity, []);
      const currentSlotIsValid = availableSlots.some(slot => slot.slotPt === formData.slotPt);
      
              if (!currentSlotIsValid && availableSlots.length > 0) {
                // Current slot is invalid, switch to first available slot and clear skills
                const newSlot = availableSlots[0];
                setFormData(prev => ({
                  ...prev,
                  slotPt: newSlot.slotPt,
                  slotDescription: newSlot.description,
                  skill1: '',
                  skill2: '',
                  skill3: ''
                }));
              }
    }
  }, [formData.rarity, templates]);

  // Get available options based on current selections
  const availableSlots = getAvailableSlots(templates, formData.rarity, []);
  
  // Get available skills for each slot with cross-filtering
  // Each slot gets skills available when OTHER slots are considered
  const availableSkills1 = getAvailableSkills1(
    templates, 
    formData.rarity, 
    formData.slotPt, 
    [formData.skill2, formData.skill3].filter(Boolean) as string[]
  );
  const availableSkills2 = getAvailableSkills2(
    templates, 
    formData.rarity, 
    formData.slotPt, 
    [formData.skill1, formData.skill3].filter(Boolean) as string[]
  );
  const availableSkills3 = getAvailableSkills3(
    templates, 
    formData.rarity, 
    formData.slotPt, 
    [formData.skill1, formData.skill2].filter(Boolean) as string[]
  );

  const handleSlotChange = (slotPt: number) => {
    const mapping = SLOT_MAPPINGS.find(m => m.slotPt === slotPt);
    setFormData(prev => ({
      ...prev,
      slotPt,
      slotDescription: mapping?.description || '',
      // Clear skills when slot changes as they might not be valid for new slot
      skill1: '',
      skill2: '',
      skill3: ''
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
    <div className="mh-card p-6 rounded-lg relative z-20">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {availableSlots.map(mapping => (
                      <button
                        key={mapping.slotPt}
                        type="button"
                        onClick={() => handleSlotChange(mapping.slotPt)}
                        className={`px-4 py-3 rounded-lg font-medium text-sm transition-colors text-left ${
                          formData.slotPt === mapping.slotPt
                            ? 'bg-amber-600 text-white'
                            : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                        }`}
                      >
                        {mapping.description}
                      </button>
                    ))}
                  </div>
                </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SkillAutocomplete
            fieldId="skill1"
            label="Skill 1"
            value={formData.skill1 || ''}
            availableSkills={availableSkills1}
            onChange={(value) => setFormData(prev => ({ ...prev, skill1: value }))}
          />

          <SkillAutocomplete
            fieldId="skill2"
            label="Skill 2"
            value={formData.skill2 || ''}
            availableSkills={availableSkills2}
            onChange={(value) => setFormData(prev => ({ ...prev, skill2: value }))}
          />

          <SkillAutocomplete
            fieldId="skill3"
            label="Skill 3"
            value={formData.skill3 || ''}
            availableSkills={availableSkills3}
            onChange={(value) => setFormData(prev => ({ ...prev, skill3: value }))}
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
