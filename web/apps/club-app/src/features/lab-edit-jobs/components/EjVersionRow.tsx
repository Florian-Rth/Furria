import { KkEjButton } from '@furria/ui/KkEjButton';
import { KkHubRow } from '@furria/ui/KkHubRow';
import type { FC } from 'react';
import { VERSION_CURRENT } from '@/features/act-studio/undo-copy';
import type { EjVersionRow as EjVersionRowView } from '../hooks/use-ej-versions';

interface EjVersionRowProps {
  row: EjVersionRowView;
  busy: boolean;
}

export const EjVersionRow: FC<EjVersionRowProps> = ({ row, busy }) => {
  const action = row.current ? undefined : (
    <KkEjButton
      text={row.restoreText}
      glyph="history"
      label={row.restoreLabel}
      tone={row.armed ? 'accent' : 'quiet'}
      disabled={busy}
      onPress={row.restore}
    />
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
