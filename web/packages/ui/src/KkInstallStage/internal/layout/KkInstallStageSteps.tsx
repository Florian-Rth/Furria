import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';

interface KkInstallStageStepsProps extends PropsWithChildren {
  label: string;
  sx?: KkSx;
}

export const KkInstallStageSteps: FC<KkInstallStageStepsProps> = ({ label, sx, children }) => (
  <Stack
    component="ol"
    aria-label={label}
    sx={[{ listStyle: 'none', m: 0, p: 0 }, ...(Array.isArray(sx) ? sx : [sx])]}
  >
    {children}
  </Stack>
);
