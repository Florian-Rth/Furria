import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { lineClamp } from '../../../internal/line-clamp';
import { kkTokens } from '../../../tokens';

const LINES = 5;

interface KkStudioEScreenNoteProps {
  eyebrow: string;
  text: string;
}

export const KkStudioEScreenNote: FC<KkStudioEScreenNoteProps> = ({ eyebrow, text }) => (
  <Stack
    data-kk-studio-e-screen-note
    sx={{ width: '100%', maxWidth: kkTokens.measure.note, gap: 1, px: { xs: 2.5, desktop: 3 } }}
  >
    <Typography
      variant="overline"
      sx={{
        fontWeight: kkTokens.eyebrow.fontWeight,
        letterSpacing: kkTokens.eyebrow.letterSpacing,
        lineHeight: kkTokens.eyebrow.lineHeight,
        color: 'text.secondary',
      }}
    >
      {eyebrow}
    </Typography>
    <Typography
      sx={{
        typography: 'body1',
        textWrap: 'pretty',
        ...lineClamp(LINES),
      }}
    >
      {text}
    </Typography>
  </Stack>
);
