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
  name: string;
  rarity: string;
  skill1: string;
  skill1Level: number;
  skill2: string;
  skill2Level: number;
  skill3: string;
  skill3Level: number;
  slotDescription: string;
  slotPt: number;
  notes?: string;
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

export const RARITY_OPTIONS = [
  "稀有度5",
  "稀有度6", 
  "稀有度7",
  "稀有度8"
];
