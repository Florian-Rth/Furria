import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';

interface KkWelcomeStageFootProps extends PropsWithChildren {
  sx?: KkSx;
}

export const KkWelcomeStageFoot: FC<KkWelcomeStageFootProps> = ({ sx, children }) => (
  <Stack
    direction="row"
    sx={[
      {
        flexShrink: 0,
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        columnGap: 2,
        minWidth: 0,
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Stack>
);
