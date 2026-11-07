import type { KkTimelineWaveLane } from '@furria/ui/KkTimeline';
import { KkTimeline } from '@furria/ui/KkTimeline';
import type { FC } from 'react';
import { waveformOf } from '../../../models/mix-waveform';
import type { MusicSegment, TimelineRange } from '../../../models/music-timeline';
import type { AudioPeaks } from '../../../models/studio-schemas';
import { stripBarCountOf } from '../../centre-scrub';
import { shareOf, stripWaveOf, waveBarsOf } from '../../timeline-geometry';
import { TimelineStrip } from '../layout/TimelineStrip';
import { useTimeline } from '../logic/timeline-context';
import { TimelineCentrePlayed } from './TimelineCentrePlayed';

interface TimelineWaveProps {
  segments: readonly MusicSegment[];
  peaks: ReadonlyMap<number, AudioPeaks>;
  revealSeconds?: number | null;
  lane?: KkTimelineWaveLane;
  within?: TimelineRange | null;
}

export const TimelineWave: FC<TimelineWaveProps> = ({
  segments,
  peaks,
  revealSeconds = null,
  lane = 'wave',
  within = null,
}) => {
  const { density, centre, length, window } = useTimeline();
  const shown =
    within === null
      ? null
      : { from: shareOf(within.start, length), to: shareOf(within.end, length) };
  const span = centre === null ? undefined : { from: window.start, to: window.end };
  const bars =
    centre === null
      ? waveformOf(segments, peaks, waveBarsOf(density))
      : stripWaveOf(segments, peaks, window, length, stripBarCountOf(centre.strip));
  const played =
    span === undefined ? null : (
      <TimelineCentrePlayed bars={bars} span={span} lane={lane} within={shown} />
    );

  return (
    <>
      <TimelineStrip>
        <KkTimeline.Wave
          bars={bars}
          revealSeconds={revealSeconds}
          span={span}
          lane={lane}
          within={shown}
        />
      </TimelineStrip>
      {played}
    </>
  );
};
