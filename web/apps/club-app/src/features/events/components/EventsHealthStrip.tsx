import { KkHealthStrip } from '@furria/ui';
import type { FC } from 'react';
import type { FilterView, TallyView } from '../event-board-copy';
import { FILTER_LABEL, HEALTH_LABEL, QUIET_NOTE, SUMMARY_TITLE } from '../event-board-copy';
import type { BoardFilter } from '../schemas';
import { EventsFilterChip } from './EventsFilterChip';

interface EventsHealthStripProps {
  tally: TallyView;
  filters: readonly FilterView[];
  filter: BoardFilter;
  onChoose: (filter: BoardFilter) => void;
}

export const EventsHealthStrip: FC<EventsHealthStripProps> = ({
  tally,
  filters,
  filter,
  onChoose,
}) => {
  const chips = filters.map((view) => (
    <EventsFilterChip
      key={view.id}
      view={view}
      selected={view.id === filter}
      quietNote={QUIET_NOTE}
      onChoose={onChoose}
    />
  ));

  return (
    <KkHealthStrip label={HEALTH_LABEL}>
      <KkHealthStrip.Summary
        title={SUMMARY_TITLE}
        ringLabel={tally.label}
        value={tally.value}
        total={tally.total}
        parts={tally.parts}
        legend={tally.legend}
      />
      <KkHealthStrip.Filters label={FILTER_LABEL}>{chips}</KkHealthStrip.Filters>
    </KkHealthStrip>
  );
};
