import { KkButton } from '@furria/ui/KkButton';
import { KkNote } from '@furria/ui/KkNote';
import { KkTextArea } from '@furria/ui/KkTextArea';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { useAltDraft } from '../hooks/use-alt-draft';
import type { BoardPosition } from '../website-board';
import {
  ALT_COPIED,
  ALT_HINT,
  ALT_MAX,
  ALT_REQUIRED_LABEL,
  ALT_SAVE,
  ALT_SHARE_HINT,
  altCountOf,
} from '../website-copy';

const SHARE_IMAGE_SLOT = 'site.shareImage';

interface WebsiteAltFieldProps {
  position: BoardPosition;
  copied: boolean;
}

export const WebsiteAltField: FC<WebsiteAltFieldProps> = ({ position, copied }) => {
  const draft = useAltDraft(position);
  const hint = position.slot === SHARE_IMAGE_SLOT ? `${ALT_HINT} ${ALT_SHARE_HINT}` : ALT_HINT;
  const save = draft.isChanged ? (
    <KkButton
      variant="contained"
      size="small"
      loading={draft.isSaving}
      onClick={draft.save}
      sx={{ alignSelf: 'flex-end' }}
    >
      {ALT_SAVE}
    </KkButton>
  ) : null;
  const copiedNote = copied && !draft.isChanged ? <KkNote tone="hint">{ALT_COPIED}</KkNote> : null;
  const hasError = draft.rejection !== null || draft.isMissing;

  return (
    <Stack sx={{ gap: 1, minWidth: 0 }}>
      <KkTextArea
        name={`alt-${position.slot}-${position.position}`}
        label={ALT_REQUIRED_LABEL}
        value={draft.value}
        onChange={draft.change}
        rows={2}
        maxLength={ALT_MAX}
        showCount
        countLabel={altCountOf}
        hint={hint}
        required
        error={hasError}
        helperText={draft.rejection ?? undefined}
      />
      {copiedNote}
      {save}
    </Stack>
  );
};
