import type { KkStepState } from '@furria/ui/step-state';
import type { CheckMark, DotKind } from './season-c-rows';

export const ROW_HEIGHT = '3.25rem';
export const HEAD_HEIGHT = '8rem';
export const LEFT_WIDTH = { xs: '66%', md: '21rem', lg: '25rem' };
export const EVENING_WIDTH = { xs: '100%', md: '5.75rem', lg: '7.5rem' };
export const PHONE_ONLY = { xs: 'block', md: 'none' };
export const CHECK_WIDTH = '1.5rem';
export const CHECKS_SHOWN = { xs: 'none', md: 'flex' };
export const SNAP = { xs: 'x mandatory', md: 'x proximity' };

export const DOT_STATES: Record<DotKind, KkStepState> = {
  placed: 'done',
  tray: 'open',
  adjusted: 'overdue',
  none: 'off',
};

export const CHECK_STATES: Record<CheckMark, KkStepState> = {
  done: 'done',
  open: 'open',
  none: 'off',
};
