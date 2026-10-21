import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';

interface KkInstallStageHeadProps extends PropsWithChildren {
  sx?: KkSx;
}

export const KkInstallStageHead: FC<KkInstallStageHeadProps> = ({ sx, children }) => (
  <Stack
    direction="row"
    sx={[
      { alignItems: 'center', columnGap: 2.25, minWidth: 0 },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Stack>
);
