import type { KkGapTimelineItem } from '@furria/ui/KkGapTimeline';
import { KkGapTimeline } from '@furria/ui/KkGapTimeline';
import { KkText } from '@furria/ui/KkText';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { LineKey } from '@/features/running-order/schemas';
import { usePlanner } from '../planner-context';
import {
  FACT_SEPARATOR,
  PERSON_ABSENT_NOTE,
  PERSON_NOT_PLACED,
  PERSON_WAITING_TITLE,
  STOP_OPEN_LABEL,
  toGapText,
  toPersonTimelineLabel,
} from '../planner-copy';
import type { PersonTimeline } from '../planner-person';
import { PlannerDetailSection } from './PlannerDetailSection';

interface PlannerPersonTimelineProps {
  timeline: PersonTimeline;
}

export const PlannerPersonTimeline: FC<PlannerPersonTimelineProps> = ({ timeline }) => {
  const planner = usePlanner();
  const items: KkGapTimelineItem[] = timeline.stops.flatMap((stop, at) => {
    const gap = timeline.gaps[at - 1];
    const stopItem: KkGapTimelineItem = {
      type: 'stop',
      id: stop.key,
      number: String(stop.index + 1),
      title: planner.lineNameOf(stop.key),
      selected: planner.isWide && planner.selectedKey === stop.key,
    };

    return gap === undefined
      ? [stopItem]
      : [{ type: 'gap', id: `gap:${stop.key}`, state: gap.state, text: toGapText(gap) }, stopItem];
  });
  const open = (id: string): void => {
    const stop = timeline.stops.find((candidate) => candidate.key === id);

    if (stop !== undefined) {
      planner.openStop(stop.key);
    }
  };
  const absentNote = timeline.absent ? (
    <KkText variant="body2" tone="secondary">
      {PERSON_ABSENT_NOTE}
    </KkText>
  ) : null;
  const list =
    items.length === 0 ? (
      <KkText variant="body2" tone="secondary">
        {PERSON_NOT_PLACED}
      </KkText>
    ) : (
      <KkGapTimeline
        label={toPersonTimelineLabel(timeline.person.firstName)}
        items={items}
        openLabel={STOP_OPEN_LABEL}
        onOpen={open}
      />
    );
  const waitingNames = timeline.waiting.map((key: LineKey) => planner.lineNameOf(key));
  const waiting =
    waitingNames.length === 0 ? null : (
      <PlannerDetailSection title={PERSON_WAITING_TITLE}>
        <KkText variant="body2">{waitingNames.join(FACT_SEPARATOR)}</KkText>
      </PlannerDetailSection>
    );

  return (
    <Stack sx={{ gap: 2, minWidth: 0 }}>
      {absentNote}
      {list}
      {waiting}
    </Stack>
  );
};
