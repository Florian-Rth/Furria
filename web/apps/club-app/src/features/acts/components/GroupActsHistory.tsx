import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { HISTORY_LABEL } from '../acts-copy';
import type { GroupActHistory } from '../hooks/use-group-act-history';
import { GroupActsSession } from './GroupActsSession';

interface GroupActsHistoryProps {
  history: GroupActHistory;
}

export const GroupActsHistory: FC<GroupActsHistoryProps> = ({ history }) => {
  const groupId = history.groupId ?? 0;
  const sessions = history.sessions.map((session) => (
    <GroupActsSession key={session.sessionYear} groupId={groupId} session={session} />
  ));

  return (
    <Stack component="section" aria-label={HISTORY_LABEL} sx={{ minWidth: 0 }}>
      {sessions}
    </Stack>
  );
};
