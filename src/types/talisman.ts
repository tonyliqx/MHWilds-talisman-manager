export interface AmuletType {
  referenceType: string;
  name: string;
  index: number;
  fields: Array<{
    name: string;
    type: string;
    value: number;
  }>;
}

export interface TalismanTemplate {
  _Index: number;
  _AmuletType: AmuletType;
  _SkillPt_01: number;
  _SkillPt_02: number;
  _SkillPt_03: number;
  _SlotPt: number;
  _SkillPt_01_SkillList: string[];
  _SkillPt_02_SkillList: string[];
  _SkillPt_03_SkillList: string[];
  _SlotPt_SlotDescription: string;
  _Rare: string;
}

export interface UserTalisman {
  id: string;
  rarity: string;
  skill1: string;
  skill2: string;
  skill3: string;
  slotDescription: string;
  slotPt: number;
}

export interface SlotMapping {
  slotPt: number;
  description: string;
}

export const SLOT_MAPPINGS: SlotMapping[] = [
  { slotPt: 1, description: "防具1级孔x1" },
  { slotPt: 2, description: "防具1级孔x2" },
  { slotPt: 4, description: "防具2级孔x1" },
  { slotPt: 5, description: "防具2级孔x1,防具1级孔x1" },
  { slotPt: 6, description: "防具3级孔x1" },
  { slotPt: 11, description: "武器1级孔x1" },
  { slotPt: 12, description: "武器1级孔x1,防具1级孔x1" },
  { slotPt: 13, description: "武器1级孔x1,防具1级孔x2" },
];

// Mapping from slotPt to detailed slot breakdown [armor1, armor2, armor3, weapon1, weapon2, weapon3]
// This is only used for CSV export/import, not for the internal app structure
export const SLOT_DETAILED_MAPPINGS: Record<number, [number, number, number, number, number, number]> = {
  1: [1, 0, 0, 0, 0, 0],   // 防具1级孔x1
  2: [1, 1, 0, 0, 0, 0],   // 防具1级孔x2
  4: [2, 0, 0, 0, 0, 0],   // 防具2级孔x1
  5: [2, 1, 0, 0, 0, 0],   // 防具2级孔x1,防具1级孔x1
  6: [3, 0, 0, 0, 0, 0],   // 防具3级孔x1
  11: [0, 0, 0, 1, 0, 0],  // 武器1级孔x1
  12: [1, 0, 0, 1, 0, 0],  // 武器1级孔x1,防具1级孔x1
  13: [1, 1, 0, 1, 0, 0],  // 武器1级孔x1,防具1级孔x2
};

export const RARITY_OPTIONS = [
  "稀有度5",
  "稀有度6",
  "稀有度7",
  "稀有度8",
  "unknown"
];

export const RARITY_LABELS = {
  "稀有度5": "5",
  "稀有度6": "6",
  "稀有度7": "7",
  "稀有度8": "8",
  "unknown": "?"
};
