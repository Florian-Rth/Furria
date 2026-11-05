import Typography from '@mui/material/Typography';
import type { FC } from 'react';

interface KkPlanActionBarReadoutProps {
  value: string;
  label: string;
}

export const KkPlanActionBarReadout: FC<KkPlanActionBarReadoutProps> = ({ value, label }) => (
  <Typography
    variant="subtitle2"
    aria-label={label}
    title={label}
    data-kk-plan-action-readout
    sx={{
      minWidth: '2rem',
      px: 0.5,
      textAlign: 'center',
      fontWeight: 800,
      fontVariantNumeric: 'tabular-nums',
      whiteSpace: 'nowrap',
    }}
  >
    {value}
  </Typography>
);
