import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';

interface KkLaneInspectorSectionProps {
  text: string;
}

export const KkLaneInspectorSection: FC<KkLaneInspectorSectionProps> = ({ text }) => (
  <Typography
    component="h3"
    variant="caption"
    sx={{
      fontWeight: 900,
      letterSpacing: kkTokens.type.tracking.label,
      textTransform: 'uppercase',
      color: 'text.secondary',
      lineHeight: 1.2,
      pt: 0.5,
    }}
  >
    {text}
  </Typography>
);
