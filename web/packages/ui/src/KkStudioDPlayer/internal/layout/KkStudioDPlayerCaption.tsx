import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import { safeAreaInset } from '../../../internal/safe-area';
import { edgeOf, PLAYER_LAYER } from '../player-paint';

export const KkStudioDPlayerCaption: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    direction="row"
    data-kk-studio-d-caption
    sx={(theme) => ({
      position: 'absolute',
      zIndex: PLAYER_LAYER.overlay,
      left: edgeOf('left', false),
      right: edgeOf('right', false),
      bottom: `calc(${safeAreaInset('bottom')} + 6.25rem)`,
      alignItems: 'flex-end',
      gap: 1.5,
      minWidth: 0,
      pointerEvents: 'none',
      [theme.breakpoints.up('desktop')]: {
        left: edgeOf('left', true),
        right: edgeOf('right', true),
        bottom: '7.5rem',
        gap: 2.5,
      },
    })}
  >
    {children}
  </Stack>
);
