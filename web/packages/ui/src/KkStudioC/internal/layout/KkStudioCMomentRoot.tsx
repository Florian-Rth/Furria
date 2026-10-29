import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';

interface KkStudioCMomentRootProps extends PropsWithChildren {
  sx?: KkSx;
}

export const KkStudioCMomentRoot: FC<KkStudioCMomentRootProps> = ({ sx, children }) => (
  <Stack
    direction="row"
    data-kk-studio-c-moment
    sx={[
      { alignItems: 'flex-start', columnGap: 1.25, minWidth: 0 },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Stack>
);
