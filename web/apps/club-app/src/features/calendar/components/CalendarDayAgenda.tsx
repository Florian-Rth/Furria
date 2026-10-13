import type { KkPanelAction } from '@furria/ui';
import { KkPanel, KkPanelSection } from '@furria/ui';
import type { FC } from 'react';
import { toIsoDayLabel } from '@/lib/calendar-days';
import { ADD_ENTRY_PILL_LABEL, ADD_ON_DAY_LABEL } from '../calendar-labels';
import type { CalendarAuthoring } from '../hooks/use-calendar-authoring';
import type { CalendarEntry } from '../schemas';
import { CalendarEmpty } from './CalendarEmpty';
import { CalendarEntryRow } from './CalendarEntryRow';

interface CalendarDayAgendaProps {
  isoDay: string;
  entries: readonly CalendarEntry[];
  authoring: CalendarAuthoring;
  highlightedKey: string | null;
  onAdd?: () => void;
}

export const CalendarDayAgenda: FC<CalendarDayAgendaProps> = ({
  isoDay,
  entries,
  authoring,
  highlightedKey,
  onAdd,
}) => {
  const action: KkPanelAction | undefined =
    onAdd === undefined
      ? undefined
      : { label: ADD_ENTRY_PILL_LABEL, icon: 'add', ariaLabel: ADD_ON_DAY_LABEL, onClick: onAdd };
  const rows = entries.map((entry) => (
    <CalendarEntryRow
      key={entry.calendarEntryId}
      entry={entry}
      owned={authoring.mayOwn(entry)}
      link={authoring.linkOf(entry)}
      highlightedKey={highlightedKey}
    />
  ));
  const title = toIsoDayLabel(isoDay);
  const body =
    entries.length === 0 ? <CalendarEmpty dayFiltered /> : <KkPanel variant="list">{rows}</KkPanel>;

  return (
    <KkPanelSection title={title} action={action}>
      {body}
    </KkPanelSection>
  );
};
