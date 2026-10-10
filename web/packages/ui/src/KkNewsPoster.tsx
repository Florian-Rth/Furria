import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { KkBroomMark } from './KkBroomMark';
import { newsPaintOf } from './KkNewsProof/internal/logic/news-paint';
import type { KkNewsTone } from './KkNewsProof/news-proof-types';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

interface KkNewsPosterProps {
  tone: KkNewsTone | null;
  word: string;
  sx?: KkSx;
}

export const KkNewsPoster: FC<KkNewsPosterProps> = ({ tone, word, sx }) => (
  <Stack
    data-kk-news-poster
    sx={[
      (theme) => {
        const paint = newsPaintOf(theme, tone);
        return {
          position: 'relative',
          width: '100%',
          height: '100%',
          borderRadius: 'inherit',
          justifyContent: 'flex-end',
          bgcolor: paint.fill,
          color: paint.ink,
        };
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    <KkBroomMark
      sx={{
        position: 'absolute',
        top: '2%',
        right: 0,
        height: '95%',
        width: 'auto',
        opacity: 0.16,
      }}
    />
    <Typography
      variant="inherit"
      component="span"
      sx={{
        position: 'relative',
        fontFamily: kkTokens.font.display,
        fontWeight: kkTokens.font.displayWeight,
        lineHeight: 0.9,
        letterSpacing: '0.01em',
        p: '0.42em',
      }}
    >
      {word}
    </Typography>
  </Stack>
);
