import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';

interface KkLaneBarTitleProps {
  eyebrow: string;
  text: string;
}

export const KkLaneBarTitle: FC<KkLaneBarTitleProps> = ({ eyebrow, text }) => (
  <Stack sx={{ minWidth: 0, flexShrink: 1, pr: 1 }}>
    <Typography
      variant="overline"
      noWrap
      sx={{
        lineHeight: 1.1,
        fontWeight: kkTokens.eyebrow.fontWeight,
        letterSpacing: kkTokens.type.tracking.section,
        color: 'text.secondary',
      }}
    >
      {eyebrow}
    </Typography>
    <Typography variant="h4" component="p" noWrap sx={{ lineHeight: 1.1 }}>
      {text}
    </Typography>
  </Stack>
);
