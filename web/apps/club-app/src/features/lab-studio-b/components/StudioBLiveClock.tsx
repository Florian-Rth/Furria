import { KkStudioBTransport } from '@furria/ui/KkStudioBTransport';
import type { FC } from 'react';
import { usePlaybackSeconds } from '@/features/act-player/hooks/use-playback-seconds';
import { useStudioB } from '../studio-b-context';
import { clockOf, preciseClockOf } from '../studio-b-format';

export const StudioBLiveClock: FC = () => {
  const { playback } = useStudioB();
  const seconds = usePlaybackSeconds(playback.player);

  return (
    <KkStudioBTransport.Clock now={preciseClockOf(seconds)} total={clockOf(playback.length)} />
  );
};
