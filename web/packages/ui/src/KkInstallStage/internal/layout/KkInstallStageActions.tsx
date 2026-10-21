import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';

interface KkInstallStageActionsProps extends PropsWithChildren {
  sx?: KkSx;
}

export const KkInstallStageActions: FC<KkInstallStageActionsProps> = ({ sx, children }) => (
  <Stack sx={[{ rowGap: 1.25 }, ...(Array.isArray(sx) ? sx : [sx])]}>{children}</Stack>
);
