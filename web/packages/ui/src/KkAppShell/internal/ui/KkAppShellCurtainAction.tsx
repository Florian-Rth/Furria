import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { KkIconName } from '../../../KkIcon';
import { KkIcon } from '../../../KkIcon';
import { KkNote } from '../../../KkNote';

const DISABLED_OPACITY = 0.45;

interface KkAppShellCurtainActionProps {
  icon: KkIconName;
  label: string;
  disabled?: boolean;
}

export const KkAppShellCurtainAction: FC<KkAppShellCurtainActionProps> = ({
  icon,
  label,
  disabled = false,
}) => (
  <Stack
    direction="row"
    data-kk-app-shell-curtain-action
    sx={{
      flex: 1,
      alignItems: 'center',
      gap: 1.25,
      minWidth: 0,
      opacity: disabled ? DISABLED_OPACITY : 1,
    }}
  >
    <KkIcon name={icon} size="small" />
    <KkNote>{label}</KkNote>
  </Stack>
);
