import { KkStudioCStage } from '@furria/ui/KkStudioCStage';
import type { FC } from 'react';
import { posesAt } from '@/features/act-player/choreography-motion';
import { usePlaybackSeconds } from '@/features/act-player/hooks/use-playback-seconds';
import type { StudioPlayback } from '@/features/act-player/hooks/use-studio-playback';
import type { Studio } from '@/features/acts/schemas';
import { STUDIO_C_STAGE_LABEL } from '../studio-c-copy';
import { dotsOf } from '../studio-c-timeline';

interface StudioCStageDotsProps {
  playback: StudioPlayback;
  studio: Studio;
}

export const StudioCStageDots: FC<StudioCStageDotsProps> = ({ playback, studio }) => {
  const { player, paths, ownSpotId, stage } = playback;
  const seconds = usePlaybackSeconds(player);
  const dots = dotsOf(posesAt(paths, seconds), studio.spots, ownSpotId, stage, 'audience');

  return (
    <KkStudioCStage
      widthMetres={stage.widthMetres}
      depthMetres={stage.depthMetres}
      artworkSvg={stage.artworkSvg}
      label={STUDIO_C_STAGE_LABEL}
      dots={dots}
    />
  );
};
