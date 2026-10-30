import type { StudioPart, StudioStep } from '@/features/acts/schemas';

const timedOf = (steps: readonly StudioStep[]): StudioStep[] =>
  steps.filter((step) => step.startSeconds !== null);

const firstStepOf = (part: StudioPart): number => part.stepIds[0] ?? -1;

export const partFirstStepAt = (
  steps: readonly StudioStep[],
  parts: readonly StudioPart[],
  partId: number,
  seconds: number,
): number | null => {
  const order = timedOf(steps);
  const placed = parts.filter((part) => !part.adrift && part.stepIds.length > 0);
  const index = placed.findIndex((part) => part.partId === partId);
  const before = placed[index - 1];

  if (index <= 0 || before === undefined) {
    return null;
  }

  const ids = order.map((step) => step.stepId);
  const lower = ids.indexOf(firstStepOf(before));
  const after = placed[index + 1];
  const upper = after === undefined ? ids.length : ids.indexOf(firstStepOf(after));
  const target = order.findLastIndex((step) => (step.startSeconds ?? 0) <= seconds);
  const clamped = Math.min(upper - 1, Math.max(lower + 1, target));

  return clamped > lower && clamped < upper ? (ids[clamped] ?? null) : null;
};

export type DeskKey =
  | 'toggle'
  | 'stepBack'
  | 'stepForward'
  | 'countBack'
  | 'countForward'
  | 'zoomIn'
  | 'zoomOut';

export interface DeskKeyPress {
  key: string;
  shiftKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  altKey: boolean;
  typing: boolean;
  control: boolean;
}

export const deskKeyOf = (press: DeskKeyPress): DeskKey | null => {
  if (press.typing || press.control || press.ctrlKey || press.metaKey || press.altKey) {
    return null;
  }

  switch (press.key) {
    case ' ':
      return 'toggle';
    case 'ArrowLeft':
      return press.shiftKey ? 'countBack' : 'stepBack';
    case 'ArrowRight':
      return press.shiftKey ? 'countForward' : 'stepForward';
    case '+':
    case '=':
      return 'zoomIn';
    case '-':
    case '_':
      return 'zoomOut';
    default:
      return null;
  }
};
