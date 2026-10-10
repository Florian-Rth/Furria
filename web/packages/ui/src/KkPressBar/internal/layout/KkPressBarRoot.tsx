import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import { kkTokens } from '../../../tokens';

export const KkPressBarRoot: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    direction="row"
    data-kk-press-bar
    sx={(theme) => ({
      gap: { xs: 1, md: 2 },
      px: { xs: 1.25, md: 2 },
      py: { xs: 1, md: 1.25 },
      alignItems: 'center',
      minWidth: 0,
      bgcolor: 'background.paper',
      border: 1,
      borderColor: 'divider',
      borderRadius: `${kkTokens.radius.base}px`,
      boxShadow: theme.shadows[4],
    })}
  >
    {children}
  </Stack>
);
