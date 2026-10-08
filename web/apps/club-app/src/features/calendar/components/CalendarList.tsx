import type { KkPanelAction } from '@furria/ui';
import { KkPanel, KkPanelSection } from '@furria/ui';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import type { CalendarEntryLink } from '../calendar-authoring';
import {
  ADD_ENTRY_ACTION_LABEL,
  ADD_ENTRY_PILL_LABEL,
  CALENDAR_LIST_SECTION_TITLE,
} from '../calendar-labels';
import type { CalendarEntry } from '../schemas';
import { CalendarEmpty } from './CalendarEmpty';
import { CalendarEntryRow } from './CalendarEntryRow';

interface CalendarListProps {
  entries: readonly CalendarEntry[];
  dayFiltered: boolean;
  isOwned: (entry: CalendarEntry) => boolean;
  linkOf: (entry: CalendarEntry) => CalendarEntryLink | null;
  mayAuthor: boolean;
  highlightedKey: string | null;
}

export const CalendarList: FC<CalendarListProps> = ({
  entries,
  dayFiltered,
  isOwned,
  linkOf,
  mayAuthor,
  highlightedKey,
}) => {
  const action: KkPanelAction | undefined = mayAuthor
    ? {
        label: ADD_ENTRY_PILL_LABEL,
        icon: 'add',
        ariaLabel: ADD_ENTRY_ACTION_LABEL,
        component: Link,
        to: '/calendar/new',
      }
    : undefined;

  const body =
    entries.length === 0 ? (
      <CalendarEmpty dayFiltered={dayFiltered} />
    ) : (
      <KkPanel variant="list">
        {entries.map((entry) => (
          <CalendarEntryRow
            key={entry.calendarEntryId}
            entry={entry}
            owned={isOwned(entry)}
            link={linkOf(entry)}
            highlightedKey={highlightedKey}
          />
        ))}
      </KkPanel>
    );

  return (
    <KkPanelSection title={CALENDAR_LIST_SECTION_TITLE} action={action}>
      {body}
    </KkPanelSection>
  );
};
