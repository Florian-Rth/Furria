import { ActStudioWaveReadout } from '@furria/studio/ActStudioWaveReadout';
import {
  STUDIO_FILM_LANES,
  STUDIO_FILM_MUSIC,
  STUDIO_FILM_NONE,
  STUDIO_FILM_PARTS,
  STUDIO_FILM_TIME,
  STUDIO_FILM_VIDEOS,
} from '@furria/studio/studio-copy';
import type { StudioScreen } from '@furria/studio/studio-screen';
import { Timeline } from '@furria/studio/Timeline';
import type { ActStudioTakes } from '@furria/studio/use-act-studio-takes';
import { useVideoLanes, VIDEO_LANE } from '@furria/studio/use-video-lanes';
import { KkTimeline } from '@furria/ui/KkTimeline';
import type { FC } from 'react';

interface ActStudioVideoLayerProps {
  screen: StudioScreen;
  takes: ActStudioTakes;
}

export const ActStudioVideoLayer: FC<ActStudioVideoLayerProps> = ({ screen, takes }) => {
  const lanes = useVideoLanes(screen, takes);
  const { playback } = screen;
  const readout = <ActStudioWaveReadout readout={lanes.readout} />;
  const none = <KkTimeline.LaneNote text={STUDIO_FILM_NONE} />;
  const partNote = lanes.parts.length === 0 ? none : null;
  const videoNote = lanes.videos.length === 0 ? none : null;

  return (
    <Timeline
      label={STUDIO_FILM_LANES}
      density="film"
      length={playback.length}
      centre={lanes.centre}
      overlay={readout}
    >
      <Timeline.Lane lane={VIDEO_LANE.ruler} label={STUDIO_FILM_TIME} size="ruler">
        <Timeline.Marks marks={lanes.ruler} edge="top" />
      </Timeline.Lane>
      <Timeline.Lane lane={VIDEO_LANE.parts} label={STUDIO_FILM_PARTS} size="thin">
        <Timeline.Blocks tone="part" blocks={lanes.parts} />
        {partNote}
      </Timeline.Lane>
      <Timeline.Lane lane={VIDEO_LANE.music} label={STUDIO_FILM_MUSIC} size="wave">
        <Timeline.Wave segments={playback.segments} peaks={playback.peaksByItem} />
      </Timeline.Lane>
      <Timeline.Lane lane={VIDEO_LANE.video} label={STUDIO_FILM_VIDEOS} size="lane">
        <Timeline.Blocks tone="video" blocks={lanes.videos} />
        {videoNote}
      </Timeline.Lane>
      <Timeline.Snap />
    </Timeline>
  );
};
