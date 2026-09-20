import { KkButton, KkEmptyState, KkIcon, KkPanel } from '@furria/ui';
import type { FC } from 'react';
import { MANAGE_SESSIONS_CREATE_LABEL, MANAGE_SESSIONS_EMPTY } from '../manage-sessions-labels';
import type { SessionRecordSummary } from '../schemas';
import { SessionRecordRow } from './SessionRecordRow';

interface ManageSessionsListProps {
  records: readonly SessionRecordSummary[];
  today: Date;
  onCreate: () => void;
  onEdit: (record: SessionRecordSummary) => void;
  onDelete: (record: SessionRecordSummary) => void;
}

export const ManageSessionsList: FC<ManageSessionsListProps> = ({
  records,
  today,
  onCreate,
  onEdit,
  onDelete,
}) => {
  if (records.length === 0) {
    return (
      <KkPanel variant="block">
        <KkEmptyState
          title={MANAGE_SESSIONS_EMPTY.title}
          description={MANAGE_SESSIONS_EMPTY.description}
          action={
            <KkButton startIcon={<KkIcon name="add" size="small" />} onClick={onCreate}>
              {MANAGE_SESSIONS_CREATE_LABEL}
            </KkButton>
          }
        />
      </KkPanel>
    );
  }

  return (
    <KkPanel variant="list">
      {records.map((record) => (
        <SessionRecordRow
          key={record.sessionId}
          record={record}
          today={today}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </KkPanel>
  );
};
