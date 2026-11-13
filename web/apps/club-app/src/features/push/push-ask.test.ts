import { describe, expect, it } from 'vitest';
import { isPushAskOwed } from './push-ask';
import type { PushTraits } from './push-readiness';

const neverAsked: PushTraits = {
  canPush: true,
  system: 'android',
  standalone: true,
  permission: 'default',
  subscribed: false,
};

describe('isPushAskOwed', () => {
  it.each<[string, PushTraits, boolean, boolean]>([
    ['a device never asked', neverAsked, false, true],
    ['a device that already went past the ask', neverAsked, true, false],
    [
      'a device already receiving',
      { ...neverAsked, permission: 'granted', subscribed: true },
      false,
      false,
    ],
    ['a device that refused before', { ...neverAsked, permission: 'denied' }, false, true],
    ['a browser without push', { ...neverAsked, canPush: false }, false, true],
  ])('decides for %s', (_case, traits, answered, owed) => {
    expect(isPushAskOwed(traits, answered)).toBe(owed);
  });
});
