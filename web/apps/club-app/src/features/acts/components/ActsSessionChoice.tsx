import { KkChoiceChips } from '@furria/ui/KkChoiceChips';
import { KkNote } from '@furria/ui/KkNote';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { SESSIONS_LABEL } from '../acts-copy';
import type { ActsHub } from '../hooks/use-acts-hub';

interface ActsSessionChoiceProps {
  hub: ActsHub;
}

export const ActsSessionChoice: FC<ActsSessionChoiceProps> = ({ hub }) => {
  if (!hub.showsSessionChoice) {
    return null;
  }

  const note = hub.closedSessionNote === null ? null : <KkNote>{hub.closedSessionNote}</KkNote>;

  return (
    <Stack sx={{ gap: 1, minWidth: 0 }}>
      <KkChoiceChips
        label={SESSIONS_LABEL}
        choices={hub.sessionChoices}
        value={hub.sessionValue}
        onChange={hub.chooseSession}
      />
      {note}
    </Stack>
  );
};
