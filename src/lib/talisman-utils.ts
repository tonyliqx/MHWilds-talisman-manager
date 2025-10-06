import { TalismanTemplate, UserTalisman, SLOT_MAPPINGS, SLOT_DETAILED_MAPPINGS } from '@/types/talisman';

// Reverse mapping structures for CSV import
interface TemplateIndex {
  [key: string]: string; // "skill1Pt_skill2Pt_skill3Pt_slotPt" -> rarity
}

// Global reverse mappings (built once at startup)
let skillToSkillPtMap: Map<string, number[]> = new Map(); // skill name -> array of skillPts
let templateIndex: TemplateIndex = {};

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
    const templates = await response.json();
    
    // Build reverse mappings after loading templates
    buildReverseMappings(templates);
    
    return templates;
  } catch (error) {
    console.error('Error loading talisman templates:', error);
    return [];
  }
}

// Generate valid permutations of skillPts based on game rules:
// - SkillPt 1,2,3,4 (low group) always appear before SkillPt 5,6,7,8,9,10 (high group)
// - SkillPt 0 (empty) always appears at the end
// - Within each group, order can vary
function generateValidPermutations(skillPts: number[]): number[][] {
  const lowGroup: number[] = [];
  const highGroup: number[] = [];
  const zeroGroup: number[] = [];
  
  // Separate into low, high, and zero groups
  skillPts.forEach(pt => {
    if (pt === 0) {
      zeroGroup.push(pt);
    } else if (pt >= 1 && pt <= 4) {
      lowGroup.push(pt);
    } else if (pt >= 5 && pt <= 10) {
      highGroup.push(pt);
    }
  });
  
  // Generate all permutations of an array
  function permute(arr: number[]): number[][] {
    if (arr.length <= 1) return [arr];
    const result: number[][] = [];
    for (let i = 0; i < arr.length; i++) {
      const current = arr[i];
      const remaining = [...arr.slice(0, i), ...arr.slice(i + 1)];
      const remainingPerms = permute(remaining);
      remainingPerms.forEach(perm => {
        result.push([current, ...perm]);
      });
    }
    return result;
  }
  
  const lowPerms = permute(lowGroup);
  const highPerms = permute(highGroup);
  
  // Combine: each low permutation followed by each high permutation, followed by zeros
  const validPermutations: number[][] = [];
  for (const lowPerm of lowPerms) {
    for (const highPerm of highPerms) {
      validPermutations.push([...lowPerm, ...highPerm, ...zeroGroup]);
    }
  }
  
  return validPermutations;
}

