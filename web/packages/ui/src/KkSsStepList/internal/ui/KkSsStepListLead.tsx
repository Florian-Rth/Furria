import Typography from '@mui/material/Typography';
import type { FC } from 'react';

interface KkSsStepListLeadProps {
  number: string;
}

export const KkSsStepListLead: FC<KkSsStepListLeadProps> = ({ number }) => (
  <Typography
    component="span"
    variant="h4"
    aria-hidden
    sx={{
      flexShrink: 0,
      minWidth: '1.75rem',
      textAlign: 'right',
      fontVariantNumeric: 'tabular-nums',
    }}
  >
    {number}
  </Typography>
);
