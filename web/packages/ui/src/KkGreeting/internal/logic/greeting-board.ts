import type { FlapCue, FlapSchedule } from './flap-schedule';

export interface GreetingBoard {
  schedule: FlapSchedule;
  faces: readonly string[];
}

export const sameFaces = (left: readonly string[], right: readonly string[]): boolean =>
  left.length === right.length && left.every((face, index) => face === right[index]);

const sameCue = (left: FlapCue | null, right: FlapCue | null): boolean =>
  left === right ||
  (left !== null && right !== null && left.at === right.at && left.duration === right.duration);

export const sameBoard = (current: GreetingBoard | null, next: GreetingBoard): boolean =>
  current !== null &&
  sameFaces(current.faces, next.faces) &&
  current.schedule.duration === next.schedule.duration &&
  current.schedule.burstAt === next.schedule.burstAt &&
  sameCue(current.schedule.line, next.schedule.line);
