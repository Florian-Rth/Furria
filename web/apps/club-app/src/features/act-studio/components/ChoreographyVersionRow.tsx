import { KkButton } from '@furria/ui/KkButton';
import { KkHubRow } from '@furria/ui/KkHubRow';
import type { FC } from 'react';
import type { VersionRowView } from '../hooks/use-choreography-versions';
import { VERSION_CURRENT, VERSION_RESTORE } from '../undo-copy';

interface ChoreographyVersionRowProps {
  row: VersionRowView;
  busy: boolean;
}

export const ChoreographyVersionRow: FC<ChoreographyVersionRowProps> = ({ row, busy }) => {
  const action = row.current ? undefined : (
    <KkButton
      size="small"
      variant="outlined"
      disabled={busy}
      ariaLabel={row.restoreLabel}
      onClick={row.restore}
    >
      {VERSION_RESTORE}
    </KkButton>
  );
  const hint = row.current ? VERSION_CURRENT : undefined;

  return (
    <KkHubRow
      label={row.label}
      icon="timeline"
      meta={row.meta}
      hint={hint}
      hintTone="green"
      dimWhenInert={false}
      action={action}
    />
  );
};
