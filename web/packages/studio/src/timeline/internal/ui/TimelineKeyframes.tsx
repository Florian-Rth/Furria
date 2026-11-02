import { KkTimeline } from '@furria/ui/KkTimeline';
import type { FC } from 'react';
import type { SpotPath } from '../../../models/choreography-motion';
import { keyframeMarksOf } from '../../timeline-geometry';
import { useTimeline } from '../logic/timeline-context';

const NO_SPOTS: ReadonlySet<number> = new Set();

interface TimelineKeyframesProps {
  paths: readonly SpotPath[];
  selectedSpotIds?: ReadonlySet<number>;
}

export const TimelineKeyframes: FC<TimelineKeyframesProps> = ({
  paths,
  selectedSpotIds = NO_SPOTS,
}) => {
  const { length } = useTimeline();

  const marks = keyframeMarksOf(paths, selectedSpotIds, length);

  return <KkTimeline.Keyframes marks={marks} />;
};
