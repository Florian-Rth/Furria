import { KkTimeline } from '@furria/ui/KkTimeline';
import type { FC } from 'react';
import type { TimelineWaveLayer } from '../../studio-timeline-layers';
import { TimelineCounts } from './TimelineCounts';
import { TimelineCuts } from './TimelineCuts';
import { TimelineHandles } from './TimelineHandles';
import { TimelineMarks } from './TimelineMarks';
import { TimelineRegions } from './TimelineRegions';
import { TimelineTrim } from './TimelineTrim';
import { TimelineWave } from './TimelineWave';

interface TimelineWaveRowProps {
  wave: TimelineWaveLayer;
}

export const TimelineWaveRow: FC<TimelineWaveRowProps> = ({ wave }) => {
  const { segments, peaks, revealSeconds = null, counts, beats, regions, trim, handles } = wave;
  const countLines = counts === undefined ? null : <TimelineCounts marks={counts} />;
  const cutLines = wave.cuts === true ? <TimelineCuts segments={segments} /> : null;
  const songs = regions === undefined ? null : <TimelineRegions regions={regions} />;
  const beatMarks = beats === undefined ? null : <TimelineMarks marks={beats} edge="bottom" />;
  const trimmed = trim === undefined ? null : <TimelineTrim range={trim} />;
  const grips = handles === undefined ? null : <TimelineHandles handles={handles} />;

  return (
    <>
      <KkTimeline.Row row="wave">{songs}</KkTimeline.Row>
      {countLines}
      <TimelineWave segments={segments} peaks={peaks} revealSeconds={revealSeconds} />
      {cutLines}
      <KkTimeline.Row row="wave">
        {beatMarks}
        {wave.note}
      </KkTimeline.Row>
      {trimmed}
      {grips}
    </>
  );
};
