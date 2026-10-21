import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC, ReactNode } from 'react';
import { kkTokens } from './tokens';

interface KkFactLineProps {
  label: string;
  value: ReactNode;
  stackOnPhone?: boolean;
}

export const KkFactLine: FC<KkFactLineProps> = ({ label, value, stackOnPhone = false }) => (
  <Stack
    direction="row"
    data-kk-fact-line
    sx={{
      flexDirection: stackOnPhone ? { xs: 'column', md: 'row' } : 'row',
      alignItems: stackOnPhone ? { xs: 'flex-start', md: 'center' } : 'center',
      justifyContent: 'space-between',
      gap: stackOnPhone ? { xs: 0.75, md: 2 } : 2,
      py: stackOnPhone ? { xs: 1, md: 0 } : 0,
      minWidth: 0,
      minHeight: kkTokens.tapTarget,
      borderTopWidth: kkTokens.line.hair,
      borderTopStyle: 'solid',
      borderTopColor: 'divider',
    }}
  >
    <Box component="span" sx={{ typography: 'body2', color: 'text.secondary' }}>
      {label}
    </Box>
    <Box
      component="span"
      sx={{
        typography: 'body2',
        fontWeight: 700,
        color: 'text.primary',
        textAlign: stackOnPhone ? { xs: 'left', md: 'right' } : 'right',
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {value}
    </Box>
  </Stack>
);
