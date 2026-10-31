import MusicOffRoundedIcon from '@mui/icons-material/MusicOffRounded';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';

interface KkLessonQuietProps {
  text: string;
}

export const KkLessonQuiet: FC<KkLessonQuietProps> = ({ text }) => (
  <Stack
    data-kk-lesson-quiet
    sx={{
      alignItems: 'center',
      gap: 1,
      px: 3,
      maxWidth: kkTokens.measure.empty,
      textAlign: 'center',
      color: kkTokens.overlay.onPhotoText,
    }}
  >
    <MusicOffRoundedIcon aria-hidden fontSize="large" sx={{ opacity: kkTokens.opacity.dimmed }} />
    <Typography variant="subtitle2" sx={{ color: 'inherit', opacity: kkTokens.opacity.onAccent }}>
      {text}
    </Typography>
  </Stack>
);
