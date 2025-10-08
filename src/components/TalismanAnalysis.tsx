'use client';

import { useState, useEffect } from 'react';
import { UserTalisman, SLOT_DETAILED_MAPPINGS } from '@/types/talisman';

interface TalismanAnalysisProps {
  talismans: UserTalisman[];
  onNavigateToTalisman?: (talismanId: string) => void;
}

interface SkillComparison {
  name: string;
  level: number;
}

interface DominanceRelation {
  dominantId: string;
  dominatedId: string;
  reason: string;
}

interface DuplicateGroup {
  ids: string[];
}

// Parse skill into name and level
function parseSkill(skill: string): SkillComparison | null {
  if (!skill || skill === '无') return null;
  
  const match = skill.match(/^(.+)Lv(\d+)$/);
  if (match) {
    return { name: match[1], level: parseInt(match[2]) };
  }
  return { name: skill, level: 1 };
}

// Compare two skills: returns 1 if skill1 > skill2, 0 if equal, -1 if skill1 < skill2, null if incomparable
function compareSkills(skill1: string, skill2: string): number | null {
  const parsed1 = parseSkill(skill1);
  const parsed2 = parseSkill(skill2);
  
  // If both are empty, they're equal
  if (!parsed1 && !parsed2) return 0;
  
  // If one is empty, the non-empty one is better
  if (!parsed1) return -1;
  if (!parsed2) return 1;
  
  // If names are different, they're incomparable
  if (parsed1.name !== parsed2.name) return null;
  
  // Same name, compare levels
  if (parsed1.level > parsed2.level) return 1;
  if (parsed1.level < parsed2.level) return -1;
  return 0;
}

// Check if slotPt1 is better than or equal to slotPt2
function compareSlots(slotPt1: number, slotPt2: number): number {
  if (slotPt1 === slotPt2) return 0;
  if (slotPt2 === 0) return 1;
  if (slotPt1 === 0) return -1;
  
  const slots1 = SLOT_DETAILED_MAPPINGS[slotPt1] || [0, 0, 0, 0, 0, 0];
  const slots2 = SLOT_DETAILED_MAPPINGS[slotPt2] || [0, 0, 0, 0, 0, 0];
  
  // Check if slots1 >= slots2 in all positions
  let allGreaterOrEqual = true;
  let anyGreater = false;
  
  for (let i = 0; i < 6; i++) {
    if (slots1[i] < slots2[i]) {
      allGreaterOrEqual = false;
      break;
    }
    if (slots1[i] > slots2[i]) {
      anyGreater = true;
    }
  }
  
  if (allGreaterOrEqual && anyGreater) return 1;
  if (allGreaterOrEqual && !anyGreater) return 0;
  
  // Check if slots2 >= slots1 in all positions
  let allLessOrEqual = true;
  let anyLess = false;
  
  for (let i = 0; i < 6; i++) {
    if (slots1[i] > slots2[i]) {
      allLessOrEqual = false;
      break;
    }
    if (slots1[i] < slots2[i]) {
      anyLess = true;
    }
  }
  
  if (allLessOrEqual && anyLess) return -1;
  
  // Incomparable
  return null as any;
}

