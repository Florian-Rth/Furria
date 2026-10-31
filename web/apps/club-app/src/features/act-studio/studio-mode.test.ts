import { describe, expect, it } from 'vitest';
import type { StudioModeStart } from './studio-mode';
import { firstStudioToolOf, shownStudioToolOf, studioEditorOf, studioToolsOf } from './studio-mode';

const startOf = (overrides: Partial<StudioModeStart>): StudioModeStart => ({
  silent: false,
  evening: false,
  editing: false,
  stageOnly: false,
  tool: null,
  ...overrides,
});

describe('studioToolsOf', () => {
  it.each([
    [startOf({}), ['music', 'steps', 'formation', 'movement', 'video']],
    [startOf({ stageOnly: true }), ['formation', 'movement']],
    [startOf({ evening: true }), ['formation', 'movement']],
  ])('offers the tools for %o', (start, expected) => {
    expect(studioToolsOf(start)).toEqual(expected);
  });
});

describe('firstStudioToolOf', () => {
  it.each([
    [startOf({}), 'steps'],
    [startOf({ silent: true }), 'music'],
    [startOf({ stageOnly: true }), 'formation'],
    [startOf({ silent: true, stageOnly: true }), 'formation'],
    [startOf({ silent: true, evening: true }), 'formation'],
    [startOf({ tool: 'video' }), 'video'],
    [startOf({ stageOnly: true, tool: 'movement' }), 'movement'],
    [startOf({ stageOnly: true, tool: 'music' }), 'formation'],
  ] as const)('starts %o on its first tool', (start, expected) => {
    expect(firstStudioToolOf(start)).toBe(expected);
  });
});

describe('shownStudioToolOf', () => {
  it.each([
    ['steps', startOf({ stageOnly: true }), 'formation'],
    ['steps', startOf({}), 'steps'],
    ['music', startOf({ evening: true }), 'formation'],
    ['movement', startOf({ stageOnly: true }), 'movement'],
  ] as const)('shows %s for %o', (chosen, start, expected) => {
    expect(shownStudioToolOf(chosen, start)).toBe(expected);
  });
});

describe('studioEditorOf', () => {
  it.each([
    [true, true, true, 'desk'],
    [true, true, false, 'cards'],
    [true, false, true, null],
    [false, true, true, null],
  ] as const)('stage only %s, editing %s, wide %s', (stageOnly, editing, wide, expected) => {
    expect(studioEditorOf(stageOnly, editing, wide)).toBe(expected);
  });
});
