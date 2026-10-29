import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import { edgeOf, fadesWhenAsleep, PLAYER_LAYER } from '../player-paint';

export const KkStudioDPlayerTop: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    direction="row"
    data-kk-studio-d-top
    sx={(theme) => ({
      position: 'absolute',
      zIndex: PLAYER_LAYER.overlay,
      top: edgeOf('top', false),
      left: edgeOf('left', false),
      right: `calc(${edgeOf('right', false)} + 8.5rem)`,
      alignItems: 'center',
      gap: 1,
      minWidth: 0,
      ...fadesWhenAsleep,
      [theme.breakpoints.up('desktop')]: {
        top: edgeOf('top', true),
        left: edgeOf('left', true),
        right: `calc(${edgeOf('right', true)} + 17rem)`,
      },
    })}
  >
    {children}
  </Stack>
);
