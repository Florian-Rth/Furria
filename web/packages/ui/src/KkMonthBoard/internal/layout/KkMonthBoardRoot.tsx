import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';

interface KkMonthBoardRootProps extends PropsWithChildren {
  label: string;
  sx?: KkSx;
}

export const KkMonthBoardRoot: FC<KkMonthBoardRootProps> = ({ label, sx, children }) => (
  <Stack
    component="section"
    aria-label={label}
    data-kk-month-board
    sx={[{ minWidth: 0, gap: 1 }, ...(Array.isArray(sx) ? sx : [sx])]}
  >
    {children}
  </Stack>
);
