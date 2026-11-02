import Box from '@mui/material/Box';
import type { FC, MouseEvent, PropsWithChildren } from 'react';
import { percentOf } from '../../../internal/score-paint';

const ZOOM_EASE = 'cubic-bezier(0.22, 0.61, 0.36, 1)';

interface KkTimelineSeekCanvasProps extends PropsWithChildren {
  start: number;
  end: number;
  onSeek: (share: number) => void;
}

export const KkTimelineSeekCanvas: FC<KkTimelineSeekCanvasProps> = ({
  start,
  end,
  onSeek,
  children,
}) => {
  const span = Math.max(end - start, Number.EPSILON);
  const canvas = { left: percentOf(-start / span), width: percentOf(1 / span) };
  const seek = (event: MouseEvent<HTMLDivElement>): void => {
    const box = event.currentTarget.getBoundingClientRect();
    if (box.width > 0) {
      onSeek(Math.min(1, Math.max(0, (event.clientX - box.left) / box.width)));
    }
  };

  return (
    <Box
      data-kk-timeline-canvas
      onClick={seek}
      style={canvas}
      sx={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        cursor: 'text',
        transition: `left 360ms ${ZOOM_EASE}, width 360ms ${ZOOM_EASE}`,
        '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
      }}
    >
      {children}
    </Box>
  );
};
