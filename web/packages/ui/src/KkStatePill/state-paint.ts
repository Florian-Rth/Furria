import type { CSSObject, Theme } from '@mui/material/styles';
import { goldInkOf } from '../internal/gold-ink';
import { redInk } from '../internal/red-ink';
import { tonePaint } from '../internal/tone';
import { kkTokens } from '../tokens';
import type { KkStepState } from './step-state';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

export const STICKY_HEAD_TOP =
  kkTokens.shell.gutter * 2 + kkTokens.shell.barHeight + kkTokens.shell.chromeGap;

export const stepLabel: CSSObject = {
  typography: 'caption',
  fontWeight: 800,
  letterSpacing: kkTokens.type.tracking.label,
  textTransform: 'uppercase',
  color: 'text.secondary',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  minWidth: 0,
};

export const stepFigures: CSSObject = {
  fontVariantNumeric: 'tabular-nums lining-nums',
};

export const stepStateInk = (theme: Theme, state: KkStepState): CSSObject => {
  switch (state) {
    case 'current':
      return redInk(theme);
    case 'overdue':
      return goldInkOf(theme);
    case 'done':
      return { color: 'text.primary' };
    case 'open':
      return { color: 'text.secondary' };
    case 'waiting':
    case 'off':
      return { color: 'text.disabled' };
  }
};

export const statePillGround = (theme: Theme, state: KkStepState): CSSObject => {
  switch (state) {
    case 'current':
      return tonePaint(theme, 'accent');
    case 'overdue':
      return tonePaint(theme, 'gold');
    case 'done':
    case 'open':
    case 'waiting':
    case 'off':
      return { ...stepStateInk(theme, state), backgroundColor: 'transparent' };
  }
};

export const stateMark = (theme: Theme, state: KkStepState): CSSObject => {
  const hair = kkTokens.line.hair;

  switch (state) {
    case 'done':
      return { backgroundColor: palette(theme).text.primary, borderRadius: '50%' };
    case 'current':
      return { backgroundColor: palette(theme).primary.main, borderRadius: '50%' };
    case 'overdue':
      return { backgroundColor: palette(theme).warning.main, borderRadius: '2px', rotate: '45deg' };
    case 'open':
      return { border: `${hair}px solid ${palette(theme).text.secondary}`, borderRadius: '50%' };
    case 'waiting':
      return { border: `${hair}px dashed ${palette(theme).text.disabled}`, borderRadius: '50%' };
    case 'off':
      return {
        height: `${hair}px`,
        alignSelf: 'center',
        backgroundColor: palette(theme).text.disabled,
      };
  }
};

export const progressSegment = (theme: Theme, state: KkStepState): CSSObject => {
  switch (state) {
    case 'done':
      return { backgroundColor: palette(theme).text.primary };
    case 'current':
      return { backgroundColor: palette(theme).primary.main };
    case 'overdue':
      return { backgroundColor: palette(theme).warning.main };
    case 'open':
      return { backgroundColor: palette(theme).divider };
    case 'waiting':
    case 'off':
      return {
        backgroundImage: `repeating-linear-gradient(-45deg, ${palette(theme).divider} 0 2px, transparent 2px 5px)`,
      };
  }
};
