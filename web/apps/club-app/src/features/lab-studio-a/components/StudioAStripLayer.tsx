import { KkStudioAStrip } from '@furria/ui/KkStudioAStrip';
import type { FC } from 'react';
import type { StudioPlayback } from '@/features/act-player/hooks/use-studio-playback';
import type { StudioAPractice } from '../hooks/use-studio-a-practice';
import { useStudioAStrip } from '../hooks/use-studio-a-strip';
import { STUDIO_A_MUSIC_LABEL } from '../studio-a-copy';
import { StudioAPlayed } from './StudioAPlayed';
import { StudioAPlayhead } from './StudioAPlayhead';

interface StudioAStripLayerProps {
  playback: StudioPlayback;
  practice: StudioAPractice;
}

export const StudioAStripLayer: FC<StudioAStripLayerProps> = ({ playback, practice }) => {
  const strip = useStudioAStrip(playback, practice);
  const band = <KkStudioAStrip.Band items={strip.bands} />;
  const head = <StudioAPlayhead player={playback.player} length={playback.length} />;
  const loop =
    strip.loop === null ? null : <KkStudioAStrip.Loop from={strip.loop.from} to={strip.loop.to} />;

  return (
    <KkStudioAStrip
      label={STUDIO_A_MUSIC_LABEL}
      band={band}
      head={head}
      onSeek={practice.seekShare}
    >
      {loop}
      <KkStudioAStrip.Wave values={strip.wave} tone="rest" />
      <StudioAPlayed player={playback.player} length={playback.length}>
        <KkStudioAStrip.Wave values={strip.wave} tone="played" />
      </StudioAPlayed>
      <KkStudioAStrip.Marks marks={strip.marks} />
    </KkStudioAStrip>
  );
};
