import Box from '@mui/material/Box';
import type { Theme } from '@mui/material/styles';
import type { FC, PropsWithChildren } from 'react';
import { kkTokens } from '../../../tokens';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

export const KkStudioPlacementTrack: FC<PropsWithChildren> = ({ children }) => (
  <Box
    data-kk-studio-track
    sx={(theme) => ({
      position: 'relative',
      flex: 1,
      minWidth: 0,
      height: '2.25rem',
      borderRadius: `${kkTokens.radius.bar + 1}px`,
      backgroundColor: `color-mix(in srgb, ${palette(theme).text.primary} 5%, transparent)`,
    })}
  >
    {children}
  </Box>
);
