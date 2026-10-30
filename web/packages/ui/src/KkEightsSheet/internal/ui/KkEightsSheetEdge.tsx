import Box from '@mui/material/Box';
import type { Theme } from '@mui/material/styles';
import type { FC, KeyboardEvent, MouseEvent, PointerEvent } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { kkTokens } from '../../../tokens';
import { SHEET_COUNT, startEdgeDrag } from '../logic/sheet-metrics';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

export interface KkEightsSheetEdgeHandle {
  label: string;
  value: string;
  active: boolean;
  onMove: (seconds: number) => void;
  onEnd: () => void;
  onNudge: (direction: -1 | 1) => void;
}

const NUDGES: Record<string, -1 | 1> = { ArrowLeft: -1, ArrowRight: 1 };

export const KkEightsSheetEdge: FC<KkEightsSheetEdgeHandle> = ({
  label,
  value,
  active,
  onMove,
  onEnd,
  onNudge,
}) => {
  const press = (event: PointerEvent<HTMLElement>): void => {
    event.preventDefault();
    event.stopPropagation();
    startEdgeDrag(SHEET_COUNT, onMove, onEnd);
  };
  const key = (event: KeyboardEvent<HTMLElement>): void => {
    const direction = NUDGES[event.key];
    if (direction === undefined) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    onNudge(direction);
  };
  const stop = (event: MouseEvent<HTMLElement>): void => {
    event.stopPropagation();
  };

  return (
    <Box
      role="button"
      tabIndex={0}
      aria-label={`${label}, ${value}`}
      aria-keyshortcuts="ArrowLeft ArrowRight"
      data-kk-eights-edge
      data-active={active}
      onPointerDown={press}
      onClick={stop}
      onKeyDown={key}
      sx={(theme) => ({
        position: 'absolute',
        zIndex: 2,
        top: 0,
        bottom: 0,
        left: '-0.75rem',
        width: '1.5rem',
        cursor: 'ew-resize',
        touchAction: 'none',
        borderRadius: `${kkTokens.radius.bar}px`,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '0.125rem',
          bottom: '0.125rem',
          left: '50%',
          width: kkTokens.line.page,
          transform: 'translateX(-50%)',
          borderRadius: `${kkTokens.radius.bar}px`,
          backgroundColor: palette(theme).text.primary,
          transition: 'background-color 120ms ease-out, width 120ms ease-out',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '0.5rem',
          height: '0.875rem',
          transform: 'translate(-50%, -50%)',
          borderRadius: `${kkTokens.radius.bar}px`,
          backgroundColor: palette(theme).text.primary,
        },
        '&:hover::before, &:hover::after, &[data-active="true"]::before, &[data-active="true"]::after':
          { backgroundColor: palette(theme).primary.main },
        '&[data-active="true"]': { pointerEvents: 'none' },
        ...focusRing(theme),
      })}
    />
  );
};
