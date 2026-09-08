import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { KkEyebrow } from './KkEyebrow';
import { kkTokens } from './tokens';

interface KkFieldRowProps {
  label: string;
  value: string;
}

export const KkFieldRow: FC<KkFieldRowProps> = ({ label, value }) => (
  <Stack
    direction="row"
    data-kk-field-row
    sx={{
      alignItems: 'baseline',
      justifyContent: 'space-between',
      gap: 2,
      minWidth: 0,
      py: 1.5,
      borderBottom: kkTokens.line.hair,
      borderColor: 'divider',
      '&:last-of-type': { borderBottom: 'none' },
    }}
  >
    <KkEyebrow tone="muted">{label}</KkEyebrow>
    <Typography
      variant="body2"
      sx={{ fontWeight: 800, textAlign: 'right', minWidth: 0, color: 'text.primary' }}
    >
      {value}
    </Typography>
  </Stack>
);
