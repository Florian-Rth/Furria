import type { KkGroupTone } from '@furria/ui/group-tone';
import { GROUP_TONES } from '@furria/ui/group-tone';

const HASH_BASE = 31;
const FIRST_POSITION = 1;

const slotSeedOf = (slot: string): number =>
  [...slot].reduce((seed, character) => (seed * HASH_BASE + character.charCodeAt(0)) >>> 0, 0);

export const vacancyToneOf = (slot: string, position: number): KkGroupTone =>
  GROUP_TONES[(slotSeedOf(slot) + position - FIRST_POSITION) % GROUP_TONES.length] ??
  GROUP_TONES[0];
