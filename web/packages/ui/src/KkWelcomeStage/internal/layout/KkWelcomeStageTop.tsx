import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';

interface KkWelcomeStageTopProps extends PropsWithChildren {
  sx?: KkSx;
}

export const KkWelcomeStageTop: FC<KkWelcomeStageTopProps> = ({ sx, children }) => (
  <Stack
    direction="row"
    sx={[
      { alignItems: 'center', justifyContent: 'space-between', columnGap: 2, minWidth: 0 },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Stack>
);
