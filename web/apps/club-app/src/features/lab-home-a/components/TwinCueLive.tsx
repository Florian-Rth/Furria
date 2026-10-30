import { KkTwin } from '@furria/ui/KkTwin';
import type { FC } from 'react';
import { usePlaybackSelection } from '@/features/act-player/hooks/use-playback-seconds';
import type { OwnCue } from '@/features/act-practice/practice-way';
import { cueOf, ownWayAt } from '@/features/act-practice/practice-way';
import type { TwinScreen } from '../hooks/use-twin-screen';
import { cueLineOf } from '../twin-copy';
import { cueToneOf, soonCountsOf } from '../twin-practice';

interface TwinCueLiveProps {
  screen: TwinScreen;
}

export const TwinCueLive: FC<TwinCueLiveProps> = ({ screen }) => {
  const { playback, ownPath, ownNumber } = screen;
  const { player, countMarks, state } = playback;
  const cueAt = (seconds: number): OwnCue | null =>
    ownPath === null ? null : cueOf(ownWayAt(ownPath.keyframes, countMarks, seconds, state.loop));
  const tone = usePlaybackSelection(player, (seconds) => cueToneOf(cueAt(seconds)));
  const counts = usePlaybackSelection(player, (seconds) => soonCountsOf(cueAt(seconds)));
  const text = cueLineOf(tone, counts, ownNumber);

  return <KkTwin.Cue tone={tone} text={text} />;
};
