import Box from '@mui/material/Box';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';

export const KkPracticeTransportDivider: FC = () => (
  <Box
    aria-hidden
    sx={(theme) => ({
      width: kkTokens.line.hair,
      height: '1.5rem',
      mx: 0.5,
      backgroundColor: (theme.vars ?? theme).palette.divider,
    })}
  />
);
