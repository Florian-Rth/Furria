import Typography from '@mui/material/Typography';
import type { FC } from 'react';

interface KkStudioStepListLeadProps {
  number: string;
}

export const KkStudioStepListLead: FC<KkStudioStepListLeadProps> = ({ number }) => (
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
