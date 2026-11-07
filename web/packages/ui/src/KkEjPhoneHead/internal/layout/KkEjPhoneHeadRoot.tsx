import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import { FOLDED_BAR_HEIGHT, foldedBarRoomOf } from '../../../KkShell/internal/folded-bar';
import { useKkBarFold } from '../../../KkShell/use-bar-fold';

interface KkEjPhoneHeadRootProps extends PropsWithChildren {
  label: string;
}

export const KkEjPhoneHeadRoot: FC<KkEjPhoneHeadRootProps> = ({ label, children }) => {
  useKkBarFold();

  return (
    <Stack
      direction="row"
      role="toolbar"
      aria-label={label}
      data-kk-ej-phone-head
      sx={(theme) => ({
        alignItems: 'center',
        gap: 0.25,
        minWidth: 0,
        height: FOLDED_BAR_HEIGHT,
        paddingInlineStart: foldedBarRoomOf(theme),
      })}
    >
      {children}
    </Stack>
  );
};
