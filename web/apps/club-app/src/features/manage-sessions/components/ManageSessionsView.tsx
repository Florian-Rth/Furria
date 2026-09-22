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
}

export const ManageSessionsView: FC<ManageSessionsViewProps> = ({ records, today }) => (
  <Stack sx={{ gap: VIEW_GAP, minWidth: 0 }}>
    <ManageSessionsList records={records} today={today} />
    <KkNote>{MANAGE_SESSIONS_FOOTNOTE}</KkNote>
  </Stack>
);
