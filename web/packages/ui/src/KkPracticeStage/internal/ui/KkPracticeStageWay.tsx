import Box from '@mui/material/Box';
import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';
import type { KkPracticeStageGhostPoint } from './KkPracticeStageGhost';

export interface KkPracticeStageWayMark {
  x: number;
  y: number;
  count: number;
}

const VIEW_WIDTH = 100;
const PERCENT = 100;
const DASH = '1.5 5';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkPracticeStageWayProps {
  points: readonly KkPracticeStageGhostPoint[];
  marks: readonly KkPracticeStageWayMark[];
  aspect: number;
}

export const KkPracticeStageWay: FC<KkPracticeStageWayProps> = ({ points, marks, aspect }) => {
  const viewHeight = VIEW_WIDTH * aspect;
  const line = points.map((point) => `${point.x * VIEW_WIDTH},${point.y * viewHeight}`).join(' ');
  const tags = marks.map((mark) => (
    <Typography
      key={`${mark.count}-${mark.x}-${mark.y}`}
      component="span"
      variant="caption"
      style={{
        transform: `translate3d(calc(${mark.x * PERCENT}cqw - 50%), calc(${mark.y * PERCENT}cqh - 50%), 0)`,
      }}
      sx={(theme) => ({
        position: 'absolute',
        left: 0,
        top: 0,
        width: '1.25rem',
        height: '1.25rem',
        display: 'grid',
        placeItems: 'center',
        borderRadius: '50%',
        fontWeight: 800,
        lineHeight: 1,
        fontVariantNumeric: 'tabular-nums',
        color: palette(theme).primary.main,
        backgroundColor: palette(theme).background.paper,
        boxShadow: `inset 0 0 0 ${kkTokens.line.hair}px ${palette(theme).primary.main}`,
        '@container (max-width: 12rem)': { display: 'none' },
      })}
    >
      {mark.count}
    </Typography>
  ));

  return (
    <Box
      aria-hidden
      data-kk-practice-way
      sx={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
    >
      <Box
        component="svg"
        viewBox={`0 0 ${VIEW_WIDTH} ${viewHeight}`}
        preserveAspectRatio="none"
        sx={(theme) => ({
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          overflow: 'visible',
          fill: 'none',
          stroke: palette(theme).primary.main,
          strokeWidth: 2.5,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          strokeDasharray: DASH,
        })}
      >
        <polyline points={line} vectorEffect="non-scaling-stroke" />
      </Box>
      {tags}
    </Box>
  );
};
