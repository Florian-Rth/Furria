import Box from '@mui/material/Box';
import type { Theme } from '@mui/material/styles';
import type { MotionValue } from 'motion/react';
import { motion, useTransform } from 'motion/react';
import type { FC, KeyboardEvent } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { kkTokens } from '../../../tokens';
import { KkTimelineBracketEdge } from './KkTimelineBracketEdge';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;
const PERCENT = 100;

export type KkTimelineBracketKey = 'earlier' | 'later' | 'closer' | 'wider';

export type KkTimelineBracketGrip = 'start' | 'end' | 'body' | 'track';

const KEYS: Readonly<Record<string, KkTimelineBracketKey>> = {
  ArrowLeft: 'earlier',
  ArrowRight: 'later',
  ArrowUp: 'closer',
  ArrowDown: 'wider',
};

const percentOfShare = (share: number): string => `${share * PERCENT}%`;
const spanPercentOf = ([from, to]: number[]): string =>
  `${Math.max(0, (to ?? 0) - (from ?? 0)) * PERCENT}%`;

interface KkTimelineBracketProps {
  from: MotionValue<number>;
  to: MotionValue<number>;
  grip: KkTimelineBracketGrip | null;
  label: string;
  valueText: string;
  valueNow: number;
  onKey: (key: KkTimelineBracketKey) => void;
}

export const KkTimelineBracket: FC<KkTimelineBracketProps> = ({
  from,
  to,
  grip,
  label,
  valueText,
  valueNow,
  onKey,
}) => {
  const left = useTransform(from, percentOfShare);
  const width = useTransform([from, to], spanPercentOf);
  const held = grip !== null && grip !== 'track';
  const startHeld = grip === 'start';
  const endHeld = grip === 'end';
  const percentNow = Math.round(valueNow * PERCENT);
  const press = (event: KeyboardEvent<HTMLElement>): void => {
    const key = KEYS[event.key];
    if (key !== undefined) {
      event.preventDefault();
      event.stopPropagation();
      onKey(key);
    }
  };

  return (
    <Box
      component={motion.div}
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-valuetext={valueText}
      aria-valuemin={0}
      aria-valuemax={PERCENT}
      aria-valuenow={percentNow}
      onKeyDown={press}
      data-kk-timeline-bracket
      data-held={held}
      style={{ left, width }}
      sx={(theme) => ({
        position: 'absolute',
        top: 0,
        bottom: 0,
        minWidth: '0.5rem',
        borderRadius: `${kkTokens.radius.bar * 2}px`,
        backgroundColor: `color-mix(in srgb, ${palette(theme).primary.main} 10%, transparent)`,
        boxShadow: `inset 0 0 0 ${kkTokens.line.section}px ${palette(theme).text.primary}`,
        willChange: 'left, width',
        zIndex: 2,
        '&[data-held="true"]': {
          backgroundColor: `color-mix(in srgb, ${palette(theme).primary.main} 18%, transparent)`,
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          left: '50%',
          top: 0,
          bottom: 0,
          width: kkTokens.line.section,
          transform: 'translateX(-50%)',
          backgroundColor: palette(theme).primary.main,
        },
        ...focusRing(theme),
      })}
    >
      <KkTimelineBracketEdge side="start" active={startHeld} />
      <KkTimelineBracketEdge side="end" active={endHeld} />
    </Box>
  );
};
