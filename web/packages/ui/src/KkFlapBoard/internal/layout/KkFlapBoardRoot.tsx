import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';
import { boardFrame } from '../board-paint';

interface KkFlapBoardRootProps extends PropsWithChildren {
  label: string;
  sx?: KkSx;
}

export const KkFlapBoardRoot: FC<KkFlapBoardRootProps> = ({ label, sx, children }) => (
  <Stack
    component="section"
    aria-label={label}
    data-kk-flap-board
    sx={[boardFrame, ...(Array.isArray(sx) ? sx : [sx])]}
  >
    {children}
  </Stack>
);
