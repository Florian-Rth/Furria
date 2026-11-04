import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { stepFigures } from '../KkStatePill/state-paint';
import type { KkSx } from '../kk-sx';
import { KkTabStrokeMarks } from './internal/KkTabStrokeMarks';
import { tabStrokePaint } from './internal/tab-stroke-paint';
import type { KkTabStrokeState } from './tab-strokes';
import { TAB_TALLY_HEIGHT, TAB_TALLY_WIDTH, tabTallyMarksOf } from './tab-strokes';

const PAD = 1.5;
const STROKE_WIDTH = 1.9;
const HEIGHT = '0.875rem';

const tallyPaint = (theme: Theme): CSSObject => ({
  display: 'block',
  height: HEIGHT,
  width: 'auto',
  overflow: 'visible',
  ...tabStrokePaint(theme),
});

interface KkTabTallyProps {
  strokes: readonly KkTabStrokeState[];
  label: string;
  sx?: KkSx;
}

export const KkTabTally: FC<KkTabTallyProps> = ({ strokes, label, sx }) => {
  const layout = tabTallyMarksOf(strokes.length);
  const usedWidth =
    layout.marks.length === 0
      ? 0
      : Math.max(...layout.marks.map((mark) => Math.max(mark.x1, mark.x2))) + PAD;
  const width = Math.min(TAB_TALLY_WIDTH, usedWidth) + PAD;
  const more =
    layout.hidden === 0 ? null : (
      <Box
        component="span"
        aria-hidden
        sx={{
          ...stepFigures,
          typography: 'caption',
          fontWeight: 800,
          lineHeight: 1,
          color: 'text.secondary',
        }}
      >
        {`+${layout.hidden}`}
      </Box>
    );

  return (
    <Stack
      direction="row"
      role="img"
      aria-label={label}
      data-kk-tab-tally
      sx={[
        { alignItems: 'center', gap: 0.5, flexShrink: 0, minWidth: 0 },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Box
        component="svg"
        aria-hidden
        viewBox={`${-PAD} ${-PAD} ${width + PAD} ${TAB_TALLY_HEIGHT + PAD * 2}`}
        sx={tallyPaint}
      >
        <KkTabStrokeMarks marks={layout.marks} states={strokes} offset={0} width={STROKE_WIDTH} />
      </Box>
      {more}
    </Stack>
  );
};
