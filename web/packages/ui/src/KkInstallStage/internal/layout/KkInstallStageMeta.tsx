import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';

interface KkInstallStageMetaProps extends PropsWithChildren {
  sx?: KkSx;
}

export const KkInstallStageMeta: FC<KkInstallStageMetaProps> = ({ sx, children }) => (
  <Stack
    direction="row"
    sx={[
      { alignItems: 'center', justifyContent: 'space-between', columnGap: 1.5, minWidth: 0 },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Stack>
);
