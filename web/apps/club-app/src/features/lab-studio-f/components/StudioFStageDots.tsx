import { KkStudioFStageDots } from '@furria/ui/KkStudioFStageDots';
import type { FC } from 'react';
import { posesAt } from '@/features/act-player/choreography-motion';
import { usePlaybackSeconds } from '@/features/act-player/hooks/use-playback-seconds';
import type { StudioPlayback } from '@/features/act-player/hooks/use-studio-playback';
import type { StageViewpoint } from '@/features/act-player/stage-view';
import type { StudioSpot } from '@/features/acts/schemas';
import { stageDotsOf } from '../studio-f-stage';

interface StudioFStageDotsProps {
  playback: StudioPlayback;
  spots: readonly StudioSpot[];
  viewpoint: StageViewpoint;
}

export const StudioFStageDots: FC<StudioFStageDotsProps> = ({ playback, spots, viewpoint }) => {
  const seconds = usePlaybackSeconds(playback.player);
  const dots = stageDotsOf(
    posesAt(playback.paths, seconds),
    spots,
    playback.ownSpotId,
    playback.stage,
    viewpoint,
  );

  return <KkStudioFStageDots dots={dots} />;
};
