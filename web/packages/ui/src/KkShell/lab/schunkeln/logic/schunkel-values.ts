import type { MotionValue } from 'motion/react';
import { motionValue } from 'motion/react';
import type { SchunkelGlyph, SchunkelPlan } from './schunkel-pose';

export interface SchunkelLetterValues {
  x: MotionValue<number>;
  y: MotionValue<number>;
  scale: MotionValue<number>;
  squash: MotionValue<number>;
  rotate: MotionValue<number>;
  lower: MotionValue<number>;
  presence: MotionValue<number>;
}

export interface SchunkelRestValues {
  x: MotionValue<number>;
  rotate: MotionValue<number>;
  opacity: MotionValue<number>;
}

export interface SchunkelScene {
  plan: SchunkelPlan | null;
  letters: SchunkelLetterValues[];
  restGlyphs: SchunkelGlyph[];
  restLetters: SchunkelRestValues[];
}

export const EMPTY_SCENE: SchunkelScene = {
  plan: null,
  letters: [],
  restGlyphs: [],
  restLetters: [],
};

const letterValuesOf = (): SchunkelLetterValues => ({
  x: motionValue(0),
  y: motionValue(0),
  scale: motionValue(1),
  squash: motionValue(1),
  rotate: motionValue(0),
  lower: motionValue(0),
  presence: motionValue(1),
});

const restValuesOf = (): SchunkelRestValues => ({
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
  plan: SchunkelPlan | null,
  restGlyphs: SchunkelGlyph[],
  restCount: number,
  previous: SchunkelScene,
): SchunkelScene => ({
  plan,
  letters: reuseOrCreate(plan?.letters.length ?? 0, previous.letters, letterValuesOf),
  restGlyphs,
  restLetters: reuseOrCreate(restCount, previous.restLetters, restValuesOf),
});
