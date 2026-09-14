import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren, Ref } from 'react';
import type { KkSx } from '../../../kk-sx';

interface KkAppShellStageHeadProps extends PropsWithChildren {
  ref?: Ref<HTMLDivElement>;
  sx?: KkSx;
}

export const KkAppShellStageHead: FC<KkAppShellStageHeadProps> = ({ ref, sx, children }) => (
  <Stack
    ref={ref}
    data-kk-app-shell-stage-head
    sx={[{ gap: { xs: 1.25, desktop: 1.5 }, minWidth: 0 }, ...(Array.isArray(sx) ? sx : [sx])]}
  >
    {children}
  </Stack>
);
