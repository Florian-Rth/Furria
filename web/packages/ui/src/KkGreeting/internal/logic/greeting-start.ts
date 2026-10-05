import { kkTokens } from '../../../tokens';

export type GreetingStart = 'play' | 'still';

export interface GreetingStartCheck {
  waitedMs: number;
  hidden: boolean;
  reducedMotion: boolean;
}

const { hingeMs } = kkTokens.motion.greeting;

export const greetingStartOf = ({
  waitedMs,
  hidden,
  reducedMotion,
}: GreetingStartCheck): GreetingStart =>
  hidden || reducedMotion || waitedMs >= hingeMs ? 'still' : 'play';

const AT_REST = 0;

export const leavesRest = (previousOffset: number, offset: number): boolean =>
  previousOffset <= AT_REST && offset > AT_REST;
