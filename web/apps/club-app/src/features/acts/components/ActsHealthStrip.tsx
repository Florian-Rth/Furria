import { KkHealthStrip } from '@furria/ui/KkHealthStrip';
import type { FC } from 'react';
import {
  FILTER_LABEL,
  HEALTH_LABEL,
  NONE,
  SHARED_TITLE,
  toCarriersLegend,
  toCarriersRingLabel,
  toSinglesLegend,
} from '../acts-copy';
import type { ActsHub } from '../hooks/use-acts-hub';
import { ACTS_FILTERS } from '../schemas';
import { ActsFilterChip } from './ActsFilterChip';

interface ActsHealthStripProps {
  hub: ActsHub;
}

export const ActsHealthStrip: FC<ActsHealthStripProps> = ({ hub }) => {
  const carriers = hub.carriers.length;
  const singles = Math.max(hub.people - carriers, 0);
  const parts = [
    { state: 'current', count: carriers },
    { state: 'open', count: singles },
  ] as const;
  const legend = [
    { state: 'current', text: toCarriersLegend(carriers) },
    { state: 'open', text: toSinglesLegend(singles) },
  ] as const;
  const filters = ACTS_FILTERS.map((filter) => (
    <ActsFilterChip
      key={filter}
      filter={filter}
      count={hub.counts[filter]}
      selected={filter === hub.filter}
      quietNote={NONE}
      onChoose={hub.chooseFilter}
    />
  ));

  return (
    <KkHealthStrip label={HEALTH_LABEL}>
      <KkHealthStrip.Summary
        title={SHARED_TITLE}
        ringLabel={toCarriersRingLabel(carriers, hub.people)}
        value={String(carriers)}
        parts={parts}
        legend={legend}
      />
      <KkHealthStrip.Filters label={FILTER_LABEL}>{filters}</KkHealthStrip.Filters>
    </KkHealthStrip>
  );
};
