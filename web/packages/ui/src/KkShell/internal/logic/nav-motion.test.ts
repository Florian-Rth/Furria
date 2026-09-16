import { describe, expect, it } from 'vitest';
import { kkTokens } from '../../../tokens';
import { navGlide, navGlyphPose, navLabelPose, navPop } from './nav-motion';

const { nav } = kkTokens.shell;

describe('navGlide and navPop', () => {
  it.each([navGlide, navPop])('springs while motion is welcome', (transition) => {
    expect(transition(false)).toHaveProperty('type', 'spring');
  });

  it.each([navGlide, navPop])('arrives without travel under reduced motion', (transition) => {
    expect(transition(true)).toEqual({ duration: 0 });
  });
});

describe('navGlyphPose', () => {
  it('lifts and enlarges the icon of the section being viewed', () => {
    expect(navGlyphPose(true)).toEqual({ scale: nav.glyphScale, y: -nav.glyphLift });
  });

  it('leaves every other icon untouched', () => {
    expect(navGlyphPose(false)).toEqual({ scale: 1, y: 0 });
  });
});

describe('navLabelPose', () => {
  it('shows the label of the section being viewed in full', () => {
    expect(navLabelPose(true)).toEqual({ opacity: 1, y: 0 });
  });

  it('dims and drops every other label', () => {
    const resting = navLabelPose(false);

    expect(resting.opacity).toBeLessThan(1);
    expect(resting.y).toBeGreaterThan(0);
  });
});
