import { describe, expect, it } from 'vitest';
import type { PushTopicsTally } from './push-topics';
import { pushTopicsTallyOf, withTopicSwitched } from './push-topics';
import type { PushTopicSetting } from './schemas';

describe('withTopicSwitched', () => {
  it('switches only the named topic', () => {
    const current = {
      topics: [
        { topic: 'invitations' as const, isEnabled: true },
        { topic: 'reminders' as const, isEnabled: true },
      ],
    };

    expect(withTopicSwitched(current, { topic: 'reminders', isEnabled: false })).toEqual({
      topics: [
        { topic: 'invitations', isEnabled: true },
        { topic: 'reminders', isEnabled: false },
      ],
    });
  });

  it('leaves an unloaded read alone', () => {
    expect(withTopicSwitched(undefined, { topic: 'changes', isEnabled: false })).toBeUndefined();
  });
});

describe('pushTopicsTallyOf', () => {
  it.each<[string, PushTopicSetting[], PushTopicsTally]>([
    [
      'every topic on',
      [
        { topic: 'invitations', isEnabled: true },
        { topic: 'changes', isEnabled: true },
      ],
      { kind: 'all' },
    ],
    [
      'every topic off',
      [
        { topic: 'invitations', isEnabled: false },
        { topic: 'changes', isEnabled: false },
      ],
      { kind: 'none' },
    ],
    [
      'a mix',
      [
        { topic: 'invitations', isEnabled: true },
        { topic: 'changes', isEnabled: false },
        { topic: 'reminders', isEnabled: true },
      ],
      { kind: 'some', enabled: 2, total: 3 },
    ],
  ])('tallies %s', (_case, settings, tally) => {
    expect(pushTopicsTallyOf(settings)).toEqual(tally);
  });
});
