import { KkStudioCTransport } from '@furria/ui/KkStudioCTransport';
import type { FC } from 'react';
import { usePlaybackSelection } from '@/features/act-player/hooks/use-playback-seconds';
import type { MixPlayer } from '@/features/act-player/mix-player';
import { STUDIO_C_CLOCK_LABEL, totalClockOf } from '../studio-c-copy';
import { clockOf, minuteOf } from '../studio-c-timeline';

const TENTHS = 10;

interface StudioCClockProps {
  player: MixPlayer;
  length: number;
}

export const StudioCClock: FC<StudioCClockProps> = ({ player, length }) => {
  const tenths = usePlaybackSelection(player, (seconds) => Math.floor(seconds * TENTHS));
  const now = clockOf(tenths / TENTHS);
  const total = totalClockOf(minuteOf(length));

  return <KkStudioCTransport.Clock now={now} total={total} label={STUDIO_C_CLOCK_LABEL} />;
};
