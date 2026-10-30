import { describe, expect, it } from 'vitest';
import type { StudioModeStart } from './studio-mode';
import { firstStudioToolOf, onDeskOf, shownStudioToolOf, studioToolsOf } from './studio-mode';

const startOf = (overrides: Partial<StudioModeStart>): StudioModeStart => ({
  silent: false,
  evening: false,
  editing: false,
  desk: false,
  ...overrides,
});

describe('studioToolsOf', () => {
  it.each([
    [startOf({ desk: true }), ['music', 'formation', 'movement', 'video']],
    [startOf({ evening: true }), ['formation', 'movement']],
    [startOf({ evening: true, desk: true }), ['formation', 'movement']],
  ])('offers the tools for %o', (start, expected) => {
    expect(studioToolsOf(start)).toEqual(expected);
  });
});

describe('firstStudioToolOf', () => {
  it.each([
    [startOf({}), 'steps'],
    [startOf({ desk: true }), 'formation'],
    [startOf({ silent: true, desk: true }), 'music'],
    [startOf({ silent: true, evening: true }), 'formation'],
  ])('starts %o on its first tool', (start, expected) => {
    expect(firstStudioToolOf(start)).toBe(expected);
  });
});

describe('shownStudioToolOf', () => {
  it.each([
    ['steps', startOf({ desk: true }), 'formation'],
    ['steps', startOf({}), 'steps'],
    ['music', startOf({ evening: true }), 'formation'],
    ['video', startOf({ desk: true }), 'video'],
  ] as const)('shows %s for %o', (chosen, start, expected) => {
    expect(shownStudioToolOf(chosen, start)).toBe(expected);
  });
});

describe('onDeskOf', () => {
  it.each([
    [true, true, 'formation', true],
    [true, true, 'movement', true],
    [true, true, 'music', false],
    [true, false, 'formation', false],
    [false, true, 'formation', false],
  ] as const)('desk %s, editing %s, %s', (desk, editing, tool, expected) => {
    expect(onDeskOf(desk, editing, tool)).toBe(expected);
  });
});
