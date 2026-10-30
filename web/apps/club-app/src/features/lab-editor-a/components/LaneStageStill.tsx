import { KkLaneDot } from '@furria/ui/KkLaneDot';
import { KkStudioStage } from '@furria/ui/KkStudioStage';
import type { FC } from 'react';
import { STUDIO_FRONT } from '@/features/act-studio/studio-copy';
import { useLaneDots } from '../hooks/use-lane-dots';
import type { LaneEditor } from '../hooks/use-lane-editor';
import { LANE_STAGE } from '../lane-copy';

interface LaneStageStillProps {
  lane: LaneEditor;
  seconds: number;
}

const ignore = (): void => undefined;

export const LaneStageStill: FC<LaneStageStillProps> = ({ lane, seconds }) => {
  const { stage } = lane.screen.playback;
  const dots = useLaneDots(lane, seconds).map((dot) => (
    <KkLaneDot
      key={dot.key}
      x={dot.x}
      y={dot.y}
      number={dot.number}
      name={dot.name}
      kind={dot.kind}
      selected={false}
      dimmed={false}
      label={dot.label}
      nameAbove={dot.nameAbove}
      interactive={false}
      onPress={ignore}
      onMove={ignore}
      onEnd={ignore}
      onNudge={ignore}
    />
  ));

  return (
    <KkStudioStage
      label={LANE_STAGE}
      frontLabel={STUDIO_FRONT}
      widthMetres={stage.widthMetres}
      depthMetres={stage.depthMetres}
      artworkSvg={stage.artworkSvg}
      onClear={ignore}
    >
      {dots}
    </KkStudioStage>
  );
};
