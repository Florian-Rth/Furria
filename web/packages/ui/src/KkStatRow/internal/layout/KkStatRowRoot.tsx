import Stack from '@mui/material/Stack';
import type { SxProps, Theme } from '@mui/material/styles';
import type { FC, PropsWithChildren } from 'react';
import { kkTokens } from '../../../tokens';

interface KkStatRowRootProps extends PropsWithChildren {
  sx?: SxProps<Theme>;
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
