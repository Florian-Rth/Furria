import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { inkWash } from '../../../internal/ink-wash';
import { SCORE_FIGURES } from '../../../KkScoreTrack/internal/score-paint';
import { kkTokens } from '../../../tokens';

const rowPaint = (theme: Theme): CSSObject => ({
  width: '100%',
  minHeight: kkTokens.tapTarget,
  display: 'grid',
  gridTemplateColumns: '3.25rem minmax(0, 1fr) auto',
  alignItems: 'center',
  columnGap: 1,
  px: 1.25,
  py: 0.5,
  textAlign: 'left',
  color: 'text.primary',
  ...focusRing(theme),
});

interface KkScoreEveningsRowProps {
  numberLabel: string;
  number: string | null;
  openNumberLabel: string;
  title: string;
  date: string;
  hint: string;
  onOpen: (() => void) | null;
}

export const KkScoreEveningsRow: FC<KkScoreEveningsRowProps> = ({
  numberLabel,
  number,
  openNumberLabel,
  title,
  date,
  hint,
  onOpen,
}) => {
  const figure =
    number === null ? (
      <Box
        component="span"
        sx={{ typography: 'caption', fontWeight: 800, color: 'text.secondary' }}
      >
        {openNumberLabel}
      </Box>
    ) : (
      <Box
        component="span"
        data-kk-evening-number
        sx={{
          fontFamily: kkTokens.font.display,
          typography: 'h4',
          lineHeight: 1,
          ...SCORE_FIGURES,
        }}
      >
        {number}
      </Box>
    );
  const face = (
    <>
      <Box component="span" sx={{ display: 'inline-flex', alignItems: 'baseline', gap: 0.375 }}>
        <Box
          component="span"
          sx={{ typography: 'caption', fontWeight: 800, color: 'text.secondary' }}
        >
          {numberLabel}
        </Box>
        {figure}
      </Box>
      <Box
        component="span"
        sx={{ typography: 'body2', fontWeight: 800, minWidth: 0, overflowWrap: 'anywhere' }}
      >
        {title}
      </Box>
      <Box
        component="span"
        sx={{ typography: 'caption', fontWeight: 700, whiteSpace: 'nowrap', ...SCORE_FIGURES }}
      >
        {date}
      </Box>
    </>
  );
  const body =
    onOpen === null ? (
      <Box sx={rowPaint}>{face}</Box>
    ) : (
      <ButtonBase
        aria-label={hint}
        onClick={onOpen}
        sx={(theme) => ({
          ...rowPaint(theme),
          '@media (hover: hover)': { '&:hover': { backgroundColor: inkWash(theme, '5%') } },
        })}
      >
        {face}
      </ButtonBase>
    );

  return <Box component="li">{body}</Box>;
};
