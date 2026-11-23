export type ClassName = 'warrior' | 'mage' | 'healer';
export type ItemType = 'sword' | 'staff' | 'armor';
export type StatName = 'maxHp' | 'attack' | 'defense' | 'speed';

export type Stats = Record<StatName, number>;

// Item type declaration
export type Item = {
  id: number;
  name: string;
  type: ItemType;
};

// Unit type declaration
export type Unit = {
  id: number;
  name: string;
  class: ClassName;
  level: number;
  hp: number;
  stats: Stats;
  equipment: Item[];
};

// Monster type declaration
export type Monster = {
  id: number;
  name: string;
  hp: number;
  stats: Stats;
  isDragon: boolean;
};

// Permission type blueprint
export type Permission =
  | { kind: 'useAbility'; abilityId: number }
  | { kind: 'equip'; itemType: ItemType }
  | { kind: 'raiseStat'; stat: StatName; toValue: number };

// Action type blueprint
export type Action =
  | { kind: 'attack'; actorId: number; targetId: number }
  | { kind: 'useAbility'; actorId: number; abilityId: number; targetId: number }
  | { kind: 'defend'; actorId: number };

export type GameState = {
  party: Unit[];
  enemies: Monster[];
  turnOrder: number[];
  rngSeed: number;
  outcome: 'ongoing' | 'win' | 'lose';
};
