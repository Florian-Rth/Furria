import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';
import { kkTokens } from '../../../tokens';

interface KkStatRowRootProps extends PropsWithChildren {
  sx?: KkSx;
}

export const KkStatRowRoot: FC<KkStatRowRootProps> = ({ sx, children }) => (
  <Stack
    direction="row"
    data-kk-stat-row
    sx={[
      {
        gap: { xs: 3, md: 5 },
        flexWrap: 'wrap',
        borderTop: kkTokens.line.hair,
        borderColor: 'divider',
        pt: 3,
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Stack>
);
