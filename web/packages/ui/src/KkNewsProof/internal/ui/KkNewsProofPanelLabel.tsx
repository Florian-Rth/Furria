import Typography from '@mui/material/Typography';
import type { FC } from 'react';

interface KkNewsProofPanelLabelProps {
  label: string;
}

export const KkNewsProofPanelLabel: FC<KkNewsProofPanelLabelProps> = ({ label }) => (
  <Typography
    variant="overline"
    noWrap
    sx={{ color: 'text.secondary', lineHeight: 1.4, minWidth: 0 }}
  >
    {label}
  </Typography>
);
