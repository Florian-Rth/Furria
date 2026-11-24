import { describe, expect, it } from 'vitest';
import { canChangeCoEditors } from './act-studio';

describe('canChangeCoEditors', () => {
  it.each<[boolean, boolean, boolean, boolean]>([
    [true, true, false, false],
    [true, false, true, false],
  ])('grant %s, closed %s, archived %s → %s', (canGrant, closed, archived, expected) => {
    expect(canChangeCoEditors(canGrant, { closed, archived })).toBe(expected);
  });
});
