import type { Monster } from './types';

export const MONSTERS: Monster[] = [
  {
    id: 1,
    name: 'Cave Rat',
    hp: 20,
    stats: { maxHp: 20, attack: 4, defense: 2, speed: 6 },
    isDragon: false,
  },
  {
    id: 2,
    name: 'Bog Goblin',
    hp: 30,
    stats: { maxHp: 30, attack: 6, defense: 3, speed: 5 },
    isDragon: false,
  },
  {
    id: 3,
    name: 'Thornback Wolf',
    hp: 45,
    stats: { maxHp: 45, attack: 9, defense: 4, speed: 9 },
    isDragon: false,
  },
  {
    id: 4,
    name: 'Rustplate Golem',
    hp: 70,
    stats: { maxHp: 70, attack: 12, defense: 9, speed: 4 },
    isDragon: false,
  },
  {
    id: 5,
    name: 'Ember Wraith',
    hp: 90,
    stats: { maxHp: 90, attack: 15, defense: 6, speed: 10 },
    isDragon: false,
  },
  {
    id: 6,
    name: 'Ashmaw the Dragon',
    hp: 150,
    stats: { maxHp: 150, attack: 20, defense: 12, speed: 8 },
    isDragon: true,
  },
];
