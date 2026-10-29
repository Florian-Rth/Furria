import Box from '@mui/material/Box';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';
import type { KkStudioCTick } from '../../studio-c-types';

const FIRST_COUNT = 1;
const TICK_TOP = 0;
const MINOR_TICK = 6;
const FIRST_TICK = 12;
const DIGIT_OFFSET = 4;

const ticksPaint = (theme: Theme): CSSObject => {
  const palette = (theme.vars ?? theme).palette;

  return {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    overflow: 'visible',
    '& [data-tick="minor"]': { stroke: palette.text.disabled, strokeWidth: kkTokens.line.hair },
    '& [data-tick="first"]': { stroke: palette.text.primary, strokeWidth: kkTokens.line.section },
    '& text': {
      typography: 'caption',
      fontWeight: 600,
      fill: palette.text.disabled,
      fontVariantNumeric: 'tabular-nums',
      dominantBaseline: 'auto',
    },
    '& text[data-first]': { fill: palette.text.primary, fontWeight: 900 },
  };
};

interface KkStudioCTimelineTicksProps {
  ticks: readonly KkStudioCTick[];
}

export const KkStudioCTimelineTicks: FC<KkStudioCTimelineTicksProps> = ({ ticks }) => {
  const minor = ticks
    .filter((tick) => tick.count !== FIRST_COUNT)
    .map((tick) => `M${tick.x} ${TICK_TOP}v${MINOR_TICK}`)
    .join('');
  const first = ticks
    .filter((tick) => tick.count === FIRST_COUNT)
    .map((tick) => `M${tick.x} ${TICK_TOP}v${FIRST_TICK}`)
    .join('');
  const digits = ticks.map((tick) => {
    const firstMark = tick.count === FIRST_COUNT ? '' : undefined;

    return (
      <text key={tick.key} x={tick.x + DIGIT_OFFSET} y="88%" data-first={firstMark}>
        {tick.count}
      </text>
    );
  });

  return (
    <Box component="svg" aria-hidden data-kk-studio-c-ticks sx={ticksPaint}>
      <path data-tick="minor" d={minor} />
      <path data-tick="first" d={first} />
      {digits}
    </Box>
  );
};
