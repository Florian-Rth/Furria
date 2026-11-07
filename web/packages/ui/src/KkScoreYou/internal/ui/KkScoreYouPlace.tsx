import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { SCORE_FIGURES } from '../../../internal/score-paint';
import { kkTokens } from '../../../tokens';

interface KkScoreYouPlaceProps {
  label: string;
  number: number;
}

export const KkScoreYouPlace: FC<KkScoreYouPlaceProps> = ({ label, number }) => (
  <Stack direction="row" data-kk-score-you-place sx={{ alignItems: 'baseline', gap: 0.75 }}>
    <Box
      component="span"
      sx={{
        typography: 'caption',
        fontWeight: 800,
        letterSpacing: kkTokens.type.tracking.label,
        textTransform: 'uppercase',
        color: 'text.secondary',
      }}
    >
      {label}
    </Box>
    <Box
      component="span"
      sx={{
        fontFamily: kkTokens.font.display,
        typography: 'h3',
        lineHeight: 1,
        color: 'primary.main',
        ...SCORE_FIGURES,
      }}
    >
      {number}
    </Box>
  </Stack>
);
