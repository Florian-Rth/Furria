import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export type KkVideoCornerSide = 'start' | 'end';

interface KkVideoCornerProps extends PropsWithChildren {
  side: KkVideoCornerSide;
}

export const KkVideoCorner: FC<KkVideoCornerProps> = ({ side, children }) => (
  <Stack
    direction="row"
    data-kk-video-corner={side}
    sx={{
      position: 'absolute',
      top: 0,
      left: side === 'start' ? 0 : 'auto',
      right: side === 'end' ? 0 : 'auto',
      zIndex: 2,
      p: 0.75,
      gap: 0.5,
      alignItems: 'center',
    }}
  >
    {children}
  </Stack>
);
