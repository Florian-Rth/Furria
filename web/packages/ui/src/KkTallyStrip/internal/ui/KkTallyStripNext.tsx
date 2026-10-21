import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { KkIcon } from '../../../KkIcon';
import { stepFigures } from '../../../KkStatePill/state-paint';
import { kkTokens } from '../../../tokens';

interface KkTallyStripNextProps {
  label: string;
  day: string;
  fact: string;
}

export const KkTallyStripNext: FC<KkTallyStripNextProps> = ({ label, day, fact }) => (
  <Stack
    direction="row"
    data-kk-tally-strip-next
    title={label}
    sx={{
      alignItems: 'center',
      gap: 0.75,
      minWidth: 0,
      px: { xs: 1.5, md: 2 },
      py: 0.875,
      borderTopWidth: kkTokens.line.hair,
      borderTopStyle: 'solid',
      borderTopColor: 'divider',
      typography: 'caption',
      fontWeight: 700,
      lineHeight: 1.3,
      color: 'text.secondary',
    }}
  >
    <KkIcon name="clock" size="small" />
    <Box component="span" sx={{ minWidth: 0, overflowWrap: 'anywhere' }}>
      <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
        {label}{' '}
      </Box>
      <Box component="span" sx={{ ...stepFigures, color: 'text.primary' }}>
        {day}
      </Box>
      {' · '}
      {fact}
    </Box>
  </Stack>
);
