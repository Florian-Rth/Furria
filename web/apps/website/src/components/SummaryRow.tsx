import { KkEyebrow } from '@furria/ui';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';

interface SummaryRowProps {
  label: string;
  value: string;
}

export const SummaryRow: FC<SummaryRowProps> = ({ label, value }) => (
  <Stack data-kk-summary-row sx={{ gap: 0 }}>
    <Divider />
    <Stack
      direction="row"
      sx={{ alignItems: 'baseline', justifyContent: 'space-between', gap: 2, py: 1.25 }}
    >
      <KkEyebrow tone="muted" sx={{ flexShrink: 0 }}>
        {label}
      </KkEyebrow>
      <Typography
        component="span"
        variant="body2"
        sx={{ fontWeight: 800, textAlign: 'right', minWidth: 0, overflowWrap: 'anywhere' }}
      >
        {value}
      </Typography>
    </Stack>
  </Stack>
);
