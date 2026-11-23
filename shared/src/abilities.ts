import { ClassName } from './types';

export type Ability = {
  id: number;
  name: string;
  class: ClassName;
  power: number;
};

export const ABILITIES: Ability[] = [
  // Warrior
  { id: 1, name: 'Power Strike', class: 'warrior', power: 12 },
  { id: 2, name: 'Shield Bash', class: 'warrior', power: 8 },

  // Mage
  { id: 3, name: 'Fireball', class: 'mage', power: 15 },
  { id: 4, name: 'Frost Bolt', class: 'mage', power: 10 },

  // Healer
  { id: 5, name: 'Heal', class: 'healer', power: 12 },
  { id: 6, name: 'Cure', class: 'healer', power: 6 },
];
