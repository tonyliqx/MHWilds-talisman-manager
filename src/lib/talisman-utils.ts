import { TalismanTemplate, UserTalisman, SLOT_MAPPINGS } from '@/types/talisman';

// Load talisman templates from JSON
export async function loadTalismanTemplates(): Promise<TalismanTemplate[]> {
  try {
    // In development, use absolute path from public folder
    // In production (static export), use relative path
    const path = process.env.NODE_ENV === 'development' 
      ? '/talisman-templates.json' 
      : './talisman-templates.json';
    
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error('Failed to load talisman templates');
    }
    return await response.json();
  } catch (error) {
    console.error('Error loading talisman templates:', error);
    return [];
  }
}

// Get all unique skills from templates
export function getAllSkills(templates: TalismanTemplate[]): string[] {
  const skillSet = new Set<string>();
  
  templates.forEach(template => {
    template._SkillPt_01_SkillList.forEach(skill => skillSet.add(skill));
    template._SkillPt_02_SkillList.forEach(skill => skillSet.add(skill));
    template._SkillPt_03_SkillList.forEach(skill => skillSet.add(skill));
  });
  
  return Array.from(skillSet).sort();
}

// Get filtered templates based on current selections
export function getFilteredTemplates(
  templates: TalismanTemplate[],
  rarity?: string,
  slotPt?: number,
  selectedSkills: string[] = []
): TalismanTemplate[] {
  return templates.filter(template => {
    // Filter by rarity
    if (rarity && template._Rare !== rarity) {
      return false;
    }

    // Filter by slot
    if (slotPt && template._SlotPt !== slotPt) {
      return false;
    }

    // Filter by skills - all selected skills must be available in this template
    // (at least one skill slot must contain each selected skill)
    for (const skill of selectedSkills) {
      if (skill && !template._SkillPt_01_SkillList.includes(skill) &&
          !template._SkillPt_02_SkillList.includes(skill) &&
          !template._SkillPt_03_SkillList.includes(skill)) {
        return false;
      }
    }

    return true;
  });
}

// Get available skills based on current filter
export function getAvailableSkills(
  templates: TalismanTemplate[],
  rarity?: string,
  slotPt?: number,
  selectedSkills: string[] = [],
  excludeSkills: string[] = []
): string[] {
  const filteredTemplates = getFilteredTemplates(templates, rarity, slotPt, selectedSkills);
  const skillSet = new Set<string>();
  
  // Create union of all skills from all skill lists in remaining templates
  filteredTemplates.forEach(template => {
    // Add all skills from SkillPt_01_SkillList
    template._SkillPt_01_SkillList?.forEach(skill => {
      if (!excludeSkills.includes(skill)) skillSet.add(skill);
    });
    
    // Add all skills from SkillPt_02_SkillList
    template._SkillPt_02_SkillList?.forEach(skill => {
      if (!excludeSkills.includes(skill)) skillSet.add(skill);
    });
    
    // Add all skills from SkillPt_03_SkillList
    template._SkillPt_03_SkillList?.forEach(skill => {
      if (!excludeSkills.includes(skill)) skillSet.add(skill);
    });
  });
  
  return Array.from(skillSet).sort();
}

// Get available slot options based on current filter
export function getAvailableSlots(
  templates: TalismanTemplate[],
  rarity?: string,
  selectedSkills: string[] = []
): Array<{slotPt: number, description: string}> {
  const filteredTemplates = getFilteredTemplates(templates, rarity, undefined, selectedSkills);
  const slotSet = new Set<number>();
  
  filteredTemplates.forEach(template => {
    slotSet.add(template._SlotPt);
  });
  
  return SLOT_MAPPINGS.filter(mapping => slotSet.has(mapping.slotPt));
}

// Get skills for a specific slot point
export function getSkillsForSlot(templates: TalismanTemplate[], slotPt: number): string[] {
  const skillSet = new Set<string>();
  
  templates.forEach(template => {
    if (template._SkillPt_01 === slotPt) {
      template._SkillPt_01_SkillList.forEach(skill => skillSet.add(skill));
    }
    if (template._SkillPt_02 === slotPt) {
      template._SkillPt_02_SkillList.forEach(skill => skillSet.add(skill));
    }
    if (template._SkillPt_03 === slotPt) {
      template._SkillPt_03_SkillList.forEach(skill => skillSet.add(skill));
    }
  });
  
  return Array.from(skillSet).sort();
}

// Get slot description from slot point
export function getSlotDescription(slotPt: number): string {
  const mapping = SLOT_MAPPINGS.find(m => m.slotPt === slotPt);
  return mapping ? mapping.description : '';
}

// Generate unique ID for talisman
export function generateTalismanId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Convert UserTalisman to CSV row
export function talismanToCSV(talisman: UserTalisman): string {
  return [
    talisman.rarity,
    talisman.skill1,
    talisman.skill2,
    talisman.skill3,
    talisman.slotDescription
  ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(',');
}

// Parse CSV row to UserTalisman
export function csvToTalisman(row: string, index: number): UserTalisman {
  const fields = row.split(',').map(field => 
    field.replace(/^"|"$/g, '').replace(/""/g, '"')
  );
  
  if (fields.length < 5) {
    throw new Error(`Invalid CSV row ${index + 1}: insufficient fields`);
  }
  
  const slotPt = SLOT_MAPPINGS.find(m => m.description === fields[4])?.slotPt || 1;
  
  return {
    id: generateTalismanId(),
    rarity: fields[0] || '稀有度5',
    skill1: fields[1] || '',
    skill2: fields[2] || '',
    skill3: fields[3] || '',
    slotDescription: fields[4] || '',
    slotPt: slotPt
  };
}

// Get available skills for skill slot 1 with cross-filtering
export function getAvailableSkills1(
  templates: TalismanTemplate[],
  rarity?: string,
  slotPt?: number,
  selectedSkills: string[] = []
): string[] {
  // First filter templates by rarity, slot, and existing selected skills
  const filteredTemplates = getFilteredTemplates(templates, rarity, slotPt, selectedSkills);
  const skillSet = new Set<string>();

  filteredTemplates.forEach(template => {
    template._SkillPt_01_SkillList?.forEach(skill => skillSet.add(skill));
  });

  return Array.from(skillSet).sort();
}

// Get available skills for skill slot 2 with cross-filtering
export function getAvailableSkills2(
  templates: TalismanTemplate[],
  rarity?: string,
  slotPt?: number,
  selectedSkills: string[] = []
): string[] {
  // First filter templates by rarity, slot, and existing selected skills
  const filteredTemplates = getFilteredTemplates(templates, rarity, slotPt, selectedSkills);
  const skillSet = new Set<string>();

  filteredTemplates.forEach(template => {
    template._SkillPt_02_SkillList?.forEach(skill => skillSet.add(skill));
  });

  return Array.from(skillSet).sort();
}

// Get available skills for skill slot 3 with cross-filtering
export function getAvailableSkills3(
  templates: TalismanTemplate[],
  rarity?: string,
  slotPt?: number,
  selectedSkills: string[] = []
): string[] {
  // First filter templates by rarity, slot, and existing selected skills
  const filteredTemplates = getFilteredTemplates(templates, rarity, slotPt, selectedSkills);
  const skillSet = new Set<string>();

  filteredTemplates.forEach(template => {
    template._SkillPt_03_SkillList?.forEach(skill => skillSet.add(skill));
  });

  return Array.from(skillSet).sort();
}

// CSV header
export const CSV_HEADER = 'Rarity,Skill1,Skill2,Skill3,SlotDescription';
