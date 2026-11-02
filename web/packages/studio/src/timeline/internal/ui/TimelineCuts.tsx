import { KkTimeline } from '@furria/ui/KkTimeline';
import type { FC } from 'react';
import type { MusicSegment } from '../../../models/music-timeline';
import { cutSharesOf } from '../../timeline-geometry';
import { useTimeline } from '../logic/timeline-context';

interface TimelineCutsProps {
  segments: readonly MusicSegment[];
}

export const TimelineCuts: FC<TimelineCutsProps> = ({ segments }) => {
  const { length } = useTimeline();

  const shares = cutSharesOf(segments, length);

  return <KkTimeline.Cuts shares={shares} />;
};
