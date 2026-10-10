import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import { kkTokens } from '../tokens';

export const KkBannerPanel: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    direction="row"
    sx={(theme) => ({
      gap: 0.5,
      p: 0.5,
      alignItems: 'center',
      flexWrap: 'wrap',
      justifyContent: 'center',
      borderRadius: `${kkTokens.radius.base}px`,
      bgcolor: 'background.paper',
      color: 'text.primary',
      boxShadow: theme.shadows[3],
    })}
  >
    {children}
  </Stack>
);
