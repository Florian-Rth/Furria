import { KkHealthStrip } from '@furria/ui';
import type { FC } from 'react';
import type { FilterView } from '../event-board-copy';
import type { BoardFilter } from '../schemas';

interface EventsFilterChipProps {
  view: FilterView;
  selected: boolean;
  quietNote: string;
  onChoose: (filter: BoardFilter) => void;
}

export const EventsFilterChip: FC<EventsFilterChipProps> = ({
  view,
  selected,
  quietNote,
  onChoose,
}) => {
  const choose = (): void => {
    onChoose(view.id);
  };

  return (
    <KkHealthStrip.Filter
      icon={view.icon}
      label={view.label}
      count={view.count}
      quietNote={quietNote}
      ariaLabel={view.ariaLabel}
      tone={view.tone}
      selected={selected}
      onSelect={choose}
    />
  );
};
