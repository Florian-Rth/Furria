import type { KkTimelineRows } from '@furria/ui/KkTimeline';
import { KkTimeline } from '@furria/ui/KkTimeline';
import type { KkSx } from '@furria/ui/kk-sx';
import type { FC, ReactNode } from 'react';
import { TimelineRoot } from './internal/layout/TimelineRoot';
import { TimelineKeysRow } from './internal/ui/TimelineKeysRow';
import { TimelineParts } from './internal/ui/TimelineParts';
import { TimelineRuler } from './internal/ui/TimelineRuler';
import { TimelineSnap } from './internal/ui/TimelineSnap';
import { TimelineStepsRow } from './internal/ui/TimelineStepsRow';
import { TimelineVideosRow } from './internal/ui/TimelineVideosRow';
import { TimelineWaveRow } from './internal/ui/TimelineWaveRow';
import type {
  TimelineKeysLayer,
  TimelinePartsLayer,
  TimelineStepsLayer,
  TimelineVideosLayer,
  TimelineWaveLayer,
} from './studio-timeline-layers';
import { TIMELINE_LANE } from './studio-timeline-layers';
import { TIMELINE_ROW_LABELS } from './timeline-copy';
import type { TimelineDensity } from './timeline-geometry';
import { laneKeysShownOf } from './timeline-geometry';
import type { CentreScrub } from './use-centre-scrub';

interface StudioTimelineProps {
  label: string;
  density: TimelineDensity;
  length: number;
  centre: CentreScrub;
  wave: TimelineWaveLayer;
  ruler?: boolean;
  parts?: TimelinePartsLayer | null;
  steps?: TimelineStepsLayer | null;
  videos?: TimelineVideosLayer | null;
  keys?: TimelineKeysLayer | null;
  overlay?: ReactNode;
  sx?: KkSx;
}

export const StudioTimeline: FC<StudioTimelineProps> = ({
  label,
  density,
  length,
  centre,
  wave,
  ruler = false,
  parts = null,
  steps = null,
  videos = null,
  keys = null,
  overlay = null,
  sx,
}) => {
  const rows: KkTimelineRows = {
    ruler,
    parts: parts !== null,
    steps: steps !== null,
    videos: videos !== null,
    keys: keys !== null,
  };
  const partBands =
    parts === null ? null : (
      <TimelineParts
        parts={parts.parts}
        tone={parts.tone}
        lane={TIMELINE_LANE.parts}
        onSelect={parts.onSelect}
      />
    );
  const times = ruler ? <TimelineRuler /> : null;
  const stepRow = steps === null ? null : <TimelineStepsRow steps={steps} density={density} />;
  const videoRow = videos === null ? null : <TimelineVideosRow videos={videos} />;
  const keyRow = keys === null ? null : <TimelineKeysRow keys={keys} />;
  const laneKeys = laneKeysShownOf(density) ? (
    <KkTimeline.LaneKeys rows={rows} labels={TIMELINE_ROW_LABELS} />
  ) : null;

  return (
    <TimelineRoot
      label={label}
      density={density}
      rows={rows}
      length={length}
      centre={centre}
      overlay={overlay}
      keys={laneKeys}
      sx={sx}
    >
      {partBands}
      {times}
      <TimelineWaveRow wave={wave} />
      {stepRow}
      {videoRow}
      {keyRow}
      <TimelineSnap />
    </TimelineRoot>
  );
};
