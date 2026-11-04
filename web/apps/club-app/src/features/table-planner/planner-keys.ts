import type { Point } from '@/features/hall-plan/schemas';
import type { PlannerTool } from './planner-tools';

export interface PlannerKeyInput {
  key: string;
  mod: boolean;
  shift: boolean;
  inField: boolean;
}

export type PlannerKeyCommand =
  | { kind: 'undo' }
  | { kind: 'redo' }
  | { kind: 'delete' }
  | { kind: 'duplicate' }
  | { kind: 'escape' }
  | { kind: 'selectAll' }
  | { kind: 'group' }
  | { kind: 'ungroup' }
  | { kind: 'nudge'; delta: Point }
  | { kind: 'count'; delta: number }
  | { kind: 'rotate'; degrees: number }
  | { kind: 'tool'; tool: PlannerTool };

const FINE_NUDGE_CM = 1;
const COARSE_NUDGE_CM = 10;
const ROTATE_STEP = 15;

const TOOL_KEYS: Record<string, PlannerTool> = {
  '1': 'select',
  '2': 'table',
  '3': 'row',
  '4': 'measure',
};

const ARROWS: Record<string, Point> = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
};

const modCommandOf = (key: string, shift: boolean): PlannerKeyCommand | null => {
  switch (key.toLowerCase()) {
    case 'z':
      return shift ? { kind: 'redo' } : { kind: 'undo' };
    case 'y':
      return { kind: 'redo' };
    case 'd':
      return { kind: 'duplicate' };
    case 'a':
      return { kind: 'selectAll' };
    case 'g':
      return shift ? { kind: 'ungroup' } : { kind: 'group' };
    default:
      return null;
  }
};

export const plannerKeyCommandOf = ({
  key,
  mod,
  shift,
  inField,
}: PlannerKeyInput): PlannerKeyCommand | null => {
  if (key === 'Escape') {
    return { kind: 'escape' };
  }
  if (inField) {
    return null;
  }
  if (mod) {
    return modCommandOf(key, shift);
  }
  const arrow = ARROWS[key];
  if (arrow !== undefined) {
    const step = shift ? COARSE_NUDGE_CM : FINE_NUDGE_CM;

    return { kind: 'nudge', delta: { x: arrow.x * step, y: arrow.y * step } };
  }
  const tool = TOOL_KEYS[key];
  if (tool !== undefined) {
    return { kind: 'tool', tool };
  }

  switch (key) {
    case 'Delete':
    case 'Backspace':
      return { kind: 'delete' };
    case '+':
      return { kind: 'count', delta: 1 };
    case '-':
      return { kind: 'count', delta: -1 };
    case 'r':
      return { kind: 'rotate', degrees: ROTATE_STEP };
    case 'R':
      return { kind: 'rotate', degrees: -ROTATE_STEP };
    default:
      return null;
  }
};
