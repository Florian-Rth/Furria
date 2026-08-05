import { kkTokens } from '@furria/ui';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';

interface ApplySummaryRowProps {
  label: string;
  value: string;
}

export const ApplySummaryRow: FC<ApplySummaryRowProps> = ({ label, value }) => (
  <Stack data-kk-apply-summary-row sx={{ gap: 0 }}>
    <Divider />
    <Stack
      direction="row"
      sx={{ alignItems: 'baseline', justifyContent: 'space-between', gap: 2, py: 1.25 }}
    >
      <Typography
        component="span"
        variant="overline"
        sx={{ ...kkTokens.eyebrow, color: 'text.secondary', flexShrink: 0 }}
      >
        {label}
      </Typography>
      <Typography component="span" variant="body2" sx={{ fontWeight: 800, textAlign: 'right' }}>
        {value}
      </Typography>
    </Stack>
  </Stack>
);
