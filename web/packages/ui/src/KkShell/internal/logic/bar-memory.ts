import type { KkBarSnapshot } from '../../bar-morph';

export interface KkBarMemory {
  last: KkBarSnapshot | null;
  playedFrom: KkBarSnapshot | null;
}

export const createBarMemory = (): KkBarMemory => ({ last: null, playedFrom: null });
