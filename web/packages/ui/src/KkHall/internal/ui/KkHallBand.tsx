import Box from '@mui/material/Box';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';
import type { KkHallNumeralTone } from './KkHallNumeral';
import { KkHallNumeral } from './KkHallNumeral';

const COUNTS = [1, 2, 3, 4, 5, 6, 7, 8] as const;
const COLUMNS = `repeat(${COUNTS.length}, minmax(0, 1fr))`;

type CellState = 'music' | 'lead' | 'passed' | 'ahead';

const cellStateOf = (mark: number, count: number | null, leading: boolean): CellState => {
  if (count === null) {
    return 'ahead';
  }
  if (mark === count) {
    return leading ? 'lead' : 'music';
  }

  return !leading && mark < count ? 'passed' : 'ahead';
};

const numeralTones: Record<CellState, KkHallNumeralTone> = {
  music: 'onAccent',
  lead: 'lead',
  passed: 'rest',
  ahead: 'rest',
};

const cellPaint =
  (state: CellState) =>
  (theme: Theme): CSSObject => {
    const palette = (theme.vars ?? theme).palette;
    const fills: Record<CellState, string> = {
      music: palette.primary.main,
      lead: `color-mix(in srgb, ${palette.warning.main} 22%, transparent)`,
      passed: `color-mix(in srgb, ${palette.primary.main} 18%, transparent)`,
      ahead: palette.background.paper,
    };

    return {
      position: 'relative',
      minWidth: 0,
      minHeight: 0,
      '& > [data-kk-hall-band-face]': { position: 'absolute', inset: theme.spacing(1, 0.5) },
      borderRadius: `${kkTokens.radius.base}px`,
      backgroundColor: fills[state],
      boxShadow:
        state === 'lead' ? `inset 0 0 0 ${kkTokens.line.page}px ${palette.warning.main}` : 'none',
      transition: 'background-color 90ms linear',
    };
  };

interface KkHallBandProps {
  count: number | null;
  leading: boolean;
  label: string;
}

export const KkHallBand: FC<KkHallBandProps> = ({ count, leading, label }) => {
  const cells = COUNTS.map((mark) => {
    const state = cellStateOf(mark, count, leading);
    const text = String(mark);

    return (
      <Box key={mark} sx={cellPaint(state)}>
        <Box data-kk-hall-band-face>
          <KkHallNumeral text={text} tone={numeralTones[state]} />
        </Box>
      </Box>
    );
  });

  return (
    <Box
      role="img"
      aria-label={label}
      sx={{
        display: 'grid',
        gridTemplateColumns: COLUMNS,
        gap: { xs: 0.5, desktop: 1 },
        width: '100%',
        height: '100%',
      }}
    >
      {cells}
    </Box>
  );
};
