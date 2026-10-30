import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';

interface KkLaneInspectorHeadProps {
  eyebrow: string;
  title: string;
}

export const KkLaneInspectorHead: FC<KkLaneInspectorHeadProps> = ({ eyebrow, title }) => (
  <Stack sx={{ gap: 0.25, minWidth: 0 }}>
    <Typography
      variant="overline"
      sx={{
        lineHeight: 1.2,
        fontWeight: kkTokens.eyebrow.fontWeight,
        letterSpacing: kkTokens.type.tracking.section,
        color: 'text.secondary',
      }}
    >
      {eyebrow}
    </Typography>
    <Typography variant="h3" component="h2" sx={{ overflowWrap: 'anywhere' }}>
      {title}
    </Typography>
  </Stack>
);
