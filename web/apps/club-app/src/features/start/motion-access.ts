export type MotionAccess = 'unavailable' | 'needsGesture' | 'granted' | 'denied';

export interface MotionSupport {
  readonly available: boolean;
  readonly gated: boolean;
}

const GRANTED_ANSWER = 'granted';

export const motionAccessOf = ({ available, gated }: MotionSupport): MotionAccess => {
  if (!available) {
    return 'unavailable';
  }

  return gated ? 'needsGesture' : 'granted';
};

export const asksForMotion = (access: MotionAccess): boolean =>
  access === 'needsGesture' || access === 'denied';

export const accessAfterAnswer = (answer: string): MotionAccess =>
  answer === GRANTED_ANSWER ? 'granted' : 'denied';
