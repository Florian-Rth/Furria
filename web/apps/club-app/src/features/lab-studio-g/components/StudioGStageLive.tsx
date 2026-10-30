import { KkStudioGStage } from '@furria/ui/KkStudioGStage';
import type { FC } from 'react';
import { usePlaybackSeconds } from '@/features/act-player/hooks/use-playback-seconds';
import type { StudioPlayback } from '@/features/act-player/hooks/use-studio-playback';
import type { StageViewpoint } from '@/features/act-player/stage-view';
import type { StudioSpot } from '@/features/acts/schemas';
import { spotDotLabelOf } from '../studio-g-copy';
import { editDotsAt, selectedTrailsAt } from '../studio-g-stage';

interface StudioGStageLiveProps {
  playback: StudioPlayback;
  spots: readonly StudioSpot[];
  viewpoint: StageViewpoint;
  selectedIds: readonly number[];
  dragging: boolean;
}

export const StudioGStageLive: FC<StudioGStageLiveProps> = ({
  playback,
  spots,
  viewpoint,
  selectedIds,
  dragging,
}) => {
  const { player, paths, stage, countMarks, state } = playback;
  const seconds = usePlaybackSeconds(player);
  const gliding = !state.playing && !dragging;
  const trails = selectedTrailsAt(paths, countMarks, stage, viewpoint, selectedIds, seconds).map(
    (trail) => <KkStudioGStage.Trail key={trail.spotId} points={trail.points} />,
  );
  const dots = editDotsAt(paths, spots, stage, viewpoint, selectedIds, seconds).map((dot) => (
    <KkStudioGStage.Dot
      key={dot.spotId}
      spotId={dot.spotId}
      x={dot.x}
      y={dot.y}
      number={dot.number}
      label={spotDotLabelOf(dot.number, dot.person)}
      kind={dot.kind}
      selected={dot.selected}
      gliding={gliding}
    />
  ));

  return (
    <>
      {trails}
      {dots}
    </>
  );
};
