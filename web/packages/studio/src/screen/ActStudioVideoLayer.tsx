import { ActStudioWaveReadout } from '@furria/studio/ActStudioWaveReadout';
import { StudioTimeline } from '@furria/studio/StudioTimeline';
import { STUDIO_FILM_LANES, STUDIO_FILM_NONE } from '@furria/studio/studio-copy';
import type { StudioScreen } from '@furria/studio/studio-screen';
import type { ActStudioTakes } from '@furria/studio/use-act-studio-takes';
import { useVideoLanes } from '@furria/studio/use-video-lanes';
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
  const parts = { parts: lanes.parts, tone: screen.tone };
  const wave = { segments: playback.segments, peaks: playback.peaksByItem, cuts: true };
  const videos = { blocks: lanes.videos, note: lanes.videos.length === 0 ? none : null };

  return (
    <StudioTimeline
      label={STUDIO_FILM_LANES}
      density="film"
      length={playback.length}
      centre={lanes.centre}
      ruler
      parts={parts}
      wave={wave}
      videos={videos}
      overlay={readout}
    />
  );
};
