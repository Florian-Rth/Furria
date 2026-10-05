import type { FlapCue, FlapSchedule } from './flap-schedule';

export const sameFaces = (left: readonly string[], right: readonly string[]): boolean =>
  left.length === right.length && left.every((face, index) => face === right[index]);

const sameCue = (left: FlapCue | null, right: FlapCue | null): boolean =>
  left === right ||
  (left !== null && right !== null && left.at === right.at && left.duration === right.duration);

export const sameSchedule = (current: FlapSchedule | null, next: FlapSchedule): boolean =>
  current !== null &&
  current.duration === next.duration &&
  current.burstAt === next.burstAt &&
  sameCue(current.line, next.line);
