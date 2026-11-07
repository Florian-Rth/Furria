import { KkTimeline } from '@furria/ui/KkTimeline';
import type { FC } from 'react';
import type { TimelineStepsLayer } from '../../studio-timeline-layers';
import { TIMELINE_LANE } from '../../studio-timeline-layers';
import { TIMELINE_ROW_LABELS } from '../../timeline-copy';
import type { TimelineDensity } from '../../timeline-geometry';
import { TimelineHandles } from './TimelineHandles';
import { TimelineSteps } from './TimelineSteps';
import { TimelineTicks } from './TimelineTicks';

const TICKED: ReadonlySet<TimelineDensity> = new Set<TimelineDensity>(['strip', 'overview']);

interface TimelineStepsRowProps {
  steps: TimelineStepsLayer;
  density: TimelineDensity;
}

export const TimelineStepsRow: FC<TimelineStepsRowProps> = ({ steps, density }) => {
  const { activeKey, selectedKey = null, revealSeconds = null, borders, note, onSelect } = steps;

  if (TICKED.has(density)) {
    return (
      <TimelineTicks steps={steps.steps} activeKey={activeKey} revealSeconds={revealSeconds} />
    );
  }

  const grips = borders === undefined ? null : <TimelineHandles handles={borders} tone="border" />;

  return (
    <>
      <TimelineSteps
        label={TIMELINE_ROW_LABELS.steps}
        steps={steps.steps}
        activeKey={activeKey}
        selectedKey={selectedKey}
        revealSeconds={revealSeconds}
        lane={TIMELINE_LANE.steps}
        onSelect={onSelect}
      />
      <KkTimeline.Row row="steps" lane={TIMELINE_LANE.steps}>
        {grips}
        {note}
      </KkTimeline.Row>
    </>
  );
};
