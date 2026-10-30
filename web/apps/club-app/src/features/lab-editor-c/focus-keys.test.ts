import { describe, expect, it } from 'vitest';
import type { FocusKeyPress } from './focus-keys';
import { focusKeyOf } from './focus-keys';

const plain: FocusKeyPress = {
  key: ' ',
  shiftKey: false,
  ctrlKey: false,
  metaKey: false,
  altKey: false,
  typing: false,
  pressing: false,
};

describe('focusKeyOf', () => {
  it.each([
    { press: plain, expected: 'toggle' },
    { press: { ...plain, pressing: true }, expected: null },
    { press: { ...plain, typing: true }, expected: null },
    { press: { ...plain, key: 'ArrowLeft' }, expected: 'previousStep' },
    { press: { ...plain, key: 'ArrowLeft', shiftKey: true }, expected: 'previousCount' },
    { press: { ...plain, key: 'ArrowRight' }, expected: 'nextStep' },
    { press: { ...plain, key: 'ArrowRight', shiftKey: true }, expected: 'nextCount' },
    { press: { ...plain, key: '+' }, expected: 'zoomIn' },
    { press: { ...plain, key: '=' }, expected: 'zoomIn' },
    { press: { ...plain, key: '-' }, expected: 'zoomOut' },
    { press: { ...plain, key: 'z', ctrlKey: true }, expected: null },
    { press: { ...plain, key: 'x' }, expected: null },
  ])('maps $press.key', ({ press, expected }) => {
    expect(focusKeyOf(press)).toBe(expected);
  });
});
