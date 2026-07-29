import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const AlbumTitleRow: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    data-kk-album-title-row
    direction={{ xs: 'column', sm: 'row' }}
    sx={{
      alignSelf: 'stretch',
      minWidth: 0,
      gap: { xs: 2, sm: 4 },
      justifyContent: 'space-between',
      alignItems: { sm: 'flex-end' },
    }}
  >
    {children}
  </Stack>
);
