import { KkTimeline } from '@furria/ui/KkTimeline';
import type { FC } from 'react';
import type { MixPlayer } from '../../../engine/mix-player';
import { waveformOf } from '../../../models/mix-waveform';
import type { MusicSegment } from '../../../models/music-timeline';
import type { AudioPeaks } from '../../../models/studio-schemas';
import { stripBarCountOf } from '../../centre-scrub';
import { stripWaveOf, waveBarsOf } from '../../timeline-geometry';
import { TimelineStrip } from '../layout/TimelineStrip';
import { useTimeline } from '../logic/timeline-context';
import { TimelineCentrePlayed } from './TimelineCentrePlayed';
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
  const { density, centre, length, window } = useTimeline();
  const span = centre === null ? undefined : { from: window.start, to: window.end };
  const bars =
    centre === null
      ? waveformOf(segments, peaks, waveBarsOf(density))
      : stripWaveOf(segments, peaks, window, length, stripBarCountOf(centre.strip));
  const played =
    span !== undefined ? (
      <TimelineCentrePlayed bars={bars} span={span} />
    ) : player === undefined ? null : (
      <TimelinePlayed player={player} playing={playing} bars={bars} />
    );

  return (
    <>
      <TimelineStrip>
        <KkTimeline.Wave bars={bars} revealSeconds={revealSeconds} span={span} />
      </TimelineStrip>
      {played}
    </>
  );
};
