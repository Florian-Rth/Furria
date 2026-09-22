import { describe, expect, it } from 'vitest';
import { kkTokens } from '../../../tokens';
import type { KkScreenActionBar } from '../../screen-declaration';
import { footClearanceOf } from './foot-clearance';

const { gutter, navHeight, actionHeight, actionContextHeight } = kkTokens.shell;

const primary = { label: 'Speichern', onSelect: () => {} };
const action: KkScreenActionBar = { primary };

describe('footClearanceOf', () => {
  it.each<{ label: string; section: string | undefined; expected: number }>([
    { label: 'no section and no action', section: undefined, expected: gutter },
    { label: 'a section and no action', section: 'members', expected: gutter * 2 + navHeight },
  ])('is $expected for $label', ({ section, expected }) => {
    expect(footClearanceOf({ section, action: undefined, measured: null })).toBe(expected);
  });

  it.each<{ label: string; measured: number | null; expected: number }>([
    { label: 'no measurement yet', measured: null, expected: gutter * 2 + actionHeight },
    { label: 'a measurement of zero', measured: 0, expected: gutter * 2 + actionHeight },
    { label: 'a negative measurement', measured: -4, expected: gutter * 2 + actionHeight },
    { label: 'a real measured height', measured: 96.4, expected: gutter * 2 + 97 },
  ])('with an action bar, is $expected for $label', ({ measured, expected }) => {
    expect(footClearanceOf({ section: undefined, action, measured })).toBe(expected);
  });

  it('falls back to the wrapping consequence height before the first measurement', () => {
    const withContext: KkScreenActionBar = { context: 'Ab 2020/21 zählt Annika nicht', primary };

    expect(footClearanceOf({ section: undefined, action: withContext, measured: null })).toBe(
      gutter * 2 + actionHeight + actionContextHeight,
    );
  });
});
