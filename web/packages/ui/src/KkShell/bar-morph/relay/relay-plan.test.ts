import { describe, expect, it } from 'vitest';
import { climbSourceOf, markMoveOf, markRolesOf, passDirectionOf, relayPlanOf } from './relay-plan';

describe('relayPlanOf', () => {
  it.each([
    [false, false, 'deeper', 'settled'],
    [true, false, 'still', 'settled'],
    [true, true, 'deeper', 'crossfade'],
    [true, false, 'deeper', 'climb'],
    [true, false, 'shallower', 'descend'],
    [true, false, 'lateral-forward', 'pass'],
    [true, false, 'lateral-back', 'pass'],
  ] as const)('debut %s, reduced %s, move %s → %s', (debut, reducedMotion, move, plan) => {
    expect(relayPlanOf({ debut, reducedMotion, move })).toBe(plan);
  });
});

describe('climbSourceOf', () => {
  it.each([
    [{ top: 150, bottom: 200, opacity: 1, barBottom: 76, viewportHeight: 844 }, 'headline'],
    [{ top: 20, bottom: 70, opacity: 1, barBottom: 76, viewportHeight: 844 }, 'bar'],
    [{ top: 150, bottom: 200, opacity: 0.2, barBottom: 76, viewportHeight: 844 }, 'bar'],
    [{ top: 900, bottom: 950, opacity: 1, barBottom: 76, viewportHeight: 844 }, 'bar'],
  ] as const)('%o → %s', (sighting, source) => {
    expect(climbSourceOf(sighting)).toBe(source);
  });

  it('falls back to the bar without a headline', () => {
    expect(climbSourceOf(null)).toBe('bar');
  });
});

describe('markMoveOf', () => {
  it.each([
    ['broom', 'back', 'swap'],
    ['back', 'back', 'stay'],
    ['close', 'broom', 'swap'],
  ] as const)('%s → %s is %s', (from, to, move) => {
    expect(markMoveOf(from, to)).toBe(move);
  });
});

describe('passDirectionOf', () => {
  it.each([
    ['lateral-forward', -1],
    ['lateral-back', 1],
  ] as const)('%s → %d', (move, direction) => {
    expect(passDirectionOf(move)).toBe(direction);
  });
});

describe('markRolesOf', () => {
  it.each([
    ['broom', 'back', { exit: 'tumble', entry: 'shoulder' }],
    ['back', 'broom', { exit: 'slide', entry: 'drop' }],
    ['back', 'back', { exit: 'none', entry: 'catch' }],
    ['broom', 'broom', { exit: 'none', entry: 'wiggle' }],
    ['close', 'back', { exit: 'slide', entry: 'shoulder' }],
    ['none', 'back', { exit: 'none', entry: 'shoulder' }],
    ['back', 'none', { exit: 'slide', entry: 'none' }],
  ] as const)('%s → %s', (from, to, roles) => {
    expect(markRolesOf(from, to)).toEqual(roles);
  });
});
