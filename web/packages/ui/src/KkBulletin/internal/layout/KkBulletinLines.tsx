import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import { rowDividerTop } from '../../../internal/row-divider';
import type { KkSx } from '../../../kk-sx';

interface KkBulletinLinesProps extends PropsWithChildren {
  label: string;
  sx?: KkSx;
}

export const KkBulletinLines: FC<KkBulletinLinesProps> = ({ label, sx, children }) => (
  <Stack
    component="ul"
    aria-label={label}
    sx={[
      { m: 0, p: 0, listStyle: 'none', minWidth: 0, '& > li': rowDividerTop },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Stack>
);
