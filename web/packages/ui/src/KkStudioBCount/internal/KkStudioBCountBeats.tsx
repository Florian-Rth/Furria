import Box from '@mui/material/Box';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { kkTokens } from '../../tokens';

const COUNTS = [1, 2, 3, 4, 5, 6, 7, 8] as const;

type BeatState = 'past' | 'now' | 'ahead';

const ROW = {
  display: 'grid',
  gridTemplateColumns: 'repeat(8, minmax(0, 1fr))',
  gap: 0.5,
  minWidth: 0,
} as const;

const beatPaint =
  (state: BeatState) =>
  (theme: Theme): CSSObject => {
    const palette = (theme.vars ?? theme).palette;
    const fills: Record<BeatState, CSSObject> = {
      past: { backgroundColor: palette.action.selected, color: palette.text.secondary },
      now: { backgroundColor: palette.primary.main, color: palette.primary.contrastText },
      ahead: { backgroundColor: 'transparent', color: palette.text.disabled },
    };

    return {
      display: 'grid',
      placeItems: 'center',
      height: '1.375rem',
      borderRadius: `${kkTokens.radius.bar}px`,
      borderWidth: kkTokens.line.hair,
      borderStyle: 'solid',
      borderColor: palette.divider,
      typography: 'caption',
      fontWeight: 800,
      lineHeight: 1,
      fontVariantNumeric: 'tabular-nums',
      ...fills[state],
    };
  };

const stateOf = (cell: number, count: number | null): BeatState => {
  if (count === null || cell > count) {
    return 'ahead';
  }

  return cell === count ? 'now' : 'past';
};

interface KkStudioBCountBeatsProps {
  count: number | null;
}

export const KkStudioBCountBeats: FC<KkStudioBCountBeatsProps> = ({ count }) => {
  const cells = COUNTS.map((cell) => (
    <Box key={cell} component="span" sx={beatPaint(stateOf(cell, count))}>
      {cell}
    </Box>
  ));

  return (
    <Box aria-hidden sx={ROW}>
      {cells}
    </Box>
  );
};
