import { KkNote } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { MANAGE_SESSIONS_FOOTNOTE, partitionSessionRecords } from '../manage-sessions-labels';
import type { SessionRecordSummary } from '../schemas';
import { SessionsAheadSection } from './SessionsAheadSection';
import { SessionsPastSection } from './SessionsPastSection';

const VIEW_GAP = 3;

interface ManageSessionsViewProps {
  records: readonly SessionRecordSummary[];
  today: Date;
}

export const ManageSessionsView: FC<ManageSessionsViewProps> = ({ records, today }) => {
  const { ahead, past, vacantYear } = partitionSessionRecords(records, today);

  return (
    <Stack sx={{ gap: VIEW_GAP, minWidth: 0 }}>
      <SessionsAheadSection records={ahead} vacantYear={vacantYear} today={today} />
      <SessionsPastSection records={past} today={today} />
      <KkNote>{MANAGE_SESSIONS_FOOTNOTE}</KkNote>
    </Stack>
  );
};
