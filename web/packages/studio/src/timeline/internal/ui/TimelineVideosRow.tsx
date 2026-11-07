import { KkTimeline } from '@furria/ui/KkTimeline';
import type { FC } from 'react';
import type { TimelineVideosLayer } from '../../studio-timeline-layers';
import { TIMELINE_LANE } from '../../studio-timeline-layers';
import { TIMELINE_ROW_LABELS } from '../../timeline-copy';
import { TimelineBlocks } from './TimelineBlocks';
import { TimelineVideoSoundBand } from './TimelineVideoSoundBand';

interface TimelineVideosRowProps {
  videos: TimelineVideosLayer;
}

export const TimelineVideosRow: FC<TimelineVideosRowProps> = ({ videos }) => {
  const sound = videos.sound ?? null;
  const blocks =
    sound === null ? videos.blocks : videos.blocks.filter((block) => block.key !== sound.band.key);
  const band = sound === null ? null : <TimelineVideoSoundBand sound={sound} />;

  return (
    <>
      <KkTimeline.Row row="videos" lane={TIMELINE_LANE.videos} label={TIMELINE_ROW_LABELS.videos}>
        <TimelineBlocks tone="video" blocks={blocks} />
        {videos.note}
      </KkTimeline.Row>
      {band}
    </>
  );
};
