import { KkFactRow, KkNote, KkPanel } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import {
  formatInstantDay,
  HISTORY_TITLE,
  toAccountEventTitle,
  toActorMeta,
} from '../account-access-labels';
import type { AccountEvent } from '../schemas';

interface AccessHistoryProps {
  history: readonly AccountEvent[];
}

export const AccessHistory: FC<AccessHistoryProps> = ({ history }) => {
  if (history.length === 0) {
    return null;
  }

  const rows = history.map((event) => (
    <KkFactRow
      key={`${event.kind}-${event.at}`}
      title={toAccountEventTitle(event.kind)}
      span={formatInstantDay(event.at)}
      meta={toActorMeta(event.actor)}
    />
  ));

  return (
    <Stack sx={{ gap: 0.75, minWidth: 0 }}>
      <KkNote tone="muted">{HISTORY_TITLE}</KkNote>
      <KkPanel>{rows}</KkPanel>
    </Stack>
  );
};
