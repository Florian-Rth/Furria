import { usePlaybackSelection } from '@/features/act-player/hooks/use-playback-seconds';
import type { StudioPlayback } from '@/features/act-player/hooks/use-studio-playback';
import { eightsOfMarks, markIndexAt } from '../count-sheet';
import { clockLabelOf, countTextOf, eightTextOf, timeTextOf } from '../eights-copy';

export interface EightsClock {
  time: string;
  eight: string;
  count: string;
  label: string;
}

const TENTHS = 10;

export const useEightsClock = (playback: StudioPlayback): EightsClock => {
  const { player, countMarks } = playback;
  const eights = eightsOfMarks(countMarks);
  const tenths = usePlaybackSelection(player, (seconds) => Math.round(seconds * TENTHS));
  const index = usePlaybackSelection(player, (seconds) => markIndexAt(countMarks, seconds));
  const seconds = tenths / TENTHS;
  const eightNumber = index < 0 ? null : (eights[index] ?? 0) + 1;
  const count = countMarks[index]?.count ?? null;

  return {
    time: timeTextOf(seconds),
    eight: eightTextOf(eightNumber),
    count: countTextOf(count),
    label: clockLabelOf(seconds, eightNumber, count),
  };
};
