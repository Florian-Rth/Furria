import { KkButton } from '@furria/ui/KkButton';
import { KkHubRow } from '@furria/ui/KkHubRow';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { DANCE_HERE } from '../act-evenings-copy';
import type { ActEveningRowState } from '../hooks/use-act-evenings';

interface ActEveningRowProps {
  row: ActEveningRowState;
  busy: boolean;
  onJoin: (eventId: number) => void;
}

export const ActEveningRow: FC<ActEveningRowProps> = ({ row, busy, onJoin }) => {
  const join = (): void => {
    onJoin(row.eventId);
  };
  const action = row.canJoin ? (
    <KkButton size="small" variant="outlined" disabled={busy} onClick={join}>
      {DANCE_HERE}
    </KkButton>
  ) : undefined;

  return (
    <KkHubRow
      label={row.label}
      icon="calendar"
      meta={row.meta}
      hint={row.hint}
      hintTone="accent"
      component={Link}
      to={row.to}
      search={row.search}
      action={action}
    />
  );
};
