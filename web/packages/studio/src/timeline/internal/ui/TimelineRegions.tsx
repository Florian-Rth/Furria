import { KkTimeline } from '@furria/ui/KkTimeline';
import type { FC } from 'react';
import type { TimelineRange } from '../../../models/music-timeline';
import { shareOf } from '../../timeline-geometry';
import { TimelineStrip } from '../layout/TimelineStrip';
import { useTimeline } from '../logic/timeline-context';

export interface TimelineRegion {
  key: string;
  range: TimelineRange;
  number: number;
  name: string;
  meta: string;
  selected: boolean;
}

interface TimelineRegionsProps {
  regions: readonly TimelineRegion[];
}

export const TimelineRegions: FC<TimelineRegionsProps> = ({ regions }) => {
  const { length } = useTimeline();
  const bands = regions.map((region) => (
    <KkTimeline.Region
      key={region.key}
      from={shareOf(region.range.start, length)}
      to={shareOf(region.range.end, length)}
      number={region.number}
      name={region.name}
      meta={region.meta}
      selected={region.selected}
    />
  ));

  return <TimelineStrip>{bands}</TimelineStrip>;
};
