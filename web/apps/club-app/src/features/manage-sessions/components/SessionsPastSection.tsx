import { KkPanel } from '@furria/ui/KkPanel';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import type { FC } from 'react';
import { SESSION_SECTION_TITLES } from '../manage-sessions-labels';
import type { SessionRecordSummary } from '../schemas';
import { SESSIONS_HELP_SPOTS } from '../sessions-help-copy';
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
    <KkPanelSection title={SESSION_SECTION_TITLES.past} landing={SESSIONS_HELP_SPOTS.past}>
      <KkPanel variant="list">
        {records.map((record) => (
          <SessionRecordRow key={record.sessionId} record={record} today={today} />
        ))}
      </KkPanel>
    </KkPanelSection>
  );
};
