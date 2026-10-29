import { KkStudioFStage } from '@furria/ui/KkStudioFStage';
import type { FC } from 'react';
import type { StudioPlayback } from '@/features/act-player/hooks/use-studio-playback';
import type { StudioSpot } from '@/features/acts/schemas';
import { STUDIO_F_FRONT, STUDIO_F_STAGE_LABEL } from '../studio-f-copy';
import { frontOf, viewpointOf } from '../studio-f-stage';
import { StudioFStageDots } from './StudioFStageDots';

interface StudioFStageViewProps {
  playback: StudioPlayback;
  spots: readonly StudioSpot[];
  mirrored: boolean;
}

export const StudioFStageView: FC<StudioFStageViewProps> = ({ playback, spots, mirrored }) => {
  const viewpoint = viewpointOf(mirrored);
  const { stage } = playback;

  return (
    <KkStudioFStage
      widthMetres={stage.widthMetres}
      depthMetres={stage.depthMetres}
      artworkSvg={stage.artworkSvg}
      front={frontOf(viewpoint)}
      frontLabel={STUDIO_F_FRONT}
      label={STUDIO_F_STAGE_LABEL}
    >
      <StudioFStageDots playback={playback} spots={spots} viewpoint={viewpoint} />
    </KkStudioFStage>
  );
};
