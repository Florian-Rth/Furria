import { describe, expect, it } from 'vitest';
import type { PushReadiness, PushTraits } from './push-readiness';
import { pushReadinessOf } from './push-readiness';

const capable: PushTraits = {
  canPush: true,
  system: 'android',
  standalone: true,
  permission: 'default',
  subscribed: false,
};

describe('pushReadinessOf', () => {
  it.each<[string, PushTraits, PushReadiness]>([
    [
      'an iPhone tab without push',
      { ...capable, canPush: false, system: 'ios', standalone: false },
      'install-first',
    ],
    [
      'an installed iPhone app without push (iOS before 16.4)',
      { ...capable, canPush: false, system: 'ios', standalone: true },
      'unsupported',
    ],
    ['a browser without push', { ...capable, canPush: false, system: 'other' }, 'unsupported'],
    ['a refused permission', { ...capable, permission: 'denied', subscribed: true }, 'blocked'],
    ['a device never asked', capable, 'off'],
    ['a granted device without subscription', { ...capable, permission: 'granted' }, 'off'],
    ['a subscription whose permission was reset', { ...capable, subscribed: true }, 'off'],
    ['a subscribed device', { ...capable, permission: 'granted', subscribed: true }, 'on'],
  ])('reads %s', (_case, traits, readiness) => {
    expect(pushReadinessOf(traits)).toBe(readiness);
  });
});
