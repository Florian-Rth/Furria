import { kkTokens } from '@furria/ui';
import Card from '@mui/material/Card';
import type { FC, PropsWithChildren } from 'react';

export const MatcherPanel: FC<PropsWithChildren> = ({ children }) => (
  <Card
    data-kk-matcher-panel
    sx={{
      display: 'flex',
      flexDirection: 'column',
      gap: { xs: 3, md: 4 },
      p: { xs: 3, md: 5 },
      width: '100%',
      maxWidth: '54rem',
      minHeight: { xs: '25rem', md: '21rem' },
      boxShadow: kkTokens.shadow.raised,
    }}
  >
    {children}
  </Card>
);
