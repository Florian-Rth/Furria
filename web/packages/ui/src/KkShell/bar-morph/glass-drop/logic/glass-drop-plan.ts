import type { KkBarMorphScene, KkBarSnapshot } from '../../../bar-morph';
import type { KkScreenMove } from '../../../screen-move';

export type GlassDropGlyph = 'broom' | 'back' | 'close';
export type GlassDropAct = 'settled' | 'fade' | 'exchange' | 'wobble' | 'wave';
export type GlassDropDirection = 1 | -1;

export type GlassDropLine = { kind: 'wordmark' } | { kind: 'text'; text: string };

export interface GlassDropPlan {
  act: GlassDropAct;
  direction: GlassDropDirection;
  from: GlassDropGlyph;
  to: GlassDropGlyph;
  ghost: GlassDropLine | null;
}

interface GlassDropCue {
  scene: KkBarMorphScene;
  debut: boolean;
  reduced: boolean;
}

type GlassDropMove = Exclude<KkScreenMove, 'still'>;

const DIRECTIONS: Record<GlassDropMove, GlassDropDirection> = {
  deeper: 1,
  'lateral-forward': 1,
  shallower: -1,
  'lateral-back': -1,
};

const LATERAL_MOVES: readonly KkScreenMove[] = ['lateral-forward', 'lateral-back'];

export const glyphOf = (snapshot: KkBarSnapshot): GlassDropGlyph => {
  if (snapshot.origin === null) {
    return 'broom';
  }

  return snapshot.kind === 'fullscreen' ? 'close' : 'back';
};

export const restLineOf = (snapshot: KkBarSnapshot): GlassDropLine => {
  if (snapshot.kind === 'fullscreen' || snapshot.lead === 'title') {
    return { kind: 'text', text: snapshot.title };
  }

  if (snapshot.origin === null) {
    return { kind: 'wordmark' };
  }

  return { kind: 'text', text: snapshot.origin.label };
};

const actOf = (from: GlassDropGlyph, to: GlassDropGlyph, move: GlassDropMove): GlassDropAct => {
  if (from !== to) {
    return 'exchange';
  }

  return LATERAL_MOVES.includes(move) ? 'wave' : 'wobble';
};

export const glassDropPlanOf = ({ scene, debut, reduced }: GlassDropCue): GlassDropPlan => {
  const to = glyphOf(scene.current);
  const { previous, move } = scene;

  if (!debut || previous === null || move === 'still') {
    return { act: 'settled', direction: 1, from: to, to, ghost: null };
  }

  const from = glyphOf(previous);
  const act = reduced ? 'fade' : actOf(from, to, move);

  return { act, direction: DIRECTIONS[move], from, to, ghost: restLineOf(previous) };
};

export type GlassDropMotionAct = Exclude<GlassDropAct, 'settled' | 'fade'>;

export const motionActOf = (act: GlassDropAct): GlassDropMotionAct | null =>
  act === 'settled' || act === 'fade' ? null : act;
