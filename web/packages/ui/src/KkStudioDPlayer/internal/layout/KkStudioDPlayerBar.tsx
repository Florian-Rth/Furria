import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import { edgeOf, fadesWhenAsleep, PLAYER_LAYER } from '../player-paint';

export const KkStudioDPlayerBar: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    data-kk-studio-d-bar
    sx={(theme) => ({
      position: 'absolute',
      zIndex: PLAYER_LAYER.overlay,
      left: edgeOf('left', false),
      right: edgeOf('right', false),
      bottom: edgeOf('bottom', false),
      gap: 0.75,
      ...fadesWhenAsleep,
      [theme.breakpoints.up('desktop')]: {
        left: edgeOf('left', true),
        right: edgeOf('right', true),
        bottom: edgeOf('bottom', true),
        gap: 1.25,
      },
    })}
  >
    {children}
  </Stack>
);
