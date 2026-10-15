import Box from '@mui/material/Box';
import type { ElementType, FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';

interface KkAvatarFrameProps extends PropsWithChildren {
  size: string;
  component?: ElementType;
  sx?: KkSx;
}

export const KkAvatarFrame: FC<KkAvatarFrameProps> = ({
  size,
  component = 'div',
  sx,
  children,
}) => (
  <Box
    component={component}
    data-kk-avatar-frame
    sx={[
      {
        position: 'relative',
        display: 'grid',
        placeItems: 'center',
        width: size,
        height: size,
        flexShrink: 0,
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Box>
);
