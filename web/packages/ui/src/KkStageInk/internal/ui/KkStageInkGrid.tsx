import Box from '@mui/material/Box';
import type { Theme } from '@mui/material/styles';
import type { FC } from 'react';
import type { KkStageInkGridLine } from '../../stage-ink-density';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkStageInkGridProps {
  lines: readonly KkStageInkGridLine[];
}

export const KkStageInkGrid: FC<KkStageInkGridProps> = ({ lines }) => {
  const drawn = lines.map((line) => {
    const ends =
      line.axis === 'x'
        ? { x1: line.at, x2: line.at, y1: 0, y2: 1 }
        : { x1: 0, x2: 1, y1: line.at, y2: line.at };

    return (
      <line
        key={line.key}
        data-kk-stage-grid={line.kind}
        vectorEffect="non-scaling-stroke"
        {...ends}
      />
    );
  });

  return (
    <Box
      component="svg"
      aria-hidden
      viewBox="0 0 1 1"
      preserveAspectRatio="none"
      sx={(theme) => ({
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        stroke: palette(theme).divider,
        strokeWidth: 1,
        '& [data-kk-stage-grid="quarter"]': { strokeDasharray: '1 3', opacity: 0.7 },
        '& [data-kk-stage-grid="snap"]': {
          stroke: palette(theme).primary.main,
          strokeWidth: 1.5,
        },
      })}
    >
      {drawn}
    </Box>
  );
};
