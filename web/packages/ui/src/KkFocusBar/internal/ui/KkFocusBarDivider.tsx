import Box from '@mui/material/Box';
import type { Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

export const KkFocusBarDivider: FC = () => (
  <Box
    aria-hidden
    sx={(theme) => ({
      flex: 'none',
      alignSelf: 'stretch',
      my: 1,
      borderLeft: `${kkTokens.line.hair}px solid ${palette(theme).divider}`,
    })}
  />
);
