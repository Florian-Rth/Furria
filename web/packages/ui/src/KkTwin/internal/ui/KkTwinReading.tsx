import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';

interface KkTwinReadingProps {
  eyebrow: string | null;
  title: string;
  text: string;
}

export const KkTwinReading: FC<KkTwinReadingProps> = ({ eyebrow, title, text }) => (
  <Stack
    data-kk-twin-reading
    sx={{
      gap: 1,
      width: '100%',
      maxWidth: kkTokens.measure.text,
      mx: 'auto',
      px: 2.5,
      pb: 4,
    }}
  >
    <Typography
      variant="overline"
      sx={{
        minHeight: '1lh',
        fontWeight: kkTokens.eyebrow.fontWeight,
        letterSpacing: kkTokens.eyebrow.letterSpacing,
        color: 'text.secondary',
      }}
    >
      {eyebrow}
    </Typography>
    <Typography component="h2" variant="h2">
      {title}
    </Typography>
    <Typography variant="body1" sx={{ textWrap: 'pretty' }}>
      {text}
    </Typography>
  </Stack>
);
