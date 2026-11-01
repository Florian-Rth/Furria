export type MotionAccess = 'unavailable' | 'needsGesture' | 'granted' | 'denied';

export type MotionAsk = 'quiet' | 'gesture' | 'deliberate';

export interface MotionSupport {
  readonly available: boolean;
  readonly gated: boolean;
  readonly refused: boolean;
}

const GRANTED_ANSWER = 'granted';

export const motionAccessOf = ({ available, gated, refused }: MotionSupport): MotionAccess => {
  if (!available) {
    return 'unavailable';
  }
  if (!gated) {
    return 'granted';
  }

  return refused ? 'denied' : 'needsGesture';
};

export const asksForMotion = (access: MotionAccess, ask: MotionAsk): boolean => {
  if (access === 'needsGesture') {
    return true;
  }

  return access === 'denied' && ask === 'deliberate';
};

export const accessAfterAnswer = (answer: string): MotionAccess =>
  answer === GRANTED_ANSWER ? 'granted' : 'denied';
