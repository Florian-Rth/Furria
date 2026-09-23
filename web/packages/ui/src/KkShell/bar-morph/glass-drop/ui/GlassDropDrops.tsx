import type { FC } from 'react';
import { landingSecondsOf } from '../logic/glass-drop-paths';
import type { GlassDropMotionAct, GlassDropPlan } from '../logic/glass-drop-plan';
import { GlassDropBead } from './GlassDropBead';
import { GlassDropNeck } from './GlassDropNeck';
import { GlassDropRing } from './GlassDropRing';
import { GlassDropSpray } from './GlassDropSpray';

const RING_STAGGER = 0.14;

interface GlassDropDropsProps {
  plan: GlassDropPlan;
  act: GlassDropMotionAct;
}

export const GlassDropDrops: FC<GlassDropDropsProps> = ({ plan, act }) => {
  const landing = landingSecondsOf(act);
  const exchanging = act === 'exchange';

  const departing = exchanging ? (
    <>
      <GlassDropNeck direction={plan.direction} />
      <GlassDropBead part="leave" glyph={plan.from} direction={plan.direction} />
      <GlassDropSpray direction={plan.direction} />
    </>
  ) : null;
  const arrivingPart = exchanging ? 'arrive' : 'wobble';

  return (
    <>
      <GlassDropRing delay={landing} />
      <GlassDropRing delay={landing + RING_STAGGER} />
      {departing}
      <GlassDropBead part={arrivingPart} glyph={plan.to} direction={plan.direction} />
    </>
  );
};
