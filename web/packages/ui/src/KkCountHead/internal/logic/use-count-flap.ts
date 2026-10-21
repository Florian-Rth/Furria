import type { MotionValue } from 'motion/react';
import { useTransform } from 'motion/react';
import type { FlapLeafMotion } from '../../../internal/flap/use-flap-leaf';
import { useFlapLeaf } from '../../../internal/flap/use-flap-leaf';
import type { CountFaceVisibility, CountFrame, CountRun } from './count-run';
import { countFrameAt, letterFaceOf, letterVisibilityOf, starVisibilityOf } from './count-run';

export interface CountFlap {
  leaf: FlapLeafMotion;
  fromFace: MotionValue<string>;
  toFace: MotionValue<string>;
  fromLetter: MotionValue<CountFaceVisibility>;
  toLetter: MotionValue<CountFaceVisibility>;
  fromStar: MotionValue<CountFaceVisibility>;
  toStar: MotionValue<CountFaceVisibility>;
}

export const useCountFlap = (run: CountRun, clock: MotionValue<number>): CountFlap => {
  const frame = useTransform(clock, (elapsed: number): CountFrame => countFrameAt(run, elapsed));
  const progress = useTransform(frame, (at: CountFrame): number => at.progress);

  const fromFace = useTransform(frame, (at: CountFrame): string => at.from);
  const toFace = useTransform(frame, (at: CountFrame): string => at.to);

  return {
    leaf: useFlapLeaf(progress),
    fromFace: useTransform(fromFace, letterFaceOf),
    toFace: useTransform(toFace, letterFaceOf),
    fromLetter: useTransform(fromFace, letterVisibilityOf),
    toLetter: useTransform(toFace, letterVisibilityOf),
    fromStar: useTransform(fromFace, starVisibilityOf),
    toStar: useTransform(toFace, starVisibilityOf),
  };
};