// Check if talisman1 dominates or equals talisman2
function compareTalismans(t1: UserTalisman, t2: UserTalisman): { result: number | null; reason?: string } {
  // Get skills from both talismans
  const skills1 = [t1.skill1, t1.skill2, t1.skill3].filter(s => s && s !== '无');
  const skills2 = [t2.skill1, t2.skill2, t2.skill3].filter(s => s && s !== '无');
  
  // Try all permutations of skills to find the best matching
  const perms2 = getPermutations(skills2);
  
  let bestMatch: { canDominate: boolean; isEqual: boolean; reason: string } | null = null;
  
  for (const perm2 of perms2) {
    let canDominate = true;
    let isEqual = true;
    const comparisons: string[] = [];
    
    // Pad arrays to length 3
    const padded1 = [...skills1];
    while (padded1.length < 3) padded1.push('');
    
    const padded2 = [...perm2];
    while (padded2.length < 3) padded2.push('');
    
    // Compare each skill position
    for (let i = 0; i < 3; i++) {
      const cmp = compareSkills(padded1[i], padded2[i]);
      
      if (cmp === null) {
        // Incomparable skills
        canDominate = false;
        break;
      }
      
      if (cmp < 0) {
        // t1's skill is worse
        canDominate = false;
        break;
      }
      
      if (cmp > 0) {
        isEqual = false;
        comparisons.push(`Skill${i + 1}: ${padded1[i] || '(none)'} > ${padded2[i] || '(none)'}`);
      } else {
        comparisons.push(`Skill${i + 1}: ${padded1[i] || '(none)'} = ${padded2[i] || '(none)'}`);
      }
    }
    
    if (canDominate) {
      // Also check slots
      const slotCmp = compareSlots(t1.slotPt, t2.slotPt);
      
      if (slotCmp === null) {
        canDominate = false;
      } else if (slotCmp < 0) {
        canDominate = false;
      } else {
        if (slotCmp > 0) {
          isEqual = false;
          comparisons.push(`Slots: ${t1.slotDescription} > ${t2.slotDescription}`);
        } else {
          comparisons.push(`Slots: ${t1.slotDescription} = ${t2.slotDescription}`);
        }
        
        bestMatch = {
          canDominate: true,
          isEqual,
          reason: comparisons.join(', ')
        };
        break;
      }
    }
  }
  
  if (bestMatch) {
    if (bestMatch.isEqual) {
      return { result: 0, reason: 'Duplicate: ' + bestMatch.reason };
    } else {
      return { result: 1, reason: bestMatch.reason };
    }
  }
  
  return { result: null };
}

function getPermutations<T>(arr: T[]): T[][] {
  if (arr.length <= 1) return [arr];
  
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i++) {
    const current = arr[i];
    const remaining = [...arr.slice(0, i), ...arr.slice(i + 1)];
    const remainingPerms = getPermutations(remaining);
    
    remainingPerms.forEach(perm => {
      result.push([current, ...perm]);
    });
  }
  
  return result;
}

