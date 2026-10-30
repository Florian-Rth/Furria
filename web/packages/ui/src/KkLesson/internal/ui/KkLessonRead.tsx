import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { KkEyebrow } from '../../../KkEyebrow';
import { kkTokens } from '../../../tokens';

interface KkLessonReadProps {
  eyebrow: string;
  name: string;
  text: string;
}

export const KkLessonRead: FC<KkLessonReadProps> = ({ eyebrow, name, text }) => (
  <Stack
    data-kk-lesson-read
    sx={{
      gap: 1,
      px: { xs: 2, desktop: 3 },
      pt: 0.5,
      pb: 'max(env(safe-area-inset-bottom), 2rem)',
      width: '100%',
      maxWidth: kkTokens.measure.text,
      mx: 'auto',
      overflowY: 'auto',
    }}
  >
    <KkEyebrow>{eyebrow}</KkEyebrow>
    <Typography variant="h1" component="h2">
      {name}
    </Typography>
    <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
      {text}
    </Typography>
  </Stack>
);
