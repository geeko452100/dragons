import { CLASS_PERMISSIONS } from './permissions';
import type { Unit, Permission } from './types';

export function can(member: Unit, permission: Permission): boolean {
  const rules = CLASS_PERMISSIONS[member.class];

  switch (permission.kind) {
    case 'useAbility':
      return rules.abilities.includes(permission.abilityId);
    case 'equip':
      return rules.equippable.includes(permission.itemType);
    case 'raiseStat':
      return permission.toValue <= rules.statCaps[permission.stat];
  }
}
