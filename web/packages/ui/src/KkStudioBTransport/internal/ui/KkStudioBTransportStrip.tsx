import Box from '@mui/material/Box';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC, KeyboardEvent, MouseEvent } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { kkTokens } from '../../../tokens';

export interface KkStudioBStripBand {
  key: string;
  name: string;
  start: number;
  end: number;
  current: boolean;
}

export interface KkStudioBStripRange {
  start: number;
  end: number;
}

const PERCENT = 100;
const GAP = '0.125rem';

const stripPaint = (theme: Theme): CSSObject => ({
  position: 'relative',
  flex: 1,
  minWidth: 0,
  height: '1.75rem',
  cursor: 'pointer',
  borderRadius: `${kkTokens.radius.bar}px`,
  touchAction: 'manipulation',
  ...focusRing(theme),
});

const bandPaint =
  (current: boolean) =>
  (theme: Theme): CSSObject => {
    const palette = (theme.vars ?? theme).palette;

    return {
      position: 'absolute',
      top: 0,
      bottom: 0,
      display: 'flex',
      alignItems: 'center',
      px: 0.75,
      minWidth: 0,
      borderRadius: `${kkTokens.radius.bar}px`,
      backgroundColor: current ? palette.action.selected : palette.action.hover,
      color: current ? palette.text.primary : palette.text.secondary,
      typography: 'caption',
      fontWeight: 800,
      letterSpacing: kkTokens.type.tracking.label,
      textTransform: 'uppercase',
      lineHeight: 1,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      transition: 'background-color 240ms ease-out, color 240ms ease-out',
    };
  };

const TICK = {
  position: 'absolute',
  bottom: 0,
  height: '35%',
  width: kkTokens.line.hair,
  bgcolor: 'text.disabled',
} as const;

const loopPaint = (theme: Theme): CSSObject => ({
  position: 'absolute',
  top: `-${GAP}`,
  bottom: `-${GAP}`,
  borderRadius: `${kkTokens.radius.bar}px`,
  borderWidth: kkTokens.line.section,
  borderStyle: 'solid',
  borderColor: (theme.vars ?? theme).palette.primary.main,
  pointerEvents: 'none',
});

const LANE = {
  position: 'absolute',
  inset: 0,
  pointerEvents: 'none',
  willChange: 'transform',
} as const;

const HEAD = {
  position: 'absolute',
  left: 0,
  top: '-0.25rem',
  bottom: '-0.25rem',
  width: kkTokens.line.section,
  transform: 'translateX(-50%)',
  borderRadius: `${kkTokens.radius.bar}px`,
  bgcolor: 'primary.main',
} as const;

const spanStyle = (start: number, end: number): { left: string; width: string } => ({
  left: `calc(${start * PERCENT}% + ${GAP})`,
  width: `calc(${(end - start) * PERCENT}% - ${GAP} * 2)`,
});

const shareOf = (event: MouseEvent<HTMLDivElement>): number => {
  const box = event.currentTarget.getBoundingClientRect();

  return box.width <= 0 ? 0 : Math.min(1, Math.max(0, (event.clientX - box.left) / box.width));
};

const NUDGES: Record<string, -1 | 1> = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1 };

interface KkStudioBTransportStripProps {
  bands: readonly KkStudioBStripBand[];
  ticks: readonly number[];
  loop: KkStudioBStripRange | null;
  position: number;
  label: string;
  valueText: string;
  onSeek: (share: number) => void;
  onNudge: (direction: -1 | 1) => void;
}

export const KkStudioBTransportStrip: FC<KkStudioBTransportStripProps> = ({
  bands,
  ticks,
  loop,
  position,
  label,
  valueText,
  onSeek,
  onNudge,
}) => {
  const seek = (event: MouseEvent<HTMLDivElement>): void => {
    onSeek(shareOf(event));
  };
  const nudge = (event: KeyboardEvent<HTMLDivElement>): void => {
    const direction = NUDGES[event.key];

    if (direction !== undefined) {
      event.preventDefault();
      onNudge(direction);
    }
  };
  const bandMarks = bands.map((band) => (
    <Box
      key={band.key}
      component="span"
      style={spanStyle(band.start, band.end)}
      sx={bandPaint(band.current)}
    >
      {band.name}
    </Box>
  ));
  const tickMarks = ticks.map((tick) => (
    <Box key={tick} component="span" style={{ left: `${tick * PERCENT}%` }} sx={TICK} />
  ));
  const loopMark =
    loop === null ? null : (
      <Box component="span" style={spanStyle(loop.start, loop.end)} sx={loopPaint} />
    );
  const lane = { transform: `translateX(${position * PERCENT}%)` };

  return (
    <Box
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={PERCENT}
      aria-valuenow={Math.round(position * PERCENT)}
      aria-valuetext={valueText}
      onClick={seek}
      onKeyDown={nudge}
      data-kk-studio-b-strip
      sx={stripPaint}
    >
      {bandMarks}
      {tickMarks}
      {loopMark}
      <Box component="span" aria-hidden style={lane} sx={LANE}>
        <Box component="span" sx={HEAD} />
      </Box>
    </Box>
  );
};
