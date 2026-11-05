import Box from '@mui/material/Box';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';

export const KkPlanActionBarDivider: FC = () => (
  <Box
    aria-hidden
    sx={(theme) => ({
      flexShrink: 0,
      alignSelf: 'stretch',
      width: kkTokens.line.hair,
      my: 0.75,
      mx: 0.25,
      backgroundColor: (theme.vars ?? theme).palette.divider,
    })}
  />
);
