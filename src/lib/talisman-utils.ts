import { TalismanTemplate, UserTalisman, SLOT_MAPPINGS, SLOT_DETAILED_MAPPINGS } from '@/types/talisman';

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

// Parse skill name and level from skill string (e.g., "利刃Lv3" -> ["利刃", 3])
function parseSkillNameAndLevel(skillString: string): [string, number] {
  if (!skillString) return ['', 0];
  
  const match = skillString.match(/^(.+)Lv(\d+)$/);
  if (match) {
    return [match[1], parseInt(match[2])];
  }
  
  // If no Lv format, assume level 1
  return [skillString, 1];
}

// Convert UserTalisman to CSV row (new format for external use)
export function talismanToCSV(talisman: UserTalisman): string {
  const [skill1Name, skill1Level] = parseSkillNameAndLevel(talisman.skill1);
  const [skill2Name, skill2Level] = parseSkillNameAndLevel(talisman.skill2);
  const [skill3Name, skill3Level] = parseSkillNameAndLevel(talisman.skill3);
  
  // Get detailed slot breakdown from slotPt
  const slots = SLOT_DETAILED_MAPPINGS[talisman.slotPt] || [1, 0, 0, 0, 0, 0];
  
  return [
    skill1Name, skill1Level,
    skill2Name, skill2Level,
    skill3Name, skill3Level,
    ...slots
  ].join(',');
}

// Parse CSV row to UserTalisman (convert from external format to internal format)
export function csvToTalisman(row: string, index: number): UserTalisman {
  const fields = row.split(',').map(field =>
    field.replace(/^"|"$/g, '').replace(/""/g, '"')
  );

  if (fields.length < 12) {
    throw new Error(`Invalid CSV row ${index + 1}: insufficient fields (expected 12, got ${fields.length})`);
  }

  const skill1Name = fields[0] || '';
  const skill1Level = parseInt(fields[1]) || 0;
  const skill2Name = fields[2] || '';
  const skill2Level = parseInt(fields[3]) || 0;
  const skill3Name = fields[4] || '';
  const skill3Level = parseInt(fields[5]) || 0;
  
  const slots: [number, number, number, number, number, number] = [
    parseInt(fields[6]) || 0,  // armor1
    parseInt(fields[7]) || 0,  // armor2
    parseInt(fields[8]) || 0,  // armor3
    parseInt(fields[9]) || 0,  // weapon1
    parseInt(fields[10]) || 0, // weapon2
    parseInt(fields[11]) || 0  // weapon3
  ];

  // Find matching slotPt based on slots array
  const slotPt = Object.entries(SLOT_DETAILED_MAPPINGS).find(([_, slotArray]) =>
    JSON.stringify(slotArray) === JSON.stringify(slots)
  )?.[0] || '1';

  const slotDescription = SLOT_MAPPINGS.find(m => m.slotPt === parseInt(slotPt))?.description || '防具1级孔x1';

  return {
    id: generateTalismanId(),
    rarity: '稀有度5', // Default rarity since it's not in CSV
    skill1: skill1Name && skill1Level > 0 ? `${skill1Name}Lv${skill1Level}` : '',
    skill2: skill2Name && skill2Level > 0 ? `${skill2Name}Lv${skill2Level}` : '',
    skill3: skill3Name && skill3Level > 0 ? `${skill3Name}Lv${skill3Level}` : '',
    slotDescription,
    slotPt: parseInt(slotPt)
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
export const CSV_HEADER = 'Skill1,Skill1Level,Skill2,Skill2Level,Skill3,Skill3Level,ArmorSlot1,ArmorSlot2,ArmorSlot3,WeaponSlot1,WeaponSlot2,WeaponSlot3';
