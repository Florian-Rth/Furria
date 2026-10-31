import { toImageSource } from '@furria/ui/image-source';
import { KkIconButton } from '@furria/ui/KkIconButton';
import { KkPersonRow } from '@furria/ui/KkPersonRow';
import type { FC } from 'react';
import { toInitials } from '@/lib/initials';
import { toCoEditorRevokeLabel, toCoEditorSince } from '../act-page-copy';
import { toFullName } from '../acts-copy';
import type { CoEditor } from '../schemas';

interface ActCoEditorRowProps {
  coEditor: CoEditor;
  canRevoke: boolean;
  isBusy: boolean;
  onRevoke: (coEditor: CoEditor) => void;
}

export const ActCoEditorRow: FC<ActCoEditorRowProps> = ({
  coEditor,
  canRevoke,
  isBusy,
  onRevoke,
}) => {
  const initials = toInitials(coEditor.firstName, coEditor.lastName);
  const portrait = toImageSource(coEditor.portrait, 'portrait');
  const name = toFullName(coEditor.firstName, coEditor.lastName);
  const since = toCoEditorSince(coEditor.grantedAt);
  const revokeLabel = toCoEditorRevokeLabel(name);
  const revoke = (): void => {
    onRevoke(coEditor);
  };
  const trailing = canRevoke ? (
    <KkIconButton
      label={revokeLabel}
      icon="close"
      size="small"
      disabled={isBusy}
      onClick={revoke}
    />
  ) : undefined;

  return (
    <KkPersonRow
      initials={initials}
      portrait={portrait}
      name={name}
      meta={since}
      trailing={trailing}
    />
  );
};
