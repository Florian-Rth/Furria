import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';

export const NextAlbumFrame: FC<PropsWithChildren> = ({ children }) => (
  <Box data-kk-next-album sx={{ width: '100%', maxWidth: { sm: '24rem', md: '27rem' } }}>
    {children}
  </Box>
);
