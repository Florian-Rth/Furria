import { kkTokens } from '@furria/ui';
import Card from '@mui/material/Card';
import type { FC, PropsWithChildren } from 'react';

export const MatcherTopMatchCard: FC<PropsWithChildren> = ({ children }) => (
  <Card
    sx={{
      width: '100%',
      borderColor: 'primary.main',
      borderWidth: kkTokens.line.section,
      boxShadow: kkTokens.shadow.raised,
    }}
  >
    {children}
  </Card>
);
