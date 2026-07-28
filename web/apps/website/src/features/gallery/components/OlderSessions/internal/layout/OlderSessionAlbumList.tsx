import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const OlderSessionAlbumList: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    data-kk-older-session-albums
    divider={<Divider sx={{ borderColor: 'divider' }} />}
    sx={{
      minWidth: 0,
      pl: { xs: 0, sm: 2 },
      pb: { xs: 2, desktop: 2.5 },
    }}
  >
    {children}
  </Stack>
);
