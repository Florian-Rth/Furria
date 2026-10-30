import { KkStudioGTransport } from '@furria/ui/KkStudioGTransport';
import type { FC } from 'react';
import { usePlaybackSelection } from '@/features/act-player/hooks/use-playback-seconds';
import type { MixPlayer } from '@/features/act-player/mix-player';
import type { CountMark } from '@/features/act-player/music-timeline';
import { clockLabelOf, countLineOf, timecodeOf } from '../studio-g-copy';
import { countReadingAt } from '../studio-g-timeline';

interface StudioGClockLiveProps {
  player: MixPlayer;
  marks: readonly CountMark[];
}

export const StudioGClockLive: FC<StudioGClockLiveProps> = ({ player, marks }) => {
  const time = usePlaybackSelection(player, timecodeOf);
  const count = usePlaybackSelection(player, (seconds) =>
    countLineOf(countReadingAt(marks, seconds)),
  );
  const label = usePlaybackSelection(player, (seconds) =>
    clockLabelOf(timecodeOf(seconds), countReadingAt(marks, seconds)),
  );

  return <KkStudioGTransport.Clock time={time} count={count} label={label} />;
};
