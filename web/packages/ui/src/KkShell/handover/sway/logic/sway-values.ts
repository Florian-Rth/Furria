import type { MotionValue } from 'motion/react';
import { motionValue } from 'motion/react';
import type { SwayGlyph, SwayPlan } from './sway-pose';

export interface SwayLetterValues {
  x: MotionValue<number>;
  y: MotionValue<number>;
  scale: MotionValue<number>;
  squash: MotionValue<number>;
  rotate: MotionValue<number>;
  lower: MotionValue<number>;
  presence: MotionValue<number>;
}

export interface SwayLineValues {
  x: MotionValue<number>;
  rotate: MotionValue<number>;
  opacity: MotionValue<number>;
}

export interface SwayScene {
  plan: SwayPlan | null;
  letters: SwayLetterValues[];
  restGlyphs: SwayGlyph[];
  restLetters: SwayLineValues[];
  arrivalGlyphs: SwayGlyph[];
  arrivalLetters: SwayLineValues[];
}

export const EMPTY_SCENE: SwayScene = {
  plan: null,
  letters: [],
  restGlyphs: [],
  restLetters: [],
  arrivalGlyphs: [],
  arrivalLetters: [],
};

const letterValuesOf = (): SwayLetterValues => ({
  x: motionValue(0),
  y: motionValue(0),
  scale: motionValue(1),
  squash: motionValue(1),
  rotate: motionValue(0),
  lower: motionValue(0),
  presence: motionValue(1),
});

const lineValuesOf = (): SwayLineValues => ({
  x: motionValue(0),
  rotate: motionValue(0),
  opacity: motionValue(1),
});

const reuseOrCreate = <Values>(
  count: number,
  existing: Values[],
  create: () => Values,
): Values[] =>
  existing.length === count ? existing : Array.from({ length: count }, () => create());

export const sceneOf = (
  plan: SwayPlan | null,
  restGlyphs: SwayGlyph[],
  restCount: number,
  arrivalGlyphs: SwayGlyph[],
  previous: SwayScene,
): SwayScene => ({
  plan,
  letters: reuseOrCreate(plan?.letters.length ?? 0, previous.letters, letterValuesOf),
  restGlyphs,
  restLetters: reuseOrCreate(restCount, previous.restLetters, lineValuesOf),
  arrivalGlyphs,
  arrivalLetters: reuseOrCreate(arrivalGlyphs.length, previous.arrivalLetters, lineValuesOf),
});

export const titleRowOf = (scene: SwayScene): MotionValue<number>[] =>
  scene.plan === null
    ? scene.arrivalLetters.map((values) => values.rotate)
    : scene.letters.map((values) => values.rotate);
