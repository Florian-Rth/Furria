import { KkFactRow } from '@furria/ui/KkFactRow';
import { KkNote } from '@furria/ui/KkNote';
import { KkPanel } from '@furria/ui/KkPanel';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { ActStudioResponse } from '@/features/acts/schemas';
import { STUDIO_A_NO_ACCESS } from '../studio-a-copy';

interface StudioAClosedProps {
  response: ActStudioResponse;
}

export const StudioAClosed: FC<StudioAClosedProps> = ({ response }) => {
  const { act } = response;
  const group = act.group === null ? null : <KkFactRow title="Gruppe" span={act.group.name} />;
  const sessionYear = act.sessionYear === null ? null : String(act.sessionYear);
  const session = sessionYear === null ? null : <KkFactRow title="Session" span={sessionYear} />;

  return (
    <Stack sx={{ gap: 1.5 }}>
      <KkPanel>
        {group}
        {session}
      </KkPanel>
      <KkNote>{STUDIO_A_NO_ACCESS}</KkNote>
    </Stack>
  );
};
