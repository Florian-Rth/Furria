import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';
import { kkTokens } from '../../../tokens';

interface KkStudioAManualRootProps extends PropsWithChildren {
  label: string;
  sx?: KkSx;
}

export const KkStudioAManualRoot: FC<KkStudioAManualRootProps> = ({ label, sx, children }) => (
  <Stack
    component="section"
    aria-label={label}
    data-kk-studio-a-manual
    sx={[
      (theme) => ({
        minWidth: 0,
        borderRadius: `${kkTokens.radius.base}px`,
        backgroundColor: (theme.vars ?? theme).palette.background.paper,
        border: `${kkTokens.line.hair}px solid ${(theme.vars ?? theme).palette.divider}`,
        overflow: 'clip',
      }),
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Stack>
);
