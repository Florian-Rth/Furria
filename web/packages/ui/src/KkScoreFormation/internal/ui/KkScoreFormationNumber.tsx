import Box from '@mui/material/Box';
import type { Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { percentOf, SCORE_FIGURES } from '../../../internal/score-paint';
import { kkTokens } from '../../../tokens';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkScoreFormationNumberProps {
  left: number;
  top: number;
  number: number;
  own: boolean;
  open: boolean;
}

export const KkScoreFormationNumber: FC<KkScoreFormationNumberProps> = ({
  left,
  top,
  number,
  own,
  open,
}) => (
  <Box
    component="span"
    aria-hidden
    data-own={own}
    data-open={open}
    style={{ left: percentOf(left), top: percentOf(top) }}
    sx={(theme) => ({
      position: 'absolute',
      transform: 'translate(-50%, -50%)',
      fontFamily: kkTokens.font.display,
      typography: 'caption',
      lineHeight: 1,
      pointerEvents: 'none',
      color: palette(theme).background.paper,
      ...SCORE_FIGURES,
      '&[data-open="true"]': { color: palette(theme).text.secondary },
      '&[data-own="true"]': { color: palette(theme).primary.contrastText },
    })}
  >
    {number}
  </Box>
);
