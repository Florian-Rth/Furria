import { KkHealthStrip } from '@furria/ui/KkHealthStrip';
import type { FC } from 'react';
import { FILTER_ICONS, toFilterAriaLabel, toFilterLabel } from '../acts-copy';
import type { ActsFilter } from '../schemas';

interface ActsFilterChipProps {
  filter: ActsFilter;
  count: number;
  selected: boolean;
  quietNote: string;
  onChoose: (filter: ActsFilter) => void;
}

export const ActsFilterChip: FC<ActsFilterChipProps> = ({
  filter,
  count,
  selected,
  quietNote,
  onChoose,
}) => {
  const choose = (): void => {
    onChoose(filter);
  };
  const shown = count === 0 ? null : String(count);

  return (
    <KkHealthStrip.Filter
      icon={FILTER_ICONS[filter]}
      label={toFilterLabel(filter)}
      count={shown}
      quietNote={quietNote}
      ariaLabel={toFilterAriaLabel(filter, count)}
      selected={selected}
      onSelect={choose}
    />
  );
};
