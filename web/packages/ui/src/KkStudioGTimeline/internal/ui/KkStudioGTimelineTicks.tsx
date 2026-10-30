import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import type { Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { kkTokens } from '../../../tokens';
import { placeOf, pointOf } from '../logic/studio-g-lane-kinds';

export interface KkStudioGTick {
  seconds: number;
  label: string;
  selected: boolean;
}

export interface KkStudioGTickBar {
  start: number;
  end: number;
}

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkStudioGTimelineTicksProps {
  ticks: readonly KkStudioGTick[];
  bars: readonly KkStudioGTickBar[];
  onSelect: (seconds: number) => void;
}

export const KkStudioGTimelineTicks: FC<KkStudioGTimelineTicksProps> = ({
  ticks,
  bars,
  onSelect,
}) => {
  const lines = bars.map((bar) => (
    <Box
      key={bar.start}
      aria-hidden
      style={placeOf(bar.start, bar.end)}
      sx={(theme) => ({
        position: 'absolute',
        top: '50%',
        height: kkTokens.line.page,
        transform: 'translateY(-50%)',
        borderRadius: `${kkTokens.radius.pill}px`,
        backgroundColor: palette(theme).text.secondary,
        opacity: 0.55,
      })}
    />
  ));
  const marks = ticks.map((tick) => {
    const select = (): void => {
      onSelect(tick.seconds);
    };

    return (
      <ButtonBase
        key={tick.seconds}
        aria-label={tick.label}
        aria-pressed={tick.selected}
        onClick={select}
        data-kk-studio-g-tick
        data-selected={tick.selected}
        style={pointOf(tick.seconds)}
        sx={(theme) => ({
          position: 'absolute',
          top: 0,
          bottom: 0,
          width: '1.25rem',
          transform: 'translateX(-50%)',
          zIndex: tick.selected ? 2 : 1,
          ...focusRing(theme),
          '&::after': {
            content: '""',
            width: tick.selected ? '0.75rem' : '0.5rem',
            height: tick.selected ? '0.75rem' : '0.5rem',
            transform: 'rotate(45deg)',
            borderRadius: '2px',
            backgroundColor: tick.selected
              ? palette(theme).text.primary
              : palette(theme).background.paper,
            boxShadow: `inset 0 0 0 ${kkTokens.line.section}px ${palette(theme).text.primary}`,
            outline: tick.selected
              ? `${kkTokens.line.section}px solid ${palette(theme).text.primary}`
              : 'none',
            outlineOffset: kkTokens.line.section,
          },
        })}
      />
    );
  });

  return (
    <>
      {lines}
      {marks}
    </>
  );
};
