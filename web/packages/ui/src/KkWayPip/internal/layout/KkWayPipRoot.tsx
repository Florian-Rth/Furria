import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import type { FC, PropsWithChildren, ReactNode } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { kkTokens } from '../../../tokens';
import type { KkWayPipCorner } from '../logic/pip-corner';
import { isBottom, isRight } from '../logic/pip-corner';
import { usePipDrag } from '../logic/use-pip-drag';

const INSET = '0.5rem';
const SMALL = 'min(62cqw, calc(32cqh * 16 / 9), 24rem)';
const FRONT_ROOM = '2.75rem';
const GAP = '0.75rem';
const LARGE = 'min(100cqw, calc(100cqh * 16 / 9))';
const GLIDE = '320ms cubic-bezier(0.22, 0.61, 0.36, 1)';
const DOCKED = { position: 'relative', width: '100%' } as const;

const restingWidthOf = (stageAspect: number): string => {
  const above = `calc((100cqh - 100cqw * ${stageAspect} - ${FRONT_ROOM} - ${GAP}) * 16 / 9)`;
  const beside = `calc(100cqw - (100cqh - ${FRONT_ROOM}) / ${stageAspect} - ${GAP})`;

  return `min(100cqw, calc(100cqh * 16 / 9), max(${SMALL}, ${above}, ${beside}))`;
};

const placeOf = (corner: KkWayPipCorner, large: boolean, x: number, y: number): string => {
  const inset = large ? '0px' : INSET;
  const left = isRight(corner) ? `max(0px, calc(100cqw - 100% - ${inset}))` : inset;
  const top = isBottom(corner) ? `max(0px, calc(100cqh - 100% - ${inset}))` : inset;

  return `translate3d(calc(${left} + ${x}px), calc(${top} + ${y}px), 0)`;
};

interface KkWayPipRootProps extends PropsWithChildren {
  label: string;
  corner: KkWayPipCorner;
  large: boolean;
  docked: boolean;
  stageAspect: number;
  keys: ReactNode;
  onCorner: (corner: KkWayPipCorner) => void;
  onToggleSize: () => void;
}

export const KkWayPipRoot: FC<KkWayPipRootProps> = ({
  label,
  corner,
  large,
  docked,
  stageAspect,
  keys,
  onCorner,
  onToggleSize,
  children,
}) => {
  const drag = usePipDrag(onCorner, onToggleSize);
  const floating = {
    position: 'absolute',
    transform: placeOf(corner, large, drag.offset.x, drag.offset.y),
    transition: drag.dragging ? 'none' : `transform ${GLIDE}, width ${GLIDE}`,
    width: large ? LARGE : restingWidthOf(stageAspect),
  } as const;
  const place = docked ? DOCKED : floating;
  const surface = docked ? null : (
    <ButtonBase
      aria-label={label}
      aria-pressed={large}
      data-kk-way-pip-surface
      onPointerDown={drag.onPointerDown}
      onPointerMove={drag.onPointerMove}
      onPointerUp={drag.onPointerUp}
      onPointerCancel={drag.onPointerCancel}
      onClick={drag.onClick}
      sx={(theme) => ({
        position: 'absolute',
        inset: 0,
        cursor: drag.dragging ? 'grabbing' : 'grab',
        ...focusRing(theme),
      })}
    />
  );

  return (
    <Box
      ref={drag.ref}
      data-kk-way-pip
      data-large={large}
      style={place}
      sx={(theme) => ({
        left: 0,
        top: 0,
        zIndex: 5,
        aspectRatio: '16 / 9',
        borderRadius: `${kkTokens.radius.base}px`,
        overflow: 'clip',
        backgroundColor: kkTokens.color.dark.darkroom,
        boxShadow: `0 0 0 ${kkTokens.line.hair}px ${(theme.vars ?? theme).palette.divider}, ${kkTokens.shadow.raised}`,
        touchAction: 'none',
        '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
      })}
    >
      {children}
      {surface}
      <Box sx={{ position: 'absolute', top: 0, right: 0, p: 0.25, zIndex: 1 }}>{keys}</Box>
    </Box>
  );
};
