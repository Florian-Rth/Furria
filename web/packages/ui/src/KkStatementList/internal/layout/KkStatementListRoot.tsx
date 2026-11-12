import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';

interface KkStatementListRootProps extends PropsWithChildren {
  label: string;
  sx?: KkSx;
}

export const KkStatementListRoot: FC<KkStatementListRootProps> = ({ label, sx, children }) => (
  <Stack
    component="ul"
    role="list"
    aria-label={label}
    sx={[{ m: 0, p: 0, listStyle: 'none', minWidth: 0 }, ...(Array.isArray(sx) ? sx : [sx])]}
  >
    {children}
  </Stack>
);
