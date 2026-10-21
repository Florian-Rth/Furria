import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';

interface KkInstallStageCopyProps extends PropsWithChildren {
  sx?: KkSx;
}

export const KkInstallStageCopy: FC<KkInstallStageCopyProps> = ({ sx, children }) => (
  <Stack sx={[{ minWidth: 0, rowGap: 0.75 }, ...(Array.isArray(sx) ? sx : [sx])]}>{children}</Stack>
);
