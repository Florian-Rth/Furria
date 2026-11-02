import Box from '@mui/material/Box';
import type { FC, HTMLAttributes, PropsWithChildren, ReactNode } from 'react';
import type { KkSx } from '../../../kk-sx';
import { kkTokens } from '../../../tokens';
import { touchLabPalette } from '../../touch-lab-paint';

export type KkTouchLabSize = 'track' | 'lane' | 'rail' | 'stage';

export type KkTouchLabHandlers = Pick<
  HTMLAttributes<HTMLDivElement>,
  'onPointerDown' | 'onPointerMove' | 'onPointerUp' | 'onPointerCancel' | 'onLostPointerCapture'
>;

const HEIGHTS: Record<KkTouchLabSize, string> = {
  track: '8.5rem',
  lane: '3.5rem',
  rail: '4.75rem',
  stage: '100%',
};

interface KkTouchLabRootProps extends PropsWithChildren {
  label: string;
  size: KkTouchLabSize;
  areaRef: (node: HTMLDivElement | null) => void;
  handlers: KkTouchLabHandlers;
  overlay?: ReactNode;
  sx?: KkSx;
}

export const KkTouchLabRoot: FC<KkTouchLabRootProps> = ({
  label,
  size,
  areaRef,
  handlers,
  overlay,
  sx,
  children,
}) => (
  <Box
    ref={areaRef}
    role="application"
    aria-label={label}
    data-kk-touch-lab={size}
    {...handlers}
    sx={[
      {
        position: 'relative',
        zIndex: 1,
        width: '100%',
        height: HEIGHTS[size],
        minHeight: size === 'stage' ? '14rem' : undefined,
        flex: size === 'stage' ? '1 1 auto' : '0 0 auto',
        cursor: 'crosshair',
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    <Box
      sx={(theme) => ({
        position: 'absolute',
        inset: 0,
        borderRadius: `${kkTokens.radius.base}px`,
        clipPath: `inset(0 round ${kkTokens.radius.base}px)`,
        backgroundColor: touchLabPalette(theme).background.paper,
        boxShadow: `inset 0 0 0 ${kkTokens.line.hair}px ${touchLabPalette(theme).divider}`,
      })}
    >
      {children}
    </Box>
    {overlay}
  </Box>
);
