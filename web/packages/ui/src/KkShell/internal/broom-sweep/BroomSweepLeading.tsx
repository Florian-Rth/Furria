import type { FC } from 'react';
import type { KkBarScene } from '../logic/bar-scene';
import { KkShellBarLeading } from '../ui/KkShellBarLeading';
import { BroomSweepFrame } from './layout/BroomSweepFrame';
import { BroomSweepMarkSpot } from './layout/BroomSweepMarkSpot';
import { BroomSweepSettled } from './layout/BroomSweepSettled';
import { BroomSweepStage } from './layout/BroomSweepStage';
import { useBroomSweep } from './logic/use-broom-sweep';
import { BroomSweepDust } from './ui/BroomSweepDust';
import { BroomSweepFoldGlyph } from './ui/BroomSweepFoldGlyph';
import { BroomSweepGhostGlyph } from './ui/BroomSweepGhostGlyph';
import { BroomSweepGhostLine } from './ui/BroomSweepGhostLine';
import { BroomSweepSweeper } from './ui/BroomSweepSweeper';
import { BroomSweepTrail } from './ui/BroomSweepTrail';

interface BroomSweepLeadingProps {
  scene: KkBarScene;
  debut: boolean;
}

export const BroomSweepLeading: FC<BroomSweepLeadingProps> = ({ scene, debut }) => {
  const { frameRef, ghostRef, plan, sweeping } = useBroomSweep(scene, debut);
  const { kind, lead, title, origin } = scene.current;

  const stage =
    plan === null || !sweeping ? null : (
      <BroomSweepStage>
        <BroomSweepTrail />
        <BroomSweepGhostLine ref={ghostRef} ghost={plan.ghost} />
        <BroomSweepMarkSpot>
          <BroomSweepGhostGlyph glyph={plan.from} />
          <BroomSweepFoldGlyph ink="brand" />
          <BroomSweepFoldGlyph ink="ink" />
        </BroomSweepMarkSpot>
        <BroomSweepDust />
        <BroomSweepSweeper />
      </BroomSweepStage>
    );

  return (
    <BroomSweepFrame ref={frameRef}>
      <BroomSweepSettled>
        <KkShellBarLeading kind={kind} lead={lead} title={title} origin={origin ?? undefined} />
      </BroomSweepSettled>
      {stage}
    </BroomSweepFrame>
  );
};
