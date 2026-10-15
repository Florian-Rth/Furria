import { describe, expect, it } from 'vitest';
import type { PersonFunction } from '@/lib/api/schemas';
import type { StandingFacts } from './honours';
import { toAvatarFunction, toAvatarHonours, toStanding } from './honours';

describe('toAvatarFunction', () => {
  it.each<[PersonFunction, object]>([
    [
      { kind: 'boardSeat', name: 'Kassiererin', icon: null, tone: null },
      { kind: 'board', icon: 'crown', short: 'Kassiererin' },
    ],
    [
      { kind: 'groupAdmin', name: 'Tanzgarde', icon: null, tone: 'teal' },
      { kind: 'admin', icon: 'sparkle', short: 'Tanzgarde', tone: 'teal' },
    ],
    [
      { kind: 'role', name: 'Fotograf', icon: null, tone: null },
      { kind: 'role', icon: 'shield', short: 'Fotograf' },
    ],
    [
      { kind: 'role', name: 'Fotograf', icon: 'camera', tone: null },
      { kind: 'role', icon: 'camera', short: 'Fotograf' },
    ],
  ])('maps %o', (entry, expected) => {
    expect(toAvatarFunction(entry)).toEqual(expect.objectContaining(expected));
  });

  it('leaves the tone out when the function has none', () => {
    expect(
      toAvatarFunction({ kind: 'role', name: 'Fotograf', icon: null, tone: null }),
    ).not.toHaveProperty('tone');
  });
});

describe('toAvatarHonours', () => {
  it.each([
    [0, false],
    [1, true],
    [27, true],
  ])('names %i sessions: %s', (sessions, named) => {
    const honours = toAvatarHonours({ sessions, functions: [] });

    expect(honours.sessions).toBe(sessions);
    expect(honours.sessionsLabel !== undefined).toBe(named);
  });

  it('keeps the server order of the functions', () => {
    const honours = toAvatarHonours({
      sessions: 3,
      functions: [
        { kind: 'boardSeat', name: 'Präsident', icon: 'crown', tone: null },
        { kind: 'role', name: 'Admin', icon: null, tone: null },
      ],
    });

    expect(honours.functions.map((entry) => entry.kind)).toEqual(['board', 'role']);
  });
});

describe('toStanding', () => {
  it.each<[StandingFacts, object]>([
    [
      { membershipState: 'active', accessState: 'active', feeReduced: true },
      { membership: 'running', app: 'active', feeReduced: true },
    ],
    [
      { membershipState: 'paused', accessState: 'invited', feeReduced: false },
      { membership: 'paused', app: 'invited', feeReduced: false },
    ],
    [
      { membershipState: 'ended', accessState: 'disabled', feeReduced: false },
      { membership: 'none', app: 'attention', feeReduced: false },
    ],
    [
      { membershipState: 'none', accessState: 'notInvitable', feeReduced: false },
      { membership: 'none', app: 'none', feeReduced: false },
    ],
  ])('reads %o', (facts, expected) => {
    expect(toStanding(facts)).toEqual(expected);
  });
});
