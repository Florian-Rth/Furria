import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';

interface KkStudioATransportRootProps extends PropsWithChildren {
  label: string;
  sx?: KkSx;
}

export const KkStudioATransportRoot: FC<KkStudioATransportRootProps> = ({
  label,
  sx,
  children,
}) => (
  <Stack
    role="toolbar"
    aria-label={label}
    data-kk-studio-a-transport
    sx={[{ gap: 1, minWidth: 0 }, ...(Array.isArray(sx) ? sx : [sx])]}
  >
    {children}
  </Stack>
);
