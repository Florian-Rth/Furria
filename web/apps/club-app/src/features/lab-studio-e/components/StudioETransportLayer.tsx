import { KkStudioETransport } from '@furria/ui/KkStudioETransport';
import type { FC } from 'react';
import type { StudioPlayback } from '@/features/act-player/hooks/use-studio-playback';
import type { StudioEPractice } from '../hooks/use-studio-e-practice';
import type { StudioEVideo } from '../hooks/use-studio-e-video';
import {
  STUDIO_E_BACK,
  STUDIO_E_FORWARD,
  STUDIO_E_LOOP,
  STUDIO_E_TRANSPORT_LABEL,
  STUDIO_E_VIDEO,
} from '../studio-e-copy';
import { StudioEProgressLive } from './StudioEProgressLive';

interface StudioETransportLayerProps {
  playback: StudioPlayback;
  practice: StudioEPractice;
  video: StudioEVideo;
}

export const StudioETransportLayer: FC<StudioETransportLayerProps> = ({
  playback,
  practice,
  video,
}) => (
  <KkStudioETransport label={STUDIO_E_TRANSPORT_LABEL}>
    <StudioEProgressLive
      player={playback.player}
      length={playback.length}
      stops={practice.stops}
      loop={practice.loop}
      onSeek={practice.seekShare}
    />
    <KkStudioETransport.Row>
      <KkStudioETransport.Skip
        direction="back"
        label={STUDIO_E_BACK}
        disabled={!practice.canLoop}
        onSkip={practice.skipBack}
      />
      <KkStudioETransport.Play
        playing={practice.playing}
        label={practice.playLabel}
        disabled={!practice.canPlay}
        onToggle={practice.toggle}
      />
      <KkStudioETransport.Skip
        direction="forward"
        label={STUDIO_E_FORWARD}
        disabled={!practice.canLoop}
        onSkip={practice.skipForward}
      />
    </KkStudioETransport.Row>
    <KkStudioETransport.Row>
      <KkStudioETransport.Pill
        glyph="loop"
        text={STUDIO_E_LOOP}
        pressed={practice.looping}
        disabled={!practice.canLoop}
        onToggle={practice.toggleLoop}
      />
      <KkStudioETransport.Pill
        glyph="video"
        text={STUDIO_E_VIDEO}
        pressed={video.open}
        onToggle={video.toggleOpen}
      />
      <KkStudioETransport.Pill
        glyph="speed"
        text={practice.rateText}
        label={practice.rateLabel}
        pressed={practice.slowed}
        onToggle={practice.slowDown}
      />
    </KkStudioETransport.Row>
  </KkStudioETransport>
);
