import { KkTimeline } from '@furria/ui/KkTimeline';
import type { FC } from 'react';
import { rulerTicksOf } from '../../timeline-geometry';
import { useTimeline } from '../logic/timeline-context';

export const TimelineRuler: FC = () => {
  const { length, density, window } = useTimeline();

  if (density !== 'full') {
    return null;
  }

  const ticks = rulerTicksOf(length, window);

  return <KkTimeline.Ruler ticks={ticks} />;
};
