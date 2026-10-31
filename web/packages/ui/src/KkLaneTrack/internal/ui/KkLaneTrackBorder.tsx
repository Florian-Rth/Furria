import Box from '@mui/material/Box';
import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC, KeyboardEvent } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import type { KkStudioShare } from '../../../KkStudioDrag/use-studio-drag';
import { useStudioDrag } from '../../../KkStudioDrag/use-studio-drag';
import { kkTokens } from '../../../tokens';
import { percentOf } from '../lane-geometry';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkLaneTrackBorderProps {
  share: number;
  label: string;
  value: string;
  active: boolean;
  hint: string;
  onMove: (share: number) => void;
  onEnd: () => void;
  onNudge: (direction: -1 | 1) => void;
}

export const KkLaneTrackBorder: FC<KkLaneTrackBorderProps> = ({
  share,
  label,
  value,
  active,
  hint,
  onMove,
  onEnd,
  onNudge,
}) => {
  const move = (point: KkStudioShare): void => {
    onMove(point.x);
  };
  const drag = useStudioDrag({ onMove: move, onEnd });
  const press = (event: KeyboardEvent<HTMLElement>): void => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      event.stopPropagation();
      onNudge(event.key === 'ArrowLeft' ? -1 : 1);
    }
  };
  const bubble = active ? (
    <Typography
      component="span"
      variant="caption"
      role="status"
      sx={(theme) => ({
        position: 'absolute',
        bottom: '100%',
        left: '50%',
        transform: 'translate(-50%, -0.25rem)',
        px: 0.75,
        py: 0.25,
        whiteSpace: 'nowrap',
        fontWeight: 900,
        fontVariantNumeric: 'tabular-nums',
        lineHeight: 1.2,
        borderRadius: `${kkTokens.radius.bar}px`,
        color: palette(theme).primary.contrastText,
        backgroundColor: palette(theme).primary.main,
        pointerEvents: 'none',
      })}
    >
      {hint}
    </Typography>
  ) : null;

  return (
    <Box
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-valuetext={value}
      aria-valuenow={Math.round(share * 1000) / 10}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-orientation="horizontal"
      data-kk-lane-border
      data-active={active}
      onKeyDown={press}
      {...drag}
      style={{ left: percentOf(share) }}
      sx={(theme) => ({
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: '1.375rem',
        transform: 'translateX(-50%)',
        zIndex: 2,
        cursor: 'ew-resize',
        touchAction: 'none',
        '&::after': {
          content: '""',
          position: 'absolute',
          left: '50%',
          top: '0.125rem',
          bottom: '0.125rem',
          width: '0.25rem',
          transform: 'translateX(-50%)',
          borderRadius: `${kkTokens.radius.bar}px`,
          backgroundColor: palette(theme).text.primary,
          opacity: 0,
          transition: 'opacity 120ms ease-out',
        },
        '&:hover::after, &[data-active="true"]::after, &:focus-visible::after': {
          opacity: 1,
        },
        '&[data-active="true"]::after': { backgroundColor: palette(theme).primary.main },
        ...focusRing(theme),
      })}
    >
      {bubble}
    </Box>
  );
};
