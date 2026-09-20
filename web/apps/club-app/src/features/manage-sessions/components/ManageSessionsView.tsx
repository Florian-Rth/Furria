import { KkNote } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { MANAGE_SESSIONS_FOOTNOTE } from '../manage-sessions-labels';
import type { SessionRecordSummary } from '../schemas';
import { ManageSessionsList } from './ManageSessionsList';

const VIEW_GAP = 3;

interface ManageSessionsViewProps {
  records: readonly SessionRecordSummary[];
  today: Date;
  onCreate: () => void;
  onEdit: (record: SessionRecordSummary) => void;
  onDelete: (record: SessionRecordSummary) => void;
}

export const ManageSessionsView: FC<ManageSessionsViewProps> = ({
  records,
  today,
  onCreate,
  onEdit,
  onDelete,
}) => (
  <Stack sx={{ gap: VIEW_GAP, minWidth: 0 }}>
    <ManageSessionsList
      records={records}
      today={today}
      onCreate={onCreate}
      onEdit={onEdit}
      onDelete={onDelete}
    />
    <KkNote>{MANAGE_SESSIONS_FOOTNOTE}</KkNote>
  </Stack>
);
