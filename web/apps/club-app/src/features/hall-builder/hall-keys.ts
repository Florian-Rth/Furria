import type { Point } from '@/features/hall-plan/schemas';
import type { HallTool } from './hall-builder-tools';
import { toolForKey } from './hall-builder-tools';

const NUDGE_CM = 1;
const LARGE_NUDGE_CM = 10;

export interface HallKeyPress {
  key: string;
  modKey: boolean;
  shiftKey: boolean;
  inField: boolean;
}

export type HallCommand =
  | { kind: 'undo' }
  | { kind: 'redo' }
  | { kind: 'delete' }
  | { kind: 'duplicate' }
  | { kind: 'nudge'; delta: Point }
  | { kind: 'escape' }
  | { kind: 'finish' }
  | { kind: 'tool'; tool: HallTool };

const ARROWS: Record<string, Point> = {
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
};

const modCommandOf = (press: HallKeyPress): HallCommand | null => {
  const key = press.key.toLowerCase();
  if (key === 'z') {
    return press.shiftKey ? { kind: 'redo' } : { kind: 'undo' };
  }
  if (key === 'y') {
    return { kind: 'redo' };
  }
  if (key === 'd') {
    return { kind: 'duplicate' };
  }

  return null;
};

export const hallCommandOf = (press: HallKeyPress): HallCommand | null => {
  if (press.inField) {
    return press.key === 'Escape' ? { kind: 'escape' } : null;
  }
  if (press.modKey) {
    return modCommandOf(press);
  }
  const arrow = ARROWS[press.key];
  if (arrow !== undefined) {
    const step = press.shiftKey ? LARGE_NUDGE_CM : NUDGE_CM;

    return { kind: 'nudge', delta: { x: arrow.x * step, y: arrow.y * step } };
  }
  switch (press.key) {
    case 'Delete':
    case 'Backspace':
      return { kind: 'delete' };
    case 'Escape':
      return { kind: 'escape' };
    case 'Enter':
      return { kind: 'finish' };
    default: {
      const tool = toolForKey(press.key);

      return tool === null ? null : { kind: 'tool', tool };
    }
  }
};
