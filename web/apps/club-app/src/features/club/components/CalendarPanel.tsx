import { KkButton, KkPanel, KkPanelSection } from '@furria/ui';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { CALENDAR_PATH } from '@/features/session';
import { useClubHubQuery } from '../api';
import { CalendarRow } from './CalendarRow';

const PANEL_TITLE = 'Kalender';
const ALL_ENTRIES_LABEL = 'Zum Kalender';

export const CalendarPanel: FC = () => {
  const clubHub = useClubHubQuery();
  const entries = clubHub.data?.calendar;

  if (entries === undefined || entries.length === 0) {
    return null;
  }

  const rows = entries.map((entry) => <CalendarRow key={entry.calendarEntryId} entry={entry} />);

  const action = (
    <KkButton variant="text" size="small" component={Link} to={CALENDAR_PATH}>
      {ALL_ENTRIES_LABEL}
    </KkButton>
  );

  return (
    <KkPanelSection title={PANEL_TITLE} action={action}>
      <KkPanel variant="list">{rows}</KkPanel>
    </KkPanelSection>
  );
};