export default function TalismanAnalysis({ talismans }: TalismanAnalysisProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [dominanceRelations, setDominanceRelations] = useState<DominanceRelation[]>([]);
  const [duplicates, setDuplicates] = useState<DuplicateGroup[]>([]);

  const scrollToTalisman = (talismanId: string) => {
    // Dispatch event to expand the section if needed
    const expandEvent = new CustomEvent('expandTalismanSection', {
      detail: { talismanId }
    });
    window.dispatchEvent(expandEvent);
    
    // Wait a brief moment for the section to expand, then scroll
    setTimeout(() => {
      const element = document.getElementById(`talisman-row-${talismanId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Add a highlight effect
        element.classList.add('bg-yellow-200');
        setTimeout(() => {
          element.classList.remove('bg-yellow-200');
        }, 2000);
      }
    }, 100);
  };

  useEffect(() => {
    // Analyze talismans
    const newDominanceRelations: DominanceRelation[] = [];
    const duplicateMap: Map<string, string[]> = new Map();
    
    for (let i = 0; i < talismans.length; i++) {
      for (let j = i + 1; j < talismans.length; j++) {
        const t1 = talismans[i];
        const t2 = talismans[j];
        
        const comparison = compareTalismans(t1, t2);
        
        if (comparison.result === 1) {
          // t1 dominates t2
          newDominanceRelations.push({
            dominantId: t1.id,
            dominatedId: t2.id,
            reason: comparison.reason || ''
          });
        } else if (comparison.result === -1) {
          // t2 dominates t1
          const reverseComparison = compareTalismans(t2, t1);
          newDominanceRelations.push({
            dominantId: t2.id,
            dominatedId: t1.id,
            reason: reverseComparison.reason || ''
          });
        } else if (comparison.result === 0) {
          // Duplicates
          const key = [t1.id, t2.id].sort().join('_');
          if (!duplicateMap.has(key)) {
            duplicateMap.set(key, [t1.id, t2.id]);
          }
        }
      }
    }
    
    setDominanceRelations(newDominanceRelations);
    setDuplicates(Array.from(duplicateMap.values()).map(ids => ({ ids })));
  }, [talismans]);

  const getTalismanById = (id: string) => talismans.find(t => t.id === id);

  const totalIssues = dominanceRelations.length + duplicates.length;

  return (
    <div className="mh-card p-6 rounded-lg">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left mb-4"
      >
        <h2 className="text-2xl font-bold text-gray-700">
          Talisman Analysis {totalIssues > 0 && (
            <span className="text-red-600">({totalIssues} issues found)</span>
          )}
        </h2>
        <span className="text-2xl text-gray-500">
          {isExpanded ? '−' : '+'}
        </span>
      </button>

      {isExpanded && (
        <div className="space-y-6">
          {/* Dominated Talismans */}
          {dominanceRelations.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-orange-700 mb-4">
                Dominated Talismans ({dominanceRelations.length})
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                These talismans are strictly worse than others in your inventory. Consider deleting them.
              </p>
              <div className="space-y-4">
                {dominanceRelations.map((rel, idx) => {
                  const dominant = getTalismanById(rel.dominantId);
                  const dominated = getTalismanById(rel.dominatedId);
                  
                  if (!dominant || !dominated) return null;
                  
                  return (
                    <div key={idx} className="border-2 border-orange-300 rounded-lg p-4 bg-orange-50">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                        <div className="text-center">
                          <div className="font-bold text-green-700 mb-2">✓ Better Talisman</div>
                          <div className="text-sm text-gray-700">
                            <div className="font-medium text-gray-800">{dominant.rarity}</div>
                            <div>{dominant.skill1 || '−'}</div>
                            <div>{dominant.skill2 || '−'}</div>
                            <div>{dominant.skill3 || '−'}</div>
                            <div className="text-xs text-gray-600">{dominant.slotDescription}</div>
                          </div>
                          <button
                            onClick={() => scrollToTalisman(dominant.id)}
                            className="mt-2 px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors"
                          >
                            View in List
                          </button>
                        </div>
                        
                        <div className="text-center text-2xl font-bold text-gray-500">
                          &gt;
                        </div>
                        
                        <div className="text-center">
                          <div className="font-bold text-red-700 mb-2">✗ Dominated (Can Delete)</div>
                          <div className="text-sm text-gray-700">
                            <div className="font-medium text-gray-800">{dominated.rarity}</div>
                            <div>{dominated.skill1 || '−'}</div>
                            <div>{dominated.skill2 || '−'}</div>
                            <div>{dominated.skill3 || '−'}</div>
                            <div className="text-xs text-gray-600">{dominated.slotDescription}</div>
                          </div>
                          <button
                            onClick={() => scrollToTalisman(dominated.id)}
                            className="mt-2 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors"
                          >
                            View in List
                          </button>
                        </div>
                      </div>
                      <div className="mt-3 text-xs text-gray-600 text-center">
                        {rel.reason}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Duplicates */}
          {duplicates.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-blue-700 mb-4">
                Duplicate Talismans ({duplicates.length} groups)
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                These talismans are identical. Consider keeping only one from each group.
              </p>
              <div className="space-y-4">
                {duplicates.map((group, idx) => {
                  const talismansInGroup = group.ids.map(getTalismanById).filter(Boolean) as UserTalisman[];
                  if (talismansInGroup.length === 0) return null;
                  
                  const representative = talismansInGroup[0];
                  
                  return (
                    <div key={idx} className="border-2 border-blue-300 rounded-lg p-4 bg-blue-50">
                      <div className="font-bold text-blue-700 mb-2">
                        {group.ids.length} identical talismans found
                      </div>
                      <div className="text-sm text-gray-700">
                        <div className="font-medium text-gray-800">{representative.rarity}</div>
                        <div>{representative.skill1 || '−'}</div>
                        <div>{representative.skill2 || '−'}</div>
                        <div>{representative.skill3 || '−'}</div>
                        <div className="text-xs text-gray-600">{representative.slotDescription}</div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2 justify-center">
                        {group.ids.map((id, i) => (
                          <button
                            key={id}
                            onClick={() => scrollToTalisman(id)}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                          >
                            View Copy #{i + 1}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* No issues found */}
          {totalIssues === 0 && (
            <div className="text-center py-8 text-gray-600">
              <div className="text-4xl mb-4">✓</div>
              <div className="text-lg font-medium">No issues found!</div>
              <div className="text-sm">Your talisman collection is optimized.</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

