import { KkTimeline } from '@furria/ui/KkTimeline';
import type { FC } from 'react';
import type { TimelineKeysLayer } from '../../studio-timeline-layers';
import { TIMELINE_LANE } from '../../studio-timeline-layers';
import { TIMELINE_ROW_LABELS } from '../../timeline-copy';
import { TimelineDiamonds } from './TimelineDiamonds';

interface TimelineKeysRowProps {
  keys: TimelineKeysLayer;
}

export const TimelineKeysRow: FC<TimelineKeysRowProps> = ({ keys }) => (
  <KkTimeline.Row row="keys" lane={TIMELINE_LANE.keys} label={TIMELINE_ROW_LABELS.keys}>
    <TimelineDiamonds diamonds={keys.diamonds} />
    {keys.note}
  </KkTimeline.Row>
);
