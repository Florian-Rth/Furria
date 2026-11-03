import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import { kkTokens } from '../../../tokens';

export const KkLaneFilmBar: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    component="figcaption"
    direction="row"
    data-kk-lane-film-bar
    sx={{
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      alignItems: 'center',
      gap: 0.75,
      px: 1,
      pt: 2,
      pb: 0.75,
      backgroundImage: `linear-gradient(to top, ${kkTokens.overlay.filmScrim}, transparent)`,
    }}
  >
    {children}
  </Stack>
);
