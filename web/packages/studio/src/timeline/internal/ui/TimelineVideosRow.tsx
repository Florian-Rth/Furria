import { KkTimeline } from '@furria/ui/KkTimeline';
import type { FC } from 'react';
import type { TimelineVideosLayer } from '../../studio-timeline-layers';
import { TIMELINE_LANE } from '../../studio-timeline-layers';
import { TIMELINE_ROW_LABELS } from '../../timeline-copy';
import { TimelineBlocks } from './TimelineBlocks';

interface TimelineVideosRowProps {
  videos: TimelineVideosLayer;
}

export const TimelineVideosRow: FC<TimelineVideosRowProps> = ({ videos }) => (
  <KkTimeline.Row row="videos" lane={TIMELINE_LANE.videos} label={TIMELINE_ROW_LABELS.videos}>
    <TimelineBlocks tone="video" blocks={videos.blocks} />
    {videos.note}
  </KkTimeline.Row>
);
