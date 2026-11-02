import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC, ReactNode } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { goldInkOf } from '../../../internal/gold-ink';
import { inkWash } from '../../../internal/ink-wash';
import { redInk } from '../../../internal/red-ink';
import { KkScoreGlyph } from '../../../KkScoreGlyph/KkScoreGlyph';
import { SCORE_FIGURES } from '../../../KkScoreTrack/internal/score-paint';
import { kkTokens } from '../../../tokens';

const rowPaint = (theme: Theme): CSSObject => ({
  width: '100%',
  minHeight: kkTokens.tapTarget,
  display: 'grid',
  gridTemplateColumns: '1.75rem auto minmax(0, 1fr) auto',
  alignItems: 'center',
  columnGap: 1,
  px: 0.75,
  py: 0.625,
  textAlign: 'left',
  color: 'text.primary',
  borderBottomWidth: kkTokens.line.hair,
  borderBottomStyle: 'solid',
  borderBottomColor: 'divider',
  boxShadow: `inset 0 0 0 transparent`,
  transition: 'background-color 160ms ease-out, box-shadow 160ms ease-out',
  ...focusRing(theme),
  '@media (hover: hover)': { '&:hover': { backgroundColor: inkWash(theme, '5%') } },
  '&[data-selected="true"]': {
    backgroundColor: inkWash(theme, '8%'),
    boxShadow: `inset ${kkTokens.line.page}px 0 0 ${(theme.vars ?? theme).palette.text.primary}`,
  },
  '&[data-current="true"]': {
    boxShadow: `inset ${kkTokens.line.page}px 0 0 ${(theme.vars ?? theme).palette.primary.main}`,
  },
  '&[data-current="true"] [data-kk-score-row-number]': redInk(theme),
});

interface KkScoreManualRowProps {
  label: string;
  number: number;
  title: string;
  meta: string;
  figure: ReactNode;
  movement: boolean;
  video: boolean;
  flag: string | null;
  selected: boolean;
  current: boolean;
  onSelect: () => void;
}

export const KkScoreManualRow: FC<KkScoreManualRowProps> = ({
  label,
  number,
  title,
  meta,
  figure,
  movement,
  video,
  flag,
  selected,
  current,
  onSelect,
}) => {
  const flagLine =
    flag === null ? null : (
      <Stack
        direction="row"
        component="span"
        sx={(theme) => ({
          alignItems: 'center',
          gap: 0.375,
          typography: 'caption',
          fontWeight: 800,
          ...goldInkOf(theme),
        })}
      >
        <KkScoreGlyph kind="flag" present size="tiny" />
        {flag}
      </Stack>
    );
  const metaLine =
    meta === '' ? null : (
      <Box
        component="span"
        sx={{ typography: 'caption', color: 'text.secondary', fontWeight: 600, ...SCORE_FIGURES }}
      >
        {meta}
      </Box>
    );

  return (
    <Box component="li" sx={{ minWidth: 0 }}>
      <ButtonBase
        aria-label={label}
        aria-current={current ? 'step' : undefined}
        data-kk-score-row
        data-selected={selected}
        data-current={current}
        onClick={onSelect}
        sx={rowPaint}
      >
        <Box
          component="span"
          data-kk-score-row-number
          sx={{
            fontFamily: kkTokens.font.display,
            typography: 'subtitle1',
            lineHeight: 1,
            textAlign: 'right',
            ...SCORE_FIGURES,
          }}
        >
          {number}
        </Box>
        {figure}
        <Stack sx={{ minWidth: 0, gap: 0.125 }}>
          <Box
            component="span"
            sx={{
              typography: 'body2',
              fontWeight: 800,
              lineHeight: 1.25,
              minWidth: 0,
              overflowWrap: 'anywhere',
            }}
          >
            {title}
          </Box>
          {metaLine}
          {flagLine}
        </Stack>
        <Stack direction="row" sx={{ gap: 0.75, alignItems: 'center' }}>
          <KkScoreGlyph kind="movement" present={movement} />
          <KkScoreGlyph kind="video" present={video} />
        </Stack>
      </ButtonBase>
    </Box>
  );
};
