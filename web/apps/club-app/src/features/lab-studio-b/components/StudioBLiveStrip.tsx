import { KkStudioBTransport } from '@furria/ui/KkStudioBTransport';
import type { FC } from 'react';
import { usePlaybackSeconds } from '@/features/act-player/hooks/use-playback-seconds';
import { useStudioB } from '../studio-b-context';
import { STRIP_LABEL, WITHOUT_PART } from '../studio-b-copy';
import { clockOf } from '../studio-b-format';
import { stripBandsOf, stripLoopOf, stripTicksOf } from '../studio-b-manual';

export const StudioBLiveStrip: FC = () => {
  const { playback, practice } = useStudioB();
  const seconds = usePlaybackSeconds(playback.player);
  const { length, state } = playback;
  const bands = stripBandsOf(practice.manual, length).map((band) => ({
    ...band,
    name: band.name ?? WITHOUT_PART,
    current: band.key === practice.currentPart?.key,
  }));
  const share = length > 0 ? seconds / length : 0;
  const nudge = (direction: -1 | 1): void => {
    practice.actions.move(direction > 0 ? 'next' : 'previous');
  };

  return (
    <KkStudioBTransport.Strip
      bands={bands}
      ticks={stripTicksOf(practice.manual, length)}
      loop={stripLoopOf(state.loop, length)}
      position={share}
      label={STRIP_LABEL}
      valueText={clockOf(seconds)}
      onSeek={practice.actions.jump}
      onNudge={nudge}
    />
  );
};
