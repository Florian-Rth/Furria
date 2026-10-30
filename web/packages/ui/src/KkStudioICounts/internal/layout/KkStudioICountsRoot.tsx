import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import { kkTokens } from '../../../tokens';

interface KkStudioICountsRootProps extends PropsWithChildren {
  label: string;
}

export const KkStudioICountsRoot: FC<KkStudioICountsRootProps> = ({ label, children }) => (
  <Box
    role="group"
    aria-label={label}
    data-kk-studio-i-counts
    sx={(theme) => ({
      position: 'relative',
      height: '2.75rem',
      borderRadius: `${kkTokens.radius.base * 0.75}px`,
      backgroundColor: (theme.vars ?? theme).palette.background.paper,
      boxShadow: `inset 0 0 0 ${kkTokens.line.hair}px ${(theme.vars ?? theme).palette.divider}`,
    })}
  >
    <Box
      data-kk-studio-i-counts-field
      sx={{ position: 'absolute', inset: '0 0.75rem', containerType: 'size' }}
    >
      {children}
    </Box>
  </Box>
);
