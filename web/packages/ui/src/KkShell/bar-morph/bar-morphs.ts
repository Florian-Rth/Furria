import type { KkBarMorph, KkBarMorphName } from '../bar-morph';
import { broomSweepMorph } from './broom-sweep/broom-sweep-morph';
import { glassDropMorph } from './glass-drop/glass-drop-morph';
import { relayMorph } from './relay/relay-morph';

export const BAR_MORPHS: Record<KkBarMorphName, KkBarMorph> = {
  broomSweep: broomSweepMorph,
  relay: relayMorph,
  glassDrop: glassDropMorph,
};
