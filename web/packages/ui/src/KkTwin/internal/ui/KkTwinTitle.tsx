import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';

interface KkTwinTitleProps {
  eyebrow: string;
  title: string;
}

export const KkTwinTitle: FC<KkTwinTitleProps> = ({ eyebrow, title }) => (
  <Stack sx={{ flex: 1, minWidth: 0 }}>
    <Typography
      variant="overline"
      noWrap
      sx={{
        fontWeight: kkTokens.eyebrow.fontWeight,
        letterSpacing: kkTokens.eyebrow.letterSpacing,
        lineHeight: 1.2,
        color: 'text.secondary',
      }}
    >
      {eyebrow}
    </Typography>
    <Typography component="h1" variant="h4" noWrap sx={{ lineHeight: 1.15 }}>
      {title}
    </Typography>
  </Stack>
);
