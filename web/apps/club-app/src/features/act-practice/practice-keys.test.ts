import { describe, expect, it } from 'vitest';
import type { KeyFocus, PracticeCommand, PracticeKeyPress } from './practice-keys';
import { practiceCommandOf, steppedRateOf } from './practice-keys';

const pressOf = (key: string, focus: KeyFocus): PracticeKeyPress => ({
  key,
  ctrlKey: false,
  metaKey: false,
  altKey: false,
  focus,
});

describe('practiceCommandOf', () => {
  it.each<[string, KeyFocus, PracticeCommand | null]>([
    [' ', 'none', 'toggle'],
    ['ArrowLeft', 'none', 'back'],
    ['ArrowRight', 'none', 'forward'],
    ['ArrowUp', 'none', 'faster'],
    ['ArrowDown', 'none', 'slower'],
    ['l', 'none', 'loop'],
    ['L', 'none', 'loop'],
    ['x', 'none', null],
    [' ', 'text', null],
    ['l', 'text', null],
    ['ArrowLeft', 'slider', null],
    ['ArrowUp', 'slider', null],
    [' ', 'slider', 'toggle'],
    [' ', 'control', null],
    ['ArrowRight', 'control', 'forward'],
    ['l', 'control', 'loop'],
  ])('maps %j with focus %s to %s', (key, focus, expected) => {
    expect(practiceCommandOf(pressOf(key, focus))).toBe(expected);
  });

  it.each([
    { ctrlKey: true, metaKey: false, altKey: false },
    { ctrlKey: false, metaKey: true, altKey: false },
    { ctrlKey: false, metaKey: false, altKey: true },
  ])('leaves modified keys to the browser and the undo history (%o)', (modifiers) => {
    expect(practiceCommandOf({ key: 'ArrowLeft', focus: 'none', ...modifiers })).toBeNull();
  });
});

describe('steppedRateOf', () => {
  const rates = [1, 0.85, 0.7, 0.5];

  it.each<[number, 'faster' | 'slower', number]>([
    [1, 'slower', 0.85],
    [0.85, 'slower', 0.7],
    [0.5, 'slower', 0.5],
    [0.5, 'faster', 0.7],
    [1, 'faster', 1],
    [0.6, 'faster', 0.7],
    [0.6, 'slower', 0.5],
  ])('from %d going %s lands on %d', (rate, command, expected) => {
    expect(steppedRateOf(rates, rate, command)).toBe(expected);
  });
});
