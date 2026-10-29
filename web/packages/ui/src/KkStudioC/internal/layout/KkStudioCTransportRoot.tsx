import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';

interface KkStudioCTransportRootProps extends PropsWithChildren {
  label: string;
  sx?: KkSx;
}

export const KkStudioCTransportRoot: FC<KkStudioCTransportRootProps> = ({
  label,
  sx,
  children,
}) => (
  <Stack
    direction="row"
    role="toolbar"
    aria-label={label}
    data-kk-studio-c-transport
    sx={[
      { alignItems: 'center', columnGap: { xs: 0.5, md: 1 }, minWidth: 0 },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Stack>
);
