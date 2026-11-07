import type { JobAction } from '@furria/studio/job-view';
import { toolsOfActions } from '@furria/studio/setup-task';
import { describe, expect, it } from 'vitest';

const actionOf = (key: string, disabled: boolean, label: string | undefined): JobAction => ({
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
