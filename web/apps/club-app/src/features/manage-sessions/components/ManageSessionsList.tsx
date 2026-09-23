import type { KkPanelAction } from '@furria/ui';
import { KkEmptyState, KkPanel, KkPanelSection } from '@furria/ui';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { MANAGE_SESSIONS_CREATE_LABEL, MANAGE_SESSIONS_EMPTY } from '../manage-sessions-labels';
import type { SessionRecordSummary } from '../schemas';
import { SessionRecordRow } from './SessionRecordRow';

const CREATE_ROUTE = '/manage/sessions/new';
const CREATE_PILL_LABEL = 'Session';
const SECTION_TITLE = 'Sessionseinträge';

interface ManageSessionsListProps {
  records: readonly SessionRecordSummary[];
  today: Date;
}

export const ManageSessionsList: FC<ManageSessionsListProps> = ({ records, today }) => {
  const action: KkPanelAction = {
    label: CREATE_PILL_LABEL,
    icon: 'add',
    ariaLabel: MANAGE_SESSIONS_CREATE_LABEL,
    component: Link,
    to: CREATE_ROUTE,
  };

  if (records.length === 0) {
    return (
      <KkPanelSection title={SECTION_TITLE} action={action}>
        <KkPanel variant="block">
          <KkEmptyState
            title={MANAGE_SESSIONS_EMPTY.title}
            description={MANAGE_SESSIONS_EMPTY.description}
          />
        </KkPanel>
      </KkPanelSection>
    );
  }

  return (
    <KkPanelSection title={SECTION_TITLE} action={action}>
      <KkPanel variant="list">
        {records.map((record) => (
          <SessionRecordRow key={record.sessionId} record={record} today={today} />
        ))}
      </KkPanel>
    </KkPanelSection>
  );
};
