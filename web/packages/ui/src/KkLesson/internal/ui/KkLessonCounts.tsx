import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { inkWash } from '../../../internal/ink-wash';
import { kkTokens } from '../../../tokens';

const DOWNBEAT = 1;
const HALF_BEAT = 5;
const PERCENT = 100;

type CellAccent = 'downbeat' | 'half' | 'plain';

const CELL_HEIGHTS: Record<CellAccent, string> = {
  downbeat: '1.25rem',
  half: '0.875rem',
  plain: '0.5rem',
};

const accentOf = (count: number): CellAccent => {
  if (count === DOWNBEAT) {
    return 'downbeat';
  }

  return count === HALF_BEAT ? 'half' : 'plain';
};

type CellState = 'past' | 'lit' | 'ahead';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

const cellInk = (theme: Theme, state: CellState): string => {
  if (state === 'lit') {
    return palette(theme).primary.main;
  }

  return state === 'past'
    ? `color-mix(in srgb, ${palette(theme).text.primary} 55%, transparent)`
    : palette(theme).divider;
};

const cellPaint =
  (state: CellState, accent: CellAccent) =>
  (theme: Theme): CSSObject => ({
    flex: '0 0 auto',
    width: '0.25rem',
    height: CELL_HEIGHTS[accent],
    borderRadius: `${kkTokens.radius.pill}px`,
    backgroundColor: cellInk(theme, state),
    transform: state === 'lit' ? 'scaleY(1.25)' : 'none',
    transition: 'transform 120ms ease-out, background-color 120ms ease-out',
  });

const stateOf = (index: number, lit: number): CellState => {
  if (index === lit) {
    return 'lit';
  }

  return index < lit ? 'past' : 'ahead';
};

interface KkLessonCountsProps {
  groups: readonly (readonly number[])[];
  lit: number;
  progress: number;
  label: string;
}

export const KkLessonCounts: FC<KkLessonCountsProps> = ({ groups, lit, progress, label }) => {
  let offset = 0;
  const eights = groups.map((group, groupIndex) => {
    const start = offset;
    offset += group.length;
    const cells = group.map((count, cellIndex) => (
      <Box
        key={`${count}-${start + cellIndex}`}
        sx={cellPaint(stateOf(start + cellIndex, lit), accentOf(count))}
      />
    ));

    return (
      <Stack
        key={`${groupIndex}-${start}`}
        direction="row"
        data-kk-lesson-eight
        sx={(theme) => ({
          flex: `${group.length} 1 0`,
          minWidth: 0,
          height: '100%',
          alignItems: 'center',
          justifyContent: 'space-around',
          px: 0.5,
          borderRadius: `${kkTokens.radius.bar * 2}px`,
          backgroundColor: inkWash(theme, '5%'),
        })}
      >
        {cells}
      </Stack>
    );
  });
  const track =
    groups.length > 0 ? null : (
      <Box
        sx={(theme) => ({
          position: 'relative',
          flex: 1,
          height: '0.375rem',
          borderRadius: `${kkTokens.radius.pill}px`,
          backgroundColor: palette(theme).divider,
        })}
      >
        <Box
          style={{ width: `${progress * PERCENT}%` }}
          sx={(theme) => ({
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            borderRadius: 'inherit',
            backgroundColor: palette(theme).primary.main,
          })}
        />
      </Box>
    );

  return (
    <Stack
      direction="row"
      role="img"
      aria-label={label}
      data-kk-lesson-counts
      sx={{ flex: 1, minWidth: 0, height: '2rem', alignItems: 'center', gap: 0.5 }}
    >
      {eights}
      {track}
    </Stack>
  );
};
