import { KkMeta } from '@furria/ui/KkMeta';
import { KkPanel } from '@furria/ui/KkPanel';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { toSessionLabel } from '@/features/acts/acts-copy';
import type { HubActSession } from '../hub-acts';
import { HubActRow } from './HubActRow';

interface HubActsSessionProps {
  groupId: number;
  session: HubActSession;
}

export const HubActsSession: FC<HubActsSessionProps> = ({ groupId, session }) => {
  const rows = session.acts.map((act) => <HubActRow key={act.actId} groupId={groupId} act={act} />);
  const label = toSessionLabel(session.sessionYear);

  return (
    <Stack sx={{ gap: 0.75, minWidth: 0 }}>
      <KkMeta>{label}</KkMeta>
      <KkPanel>{rows}</KkPanel>
    </Stack>
  );
};
