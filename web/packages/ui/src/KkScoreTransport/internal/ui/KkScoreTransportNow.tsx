import Box from '@mui/material/Box';
import type { FC } from 'react';
import { redInk } from '../../../internal/red-ink';
import { SCORE_FIGURES } from '../../../KkScoreTrack/internal/score-paint';
import { kkTokens } from '../../../tokens';

interface KkScoreTransportNowProps {
  number: number | null;
  name: string;
  lit: boolean;
}

export const KkScoreTransportNow: FC<KkScoreTransportNowProps> = ({ number, name, lit }) => {
  const figure =
    number === null ? null : (
      <Box
        component="span"
        sx={{
          fontFamily: kkTokens.font.display,
          typography: 'subtitle1',
          lineHeight: 1,
          ...SCORE_FIGURES,
        }}
      >
        {number}
      </Box>
    );

  return (
    <Box
      component="span"
      aria-live="polite"
      data-kk-score-now
      data-lit={lit}
      sx={(theme) => ({
        display: 'inline-flex',
        alignItems: 'baseline',
        gap: 0.625,
        minWidth: 0,
        flex: '1 1 8rem',
        typography: 'body2',
        fontWeight: 800,
        overflowWrap: 'anywhere',
        transition: 'color 160ms ease-out',
        '&[data-lit="true"]': redInk(theme),
      })}
    >
      {figure}
      {name}
    </Box>
  );
};
