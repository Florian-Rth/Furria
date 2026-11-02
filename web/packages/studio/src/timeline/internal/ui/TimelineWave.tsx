import { KkTimeline } from '@furria/ui/KkTimeline';
import type { FC } from 'react';
import type { MixPlayer } from '../../../engine/mix-player';
import { waveformOf } from '../../../models/mix-waveform';
import type { MusicSegment } from '../../../models/music-timeline';
import type { AudioPeaks } from '../../../models/studio-schemas';
import { waveBarsOf } from '../../timeline-geometry';
import { useTimeline } from '../logic/timeline-context';
import { TimelinePlayed } from './TimelinePlayed';

interface TimelineWaveProps {
  segments: readonly MusicSegment[];
  peaks: ReadonlyMap<number, AudioPeaks>;
  player?: MixPlayer;
  playing?: boolean;
  revealSeconds?: number | null;
}

export const TimelineWave: FC<TimelineWaveProps> = ({
  segments,
  peaks,
  player,
  playing = false,
  revealSeconds = null,
}) => {
  const { density } = useTimeline();
  const bars = waveformOf(segments, peaks, waveBarsOf(density));
  const played =
    player === undefined ? null : <TimelinePlayed player={player} playing={playing} bars={bars} />;

  return (
    <>
      <KkTimeline.Wave bars={bars} revealSeconds={revealSeconds} />
      {played}
    </>
  );
};
