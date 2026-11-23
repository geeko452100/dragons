import { ABILITIES } from './abilities';
import { ClassName, ItemType, Stats } from './types';

// ClassPermissions type declaration
export type ClassPermissions = {
  abilities: number[];
  equippable: ItemType[];
  statCaps: Stats;
};

// Helper function to pull the ids for each class
function abilityIdsFor(className: ClassName): number[] {
  return ABILITIES.filter((a) => a.class === className).map((a) => a.id);
}

//Class based permisions and their stats
export const CLASS_PERMISSIONS: Record<ClassName, ClassPermissions> = {
  warrior: {
    abilities: abilityIdsFor('warrior'),
    equippable: ['sword', 'armor'],
    statCaps: { maxHp: 100, attack: 30, defense: 25, speed: 10 },
  },
  mage: {
    abilities: abilityIdsFor('mage'),
    equippable: ['staff'],
    statCaps: { maxHp: 60, attack: 30, defense: 10, speed: 20 },
  },
  healer: {
    abilities: abilityIdsFor('healer'),
    equippable: ['staff', 'armor'],
    statCaps: { maxHp: 80, attack: 12, defense: 20, speed: 20 },
  },
};