// Build reverse mappings from templates
function buildReverseMappings(templates: TalismanTemplate[]) {
  skillToSkillPtMap.clear();
  templateIndex = {};

  templates.forEach(template => {
    // Get the three skillPt values and their corresponding skill lists
    const skillPts = [template._SkillPt_01, template._SkillPt_02, template._SkillPt_03];
    const skillLists = [template._SkillPt_01_SkillList, template._SkillPt_02_SkillList, template._SkillPt_03_SkillList];
    
    // Build skill mappings
    skillLists.forEach((skillList, index) => {
      const skillPt = skillPts[index];
      
      skillList?.forEach(skill => {
        if (!skill || skill === "无") return; // Skip empty skills
        
        const skillKey = skill.toLowerCase();
        // Map skill to its skillPt value(s) - allow multiple skillPts per skill
        if (!skillToSkillPtMap.has(skillKey)) {
          skillToSkillPtMap.set(skillKey, []);
        }
        const existingSkillPts = skillToSkillPtMap.get(skillKey)!;
        if (!existingSkillPts.includes(skillPt)) {
          existingSkillPts.push(skillPt);
        }
      });
    });

    // Build template index for rarity lookup - add ALL valid permutations
    const validPermutations = generateValidPermutations(skillPts);
    validPermutations.forEach(permutation => {
      const key = `${permutation[0]}_${permutation[1]}_${permutation[2]}_${template._SlotPt}`;
      templateIndex[key] = template._Rare;
    });
  });
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

// Infer rarity from skill and slot data
function inferRarity(skill1: string, skill2: string, skill3: string, slotPt: number): string {
  // Handle empty skills ("无" or empty strings)
  const skills = [skill1, skill2, skill3].filter(skill => skill && skill !== "无");

  if (skills.length === 0) {
    return 'unknown'; // Mark empty talismans as unknown
  }

  // Find skill points for each skill - now can be multiple values per skill
  const skillPtArrays: number[][] = [[0], [0], [0]]; // Default skill points
  
  skills.forEach((skill, index) => {
    const skillKey = skill.toLowerCase();
    const skillPts = skillToSkillPtMap.get(skillKey);
    
    if (skillPts && skillPts.length > 0) {
      skillPtArrays[index] = skillPts;
    }
  });

  // Try all combinations of skillPt values
  for (const skillPt1 of skillPtArrays[0]) {
    for (const skillPt2 of skillPtArrays[1]) {
      for (const skillPt3 of skillPtArrays[2]) {
        // Use the skillPt values in their original order (no sorting)
        const key = `${skillPt1}_${skillPt2}_${skillPt3}_${slotPt}`;
        const rarity = templateIndex[key];
        
        if (rarity) {
          return rarity; // Return first match found
        }
      }
    }
  }

  return 'unknown'; // Mark as unknown if no match found
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

  // Construct skill strings
  const skill1 = skill1Name && skill1Level > 0 && skill1Name !== "无" ? `${skill1Name}Lv${skill1Level}` : '';
  const skill2 = skill2Name && skill2Level > 0 && skill2Name !== "无" ? `${skill2Name}Lv${skill2Level}` : '';
  const skill3 = skill3Name && skill3Level > 0 && skill3Name !== "无" ? `${skill3Name}Lv${skill3Level}` : '';

  // Infer rarity from skill and slot data
  const rarity = inferRarity(skill1, skill2, skill3, parseInt(slotPt));

  return {
    id: generateTalismanId(),
    rarity,
    skill1,
    skill2,
    skill3,
    slotDescription,
    slotPt: parseInt(slotPt)
  };
}

// Helper: Get skills that can appear in a specific display position for a template
function getSkillsForDisplayPosition(
  template: TalismanTemplate,
  displayPosition: number // 0, 1, or 2 for first, second, third display position
): Set<string> {
  const skillPts = [template._SkillPt_01, template._SkillPt_02, template._SkillPt_03];
  const skillLists = [
    template._SkillPt_01_SkillList,
    template._SkillPt_02_SkillList,
    template._SkillPt_03_SkillList
  ];
  
  // Get all valid display orders for this template's skillPts
  const validPermutations = generateValidPermutations(skillPts);
  
  const skillsAtPosition = new Set<string>();
  
  // For each valid permutation, find which template slot appears at the display position
  validPermutations.forEach(permutation => {
    // Find which original template slot (0, 1, or 2) has this skillPt value at this display position
    const skillPtAtPosition = permutation[displayPosition];
    
    // Add skills from ALL slots that have this skillPt (handles duplicates)
    skillPts.forEach((pt, slotIndex) => {
      if (pt === skillPtAtPosition) {
        skillLists[slotIndex]?.forEach(skill => {
          if (skill && skill !== "无") {
            skillsAtPosition.add(skill);
          }
        });
      }
    });
  });
  
  return skillsAtPosition;
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
    const skillsAtPosition = getSkillsForDisplayPosition(template, 0);
    skillsAtPosition.forEach(skill => skillSet.add(skill));
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
    const skillsAtPosition = getSkillsForDisplayPosition(template, 1);
    skillsAtPosition.forEach(skill => skillSet.add(skill));
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
    const skillsAtPosition = getSkillsForDisplayPosition(template, 2);
    skillsAtPosition.forEach(skill => skillSet.add(skill));
  });

  return Array.from(skillSet).sort();
}

// CSV header
export const CSV_HEADER = 'Skill1,Skill1Level,Skill2,Skill2Level,Skill3,Skill3Level,ArmorSlot1,ArmorSlot2,ArmorSlot3,WeaponSlot1,WeaponSlot2,WeaponSlot3';
