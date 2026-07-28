import { kkTokens } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const AlbumCreditRow: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    direction="row"
    data-kk-album-credit-row
    sx={{
      alignSelf: 'stretch',
      minWidth: 0,
      flexWrap: 'wrap',
      alignItems: 'baseline',
      gap: { xs: 1, md: 2 },
      borderTop: `${kkTokens.line.hair}px solid`,
      borderColor: 'divider',
      pt: { xs: 1.5, md: 2 },
    }}
  >
    {children}
  </Stack>
);
