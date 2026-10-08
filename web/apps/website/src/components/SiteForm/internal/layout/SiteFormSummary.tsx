import { kkTokens } from '@furria/ui';
import Card from '@mui/material/Card';
import type { FC, PropsWithChildren } from 'react';

export const SiteFormSummary: FC<PropsWithChildren> = ({ children }) => (
  <Card
    data-kk-site-form-summary
    sx={{
      display: 'flex',
      flexDirection: 'column',
      gap: { xs: 1.5, md: 2 },
      p: { xs: 3, md: 4 },
      boxShadow: kkTokens.shadow.raised,
    }}
  >
    {children}
  </Card>
);
