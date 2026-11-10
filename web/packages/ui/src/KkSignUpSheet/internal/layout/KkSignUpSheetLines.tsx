import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';

interface KkSignUpSheetLinesProps extends PropsWithChildren {
  label: string;
  busy?: boolean;
  sx?: KkSx;
}

export const KkSignUpSheetLines: FC<KkSignUpSheetLinesProps> = ({
  label,
  busy = false,
  sx,
  children,
}) => (
  <Stack
    component="ol"
    aria-label={label}
    aria-busy={busy}
    data-kk-sign-up-sheet-lines
    sx={[
      { gap: 0.25, minWidth: 0, m: 0, p: 0, listStyle: 'none' },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Stack>
);
