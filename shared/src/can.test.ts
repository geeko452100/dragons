import { describe, test, expect } from 'vitest';
import { can } from './can';
import { ABILITIES } from './abilities';
import { CLASS_PERMISSIONS } from './permissions';
import type { ClassName, Unit } from './types';

function makeUnit(className: ClassName): Unit {
  return {
    id: 1,
    name: 'test',
    class: className,
    level: 1,
    hp: 10,
    stats: { maxHp: 10, attack: 5, defense: 5, speed: 5 },
    equipment: [],
  };
}

describe('can()', () => {
  const warrior = makeUnit('warrior');
  const mage = makeUnit('mage');
  const warriorAbility = ABILITIES.find((a) => a.class === 'warrior');

  test('mage cannot use a warrior ability', () => {
    expect(warriorAbility).toBeDefined();
    expect(can(mage, { kind: 'useAbility', abilityId: warriorAbility!.id })).toBe(false);
  });

  test('warrior can use its own ability', () => {
    expect(warriorAbility).toBeDefined();
    expect(can(warrior, { kind: 'useAbility', abilityId: warriorAbility!.id })).toBe(true);
  });

  test('warrior cannot equip a staff', () => {
    expect(can(warrior, { kind: 'equip', itemType: 'staff' })).toBe(false);
  });

  test('warrior can equip a sword', () => {
    expect(can(warrior, { kind: 'equip', itemType: 'sword' })).toBe(true);
  });

  test('stat cap is enforced', () => {
    const cap = CLASS_PERMISSIONS.warrior.statCaps.attack;
    expect(can(warrior, { kind: 'raiseStat', stat: 'attack', toValue: cap })).toBe(true);
    expect(can(warrior, { kind: 'raiseStat', stat: 'attack', toValue: cap + 1 })).toBe(false);
  });
});
