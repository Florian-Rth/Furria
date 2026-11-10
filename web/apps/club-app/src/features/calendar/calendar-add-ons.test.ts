import { describe, expect, it } from 'vitest';
import {
  toAttachedAddOns,
  toCalendarAddOn,
  toDiscardedAnswerCount,
  toOfferedAddOns,
} from './calendar-add-ons';

describe('toOfferedAddOns', () => {
  it.each([
    [[], ['attendance', 'participatingGroups']],
    [['participatingGroups'], ['attendance']],
    [['attendance', 'participatingGroups'], []],
  ] as const)('offers %j attached as %j', (attached, expected) => {
    expect(toOfferedAddOns(attached)).toEqual(expected);
  });
});

describe('toAttachedAddOns', () => {
  it.each([
    [[], 'attendance', ['attendance']],
    [['participatingGroups'], 'attendance', ['participatingGroups', 'attendance']],
    [['attendance'], 'attendance', ['attendance']],
  ] as const)('attaches to %j the add-on %s as %j', (attached, addOn, expected) => {
    expect(toAttachedAddOns(attached, addOn)).toEqual(expected);
  });
});

describe('toCalendarAddOn', () => {
  it.each([
    ['attendance', 'attendance'],
    ['poll', null],
  ] as const)('reads %s as %s', (value, expected) => {
    expect(toCalendarAddOn(value)).toBe(expected);
  });
});

describe('toDiscardedAnswerCount', () => {
  it.each([
    ['attendance', { addOns: ['attendance'], responseCount: 4 }, 4],
    ['attendance', { addOns: [], responseCount: 4 }, 0],
    ['participatingGroups', { addOns: ['participatingGroups'], responseCount: 4 }, 0],
    ['attendance', null, 0],
  ] as const)('discards for %s on %j: %i', (addOn, entry, expected) => {
    expect(toDiscardedAnswerCount(addOn, entry)).toBe(expected);
  });
});
