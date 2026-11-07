import { KkHubRow } from '@furria/ui/KkHubRow';
import { KkPillButton } from '@furria/ui/KkPillButton';
import type { FC } from 'react';
import type { EditorVersionRowView } from '../hooks/use-editor-versions';
import { VERSION_CURRENT } from '../undo-copy';

interface EditorVersionRowProps {
  row: EditorVersionRowView;
  busy: boolean;
}

export const EditorVersionRow: FC<EditorVersionRowProps> = ({ row, busy }) => {
  const action = row.current ? undefined : (
    <KkPillButton
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
