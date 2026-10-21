import type { KkStickyFootSurface } from '@furria/ui';
import { KkButton, KkIcon, KkStickyFoot } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { ARCHIVE_LABEL, RESTORE_LABEL, toPrimaryLabel } from '../board-hub-copy';
import type { OfficePaneControl } from '../hooks/use-office-pane';

interface OfficePaneFootProps {
  control: OfficePaneControl;
  surface: KkStickyFootSurface;
  onSeat: (sinceOn: string) => void;
}

export const OfficePaneFoot: FC<OfficePaneFootProps> = ({ control, surface, onSeat }) => {
  const { primary } = control;
  const seat = (): void => {
    if (primary !== null) {
      onSeat(primary.sinceOn);
    }
  };
  const primaryLabel = primary === null ? '' : toPrimaryLabel(primary);
  const primaryButton =
    primary === null || control.isArchived ? null : (
      <KkButton
        variant="contained"
        fullWidth
        startIcon={<KkIcon name="add" size="small" />}
        onClick={seat}
      >
        {primaryLabel}
      </KkButton>
    );
  const restore = control.isArchived ? (
    <KkButton size="small" variant="text" onClick={control.openRestore}>
      {RESTORE_LABEL}
    </KkButton>
  ) : null;
  const archive = control.canArchive ? (
    <KkButton size="small" variant="text" tone="danger" onClick={control.openArchive}>
      {ARCHIVE_LABEL}
    </KkButton>
  ) : null;

  if (primaryButton === null && restore === null && archive === null) {
    return null;
  }

  return (
    <KkStickyFoot surface={surface}>
      {primaryButton}
      <Stack direction="row" sx={{ justifyContent: 'center', gap: 2 }}>
        {restore}
        {archive}
      </Stack>
    </KkStickyFoot>
  );
};
