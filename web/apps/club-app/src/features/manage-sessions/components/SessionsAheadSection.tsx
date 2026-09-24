import type { KkPanelAction } from '@furria/ui';
import { KkPanel, KkPanelSection } from '@furria/ui';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { MANAGE_SESSIONS_CREATE_LABEL, SESSION_SECTION_TITLES } from '../manage-sessions-labels';
import type { SessionRecordSummary } from '../schemas';
import { SessionRecordRow } from './SessionRecordRow';
import { VacantSessionRow } from './VacantSessionRow';

const CREATE_ROUTE = '/manage/sessions/new';
const CREATE_PILL_LABEL = 'Session';

interface SessionsAheadSectionProps {
  records: readonly SessionRecordSummary[];
  vacantYear: number | null;
  today: Date;
}

export const SessionsAheadSection: FC<SessionsAheadSectionProps> = ({
  records,
  vacantYear,
  today,
}) => {
  const action: KkPanelAction = {
    label: CREATE_PILL_LABEL,
    icon: 'add',
    ariaLabel: MANAGE_SESSIONS_CREATE_LABEL,
    component: Link,
    to: CREATE_ROUTE,
  };

  const vacantRow = vacantYear === null ? null : <VacantSessionRow startYear={vacantYear} />;

  return (
    <KkPanelSection title={SESSION_SECTION_TITLES.ahead} action={action}>
      <KkPanel variant="list">
        {records.map((record) => (
          <SessionRecordRow key={record.sessionId} record={record} today={today} />
        ))}
        {vacantRow}
      </KkPanel>
    </KkPanelSection>
  );
};
