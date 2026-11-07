import { KkTimeline } from '@furria/ui/KkTimeline';
import type { FC } from 'react';
import type { TimelineVideoSound } from '../../studio-timeline-layers';
import { shareOf } from '../../timeline-geometry';
import { TimelineStrip } from '../layout/TimelineStrip';
import { useTimeline } from '../logic/timeline-context';
import { TimelineWave } from './TimelineWave';

interface TimelineVideoSoundBandProps {
  sound: TimelineVideoSound;
}

export const TimelineVideoSoundBand: FC<TimelineVideoSoundBandProps> = ({ sound }) => {
  const { length, centre } = useTimeline();
  const { band } = sound;
  const active = centre?.activeKey === band.key;

  return (
    <>
      <TimelineWave
        segments={sound.segments}
        peaks={sound.peaks}
        lane="videos"
        within={band.range}
      />
      <TimelineStrip>
        <KkTimeline.SoundBand
          start={shareOf(band.range.start, length)}
          end={shareOf(band.range.end, length)}
          title={band.title}
          active={active}
        />
      </TimelineStrip>
    </>
  );
};
