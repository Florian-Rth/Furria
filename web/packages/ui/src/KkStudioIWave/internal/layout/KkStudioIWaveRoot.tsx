import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import {
  KK_STUDIO_I_SHORT,
  KK_STUDIO_I_WIDE,
} from '../../../KkStudioIEditor/studio-i-editor-query';
import { kkTokens } from '../../../tokens';

interface KkStudioIWaveRootProps extends PropsWithChildren {
  label: string;
  size?: 'page' | 'whole';
}

export const KkStudioIWaveRoot: FC<KkStudioIWaveRootProps> = ({
  label,
  size = 'page',
  children,
}) => (
  <Box
    role="group"
    aria-label={label}
    data-kk-studio-i-wave
    sx={(theme) => ({
      position: 'relative',
      height: size === 'page' ? '4.75rem' : '4rem',
      borderRadius: `${kkTokens.radius.base * 0.75}px`,
      backgroundColor: (theme.vars ?? theme).palette.background.paper,
      boxShadow: `inset 0 0 0 ${kkTokens.line.hair}px ${(theme.vars ?? theme).palette.divider}`,
      [KK_STUDIO_I_WIDE]: { height: size === 'page' ? '6.5rem' : '5rem' },
      [KK_STUDIO_I_SHORT]: { height: '3.5rem' },
    })}
  >
    <Box
      data-kk-studio-i-field
      sx={{ position: 'absolute', inset: '0 0.75rem', containerType: 'size' }}
    >
      {children}
    </Box>
  </Box>
);
