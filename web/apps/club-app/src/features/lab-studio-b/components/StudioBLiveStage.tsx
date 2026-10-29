import { KkStudioBStage } from '@furria/ui/KkStudioBStage';
import type { FC } from 'react';
import { usePlaybackSeconds } from '@/features/act-player/hooks/use-playback-seconds';
import { useStudioB } from '../studio-b-context';
import { AUDIENCE_LABEL, STAGE_LABEL } from '../studio-b-copy';
import { formationAt } from '../studio-b-formation';

export const StudioBLiveStage: FC = () => {
  const { studio, playback, practice } = useStudioB();
  const seconds = usePlaybackSeconds(playback.player);
  const dots = formationAt(
    playback.paths,
    studio.spots,
    playback.stage,
    playback.ownSpotId,
    seconds,
  );

  return (
    <KkStudioBStage
      widthMetres={playback.stage.widthMetres}
      depthMetres={playback.stage.depthMetres}
      artworkSvg={playback.stage.artworkSvg}
      dots={dots}
      turned={practice.mirrored}
      label={STAGE_LABEL}
      frontLabel={AUDIENCE_LABEL}
    />
  );
};
