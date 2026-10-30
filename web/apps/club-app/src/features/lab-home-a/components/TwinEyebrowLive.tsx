import { KkTwin } from '@furria/ui/KkTwin';
import type { FC } from 'react';
import { usePlaybackSelection } from '@/features/act-player/hooks/use-playback-seconds';
import type { TwinScreen } from '../hooks/use-twin-screen';
import { eyebrowOf } from '../twin-copy';
import { eightAt } from '../twin-practice';

interface TwinEyebrowLiveProps {
  screen: TwinScreen;
}

export const TwinEyebrowLive: FC<TwinEyebrowLiveProps> = ({ screen }) => {
  const { playback, stepRange, stepEights, practice } = screen;
  const eight = usePlaybackSelection(playback.player, (seconds) =>
    eightAt(playback.countMarks, stepRange, seconds),
  );
  const text = eyebrowOf(practice.partName, eight, stepEights);

  return <KkTwin.Eyebrow text={text} />;
};
