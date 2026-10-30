import Box from '@mui/material/Box';
import type { Theme } from '@mui/material/styles';
import type { FC, PropsWithChildren } from 'react';
import { kkTokens } from '../../../tokens';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

export const KkEightsFrameWave: FC<PropsWithChildren> = ({ children }) => (
  <Box
    sx={(theme) => ({
      position: 'relative',
      flexShrink: 0,
      height: { xs: '8rem', md: '12rem' },
      borderRadius: `${kkTokens.radius.base}px`,
      backgroundColor: palette(theme).background.paper,
      boxShadow: `inset 0 0 0 ${kkTokens.line.hair}px ${palette(theme).divider}`,
    })}
  >
    {children}
  </Box>
);
