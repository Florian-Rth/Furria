import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';

interface KkSignUpSheetRootProps extends PropsWithChildren {
  label: string;
  sx?: KkSx;
}

export const KkSignUpSheetRoot: FC<KkSignUpSheetRootProps> = ({ label, sx, children }) => (
  <Stack
    component="section"
    aria-label={label}
    data-kk-sign-up-sheet
    sx={[{ gap: 1.5, minWidth: 0 }, ...(Array.isArray(sx) ? sx : [sx])]}
  >
    {children}
  </Stack>
);
