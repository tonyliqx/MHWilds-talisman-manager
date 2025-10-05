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

// CSV header
export const CSV_HEADER = 'Rarity,Skill1,Skill2,Skill3,SlotDescription';
