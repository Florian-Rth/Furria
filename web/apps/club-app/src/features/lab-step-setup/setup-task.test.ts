import { describe, expect, it } from 'vitest';
import type { EjAction } from '@/features/lab-edit-jobs/edit-jobs-view';
import { toolsOfActions } from './setup-task';

const actionOf = (key: string, disabled: boolean, label: string | undefined): EjAction => ({
  key,
  text: key,
  glyph: 'line',
  tone: 'quiet',
  label,
  disabled,
  reason: null,
  pressed: undefined,
  press: () => undefined,
});

describe('toolsOfActions', () => {
  it('hides locked actions instead of showing them disabled and keeps their labels', () => {
    const tools = toolsOfActions([
      actionOf('line', false, undefined),
      actionOf('mirror', true, undefined),
      actionOf('copy', false, 'copy label'),
    ]);

    expect(tools.map((tool) => [tool.key, tool.label])).toEqual([
      ['line', null],
      ['copy', 'copy label'],
    ]);
  });
});
