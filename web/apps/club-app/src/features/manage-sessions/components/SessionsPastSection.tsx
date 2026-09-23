import { KkPanel, KkPanelSection } from '@furria/ui';
import type { FC } from 'react';
import { SESSION_SECTION_TITLES } from '../manage-sessions-labels';
import type { SessionRecordSummary } from '../schemas';
import { SessionRecordRow } from './SessionRecordRow';

interface SessionsPastSectionProps {
  records: readonly SessionRecordSummary[];
  today: Date;
}

export const SessionsPastSection: FC<SessionsPastSectionProps> = ({ records, today }) => {
  if (records.length === 0) {
    return null;
  }

  return (
    <KkPanelSection title={SESSION_SECTION_TITLES.past}>
      <KkPanel variant="list">
        {records.map((record) => (
          <SessionRecordRow key={record.sessionId} record={record} today={today} />
        ))}
      </KkPanel>
    </KkPanelSection>
  );
};
