import Box from '@mui/material/Box';
import type { FC, PointerEvent, PropsWithChildren, ReactNode } from 'react';
import type { KkSx } from '../../../kk-sx';

interface KkStudioAStripRootProps extends PropsWithChildren {
  label: string;
  band: ReactNode;
  head: ReactNode;
  onSeek: (fraction: number) => void;
  sx?: KkSx;
}

const fractionAt = (event: PointerEvent<HTMLDivElement>): number => {
  const box = event.currentTarget.getBoundingClientRect();

  return box.width <= 0 ? 0 : Math.min(1, Math.max(0, (event.clientX - box.left) / box.width));
};

export const KkStudioAStripRoot: FC<KkStudioAStripRootProps> = ({
  label,
  band,
  head,
  onSeek,
  sx,
  children,
}) => {
  const seekFrom = (event: PointerEvent<HTMLDivElement>): void => {
    onSeek(fractionAt(event));
  };
  const startScrub = (event: PointerEvent<HTMLDivElement>): void => {
    event.currentTarget.setPointerCapture(event.pointerId);
    seekFrom(event);
  };
  const scrub = (event: PointerEvent<HTMLDivElement>): void => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      seekFrom(event);
    }
  };

  return (
    <Box
      data-kk-studio-a-strip
      sx={[
        { position: 'relative', containerType: 'inline-size', userSelect: 'none' },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Box sx={{ position: 'relative', height: '1.25rem' }}>{band}</Box>
      <Box
        role="slider"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        tabIndex={-1}
        onPointerDown={startScrub}
        onPointerMove={scrub}
        sx={{
          position: 'relative',
          height: '2.125rem',
          mt: 0.5,
          touchAction: 'none',
          cursor: 'pointer',
        }}
      >
        {children}
      </Box>
      {head}
    </Box>
  );
};
