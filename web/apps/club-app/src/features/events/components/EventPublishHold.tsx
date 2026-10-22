import { KkAlert } from '@furria/ui/KkAlert';
import { KkHoldButton } from '@furria/ui/KkHoldButton';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { EventPublishing } from '../hooks/use-event-publishing';

interface EventPublishHoldProps {
  publishing: EventPublishing;
}

export const EventPublishHold: FC<EventPublishHoldProps> = ({ publishing }) => {
  const primary = publishing.bar?.primary;
  const hold = primary?.hold;

  if (primary === undefined || hold === undefined) {
    return null;
  }

  const rejection =
    publishing.rejection === null ? null : <KkAlert>{publishing.rejection}</KkAlert>;

  return (
    <Stack sx={{ gap: 1.5 }}>
      {rejection}
      <KkHoldButton
        label={primary.label}
        hint={hold.hint}
        confirm={hold.confirm}
        disabled={primary.disabled}
        onCommit={primary.onSelect}
      />
    </Stack>
  );
};
