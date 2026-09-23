import type { FC } from 'react';
import type { KkBarMorphLeadingProps } from '../../bar-morph';
import { GlassDropFrame } from './layout/GlassDropFrame';
import { GlassDropSlotLayer } from './layout/GlassDropSlotLayer';
import { motionActOf } from './logic/glass-drop-plan';
import { arrivalOf, departureOf } from './logic/glass-drop-text';
import { useGlassDropLive } from './logic/use-glass-drop-live';
import { useGlassDropPlan } from './logic/use-glass-drop-plan';
import { GlassDropDrops } from './ui/GlassDropDrops';
import { GlassDropGhost } from './ui/GlassDropGhost';
import { GlassDropSettled } from './ui/GlassDropSettled';

export const GlassDropLeading: FC<KkBarMorphLeadingProps> = ({ scene }) => {
  const plan = useGlassDropPlan(scene);
  const live = useGlassDropLive(plan.act);
  const act = motionActOf(plan.act);
  const arrival = arrivalOf(plan);
  const departure = departureOf(plan);
  const dropping = live && act !== null;

  const ghost =
    live && plan.ghost !== null && departure !== null ? (
      <GlassDropGhost line={plan.ghost} departure={departure} />
    ) : null;
  const drops =
    dropping && act !== null ? (
      <GlassDropSlotLayer>
        <GlassDropDrops plan={plan} act={act} />
      </GlassDropSlotLayer>
    ) : null;

  return (
    <GlassDropFrame veiled={dropping}>
      <GlassDropSettled snapshot={scene.current} arrival={arrival} live={live} />
      {ghost}
      {drops}
    </GlassDropFrame>
  );
};
