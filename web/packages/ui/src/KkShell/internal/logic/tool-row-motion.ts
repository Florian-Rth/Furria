import type { TargetAndTransition, Transition } from 'motion/react';
import { kkTokens } from '../../../tokens';

const { toolRowHeight, chromeGap, toolRow } = kkTokens.shell;

export const TOOL_ROW_SWEEP: Transition = {
  duration: toolRow.sweepSeconds,
  ease: [0.22, 0.61, 0.36, 1],
};

export const TOOL_ROW_TUCKED: TargetAndTransition = {
  height: 0,
  paddingTop: 0,
  opacity: 0,
};

export const TOOL_ROW_OUT: TargetAndTransition = {
  height: toolRowHeight + chromeGap,
  paddingTop: chromeGap,
  opacity: 1,
};
