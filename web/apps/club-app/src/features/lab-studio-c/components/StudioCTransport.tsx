import { KkStudioCTransport } from '@furria/ui/KkStudioCTransport';
import type { FC } from 'react';
import type { StudioCDesk } from '../hooks/use-studio-c-desk';
import {
  STUDIO_C_FASTER,
  STUDIO_C_LOADING_MUSIC,
  STUDIO_C_LOOP_OFF,
  STUDIO_C_LOOP_ON,
  STUDIO_C_LOOP_TEXT,
  STUDIO_C_MIRROR_LABEL,
  STUDIO_C_MIRROR_TEXT,
  STUDIO_C_PAUSE,
  STUDIO_C_PLAY,
  STUDIO_C_RATE_CAPTION,
  STUDIO_C_SLOWER,
  STUDIO_C_TRANSPORT_LABEL,
} from '../studio-c-copy';
import { StudioCClock } from './StudioCClock';

const playLabelOf = (ready: boolean, playing: boolean): string => {
  if (!ready) {
    return STUDIO_C_LOADING_MUSIC;
  }

  return playing ? STUDIO_C_PAUSE : STUDIO_C_PLAY;
};

interface StudioCTransportProps {
  desk: StudioCDesk;
}

export const StudioCTransport: FC<StudioCTransportProps> = ({ desk }) => {
  const { playback, rate, looping, mirrored } = desk;
  const { state, controls, player, length } = playback;
  const ready = state.load === 'ready';
  const playLabel = playLabelOf(ready, state.playing);
  const loopLabel = looping ? STUDIO_C_LOOP_OFF : STUDIO_C_LOOP_ON;

  return (
    <KkStudioCTransport label={STUDIO_C_TRANSPORT_LABEL}>
      <KkStudioCTransport.Play
        playing={state.playing}
        label={playLabel}
        disabled={!ready}
        onToggle={controls.toggle}
      />
      <StudioCClock player={player} length={length} />
      <KkStudioCTransport.Gap />
      <KkStudioCTransport.Toggle
        glyph="loop"
        label={loopLabel}
        text={STUDIO_C_LOOP_TEXT}
        pressed={looping}
        onToggle={desk.toggleLoop}
      />
      <KkStudioCTransport.Rate
        value={rate.value}
        caption={STUDIO_C_RATE_CAPTION}
        slowed={rate.slowed}
        slowerLabel={STUDIO_C_SLOWER}
        fasterLabel={STUDIO_C_FASTER}
        canSlower={rate.canSlower}
        canFaster={rate.canFaster}
        onSlower={rate.slower}
        onFaster={rate.faster}
      />
      <KkStudioCTransport.Toggle
        glyph="mirror"
        label={STUDIO_C_MIRROR_LABEL}
        text={STUDIO_C_MIRROR_TEXT}
        pressed={mirrored}
        onToggle={desk.toggleMirror}
      />
    </KkStudioCTransport>
  );
};
