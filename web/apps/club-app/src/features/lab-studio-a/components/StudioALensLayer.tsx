import { KkStudioALens } from '@furria/ui/KkStudioALens';
import type { FC } from 'react';
import type { StudioPlayback } from '@/features/act-player/hooks/use-studio-playback';
import { useStudioALens } from '../hooks/use-studio-a-lens';
import { STUDIO_A_LENS_LABEL } from '../studio-a-copy';
import { StudioALensTrack } from './StudioALensTrack';

interface StudioALensLayerProps {
  playback: StudioPlayback;
}

export const StudioALensLayer: FC<StudioALensLayerProps> = ({ playback }) => {
  const lens = useStudioALens(playback);
  const beats = lens.beats.map((beat) => (
    <KkStudioALens.Beat key={beat.key} x={beat.x} count={beat.count} />
  ));
  const edges = lens.edges.map((edge) => (
    <KkStudioALens.Edge key={edge.key} x={edge.x} label={edge.label} />
  ));

  return (
    <KkStudioALens label={STUDIO_A_LENS_LABEL} onPick={lens.pick}>
      <StudioALensTrack
        player={playback.player}
        pixelsPerSecond={lens.pixelsPerSecond}
        width={lens.width}
      >
        <KkStudioALens.Wave values={lens.wave} />
        {edges}
        {beats}
      </StudioALensTrack>
    </KkStudioALens>
  );
};
