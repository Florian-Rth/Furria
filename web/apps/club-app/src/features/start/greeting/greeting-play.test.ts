import { describe, expect, it } from 'vitest';
import type { GreetingAct } from './greeting-act';
import type { GreetingPlayDecision } from './greeting-play';
import { greetingPlayOf } from './greeting-play';

interface PlayCase {
  label: string;
  act: GreetingAct;
  reducedMotion: boolean;
  expected: GreetingPlayDecision;
}

const SESSION_DAY = { kind: 'sessionDay', day: 70 } as const;

const DAILY: GreetingAct = {
  moment: 'daily',
  clause: SESSION_DAY,
  festive: false,
  key: 'daily:2027-01-19',
  sessionYear: 2026,
  ordinal: 12,
};
const CALL: GreetingAct = {
  moment: 'carnivalCall',
  clause: null,
  festive: true,
  key: 'carnivalCall:2026-11-11',
  sessionYear: 2026,
  ordinal: 12,
};
const COUNTDOWN: GreetingAct = {
  moment: 'openingCountdown',
  secondsToOpening: 450,
  clause: null,
  festive: false,
  key: 'openingCountdown:2026-11-11',
  sessionYear: 2026,
  ordinal: 12,
};
const BIRTHDAY: GreetingAct = {
  moment: 'birthday',
  clause: SESSION_DAY,
  festive: true,
  key: 'birthday:2027-01-19',
  sessionYear: 2026,
  ordinal: 12,
};
const ROUND_JOIN: GreetingAct = {
  moment: 'joinAnniversary',
  years: 11,
  clause: SESSION_DAY,
  festive: true,
  key: 'joinAnniversary:2027-01-19',
  sessionYear: 2026,
  ordinal: 12,
};
const KEHRAUS: GreetingAct = {
  moment: 'carnivalTuesday',
  clause: null,
  festive: true,
  key: 'carnivalTuesday:2027-02-09',
  sessionYear: 2026,
  ordinal: 12,
};

describe('greetingPlayOf', () => {
  it.each<PlayCase>([
    {
      label: 'she prefers reduced motion',
      act: CALL,
      reducedMotion: true,
      expected: { play: 'still', burst: false },
    },
    {
      label: 'the countdown runs',
      act: COUNTDOWN,
      reducedMotion: false,
      expected: { play: 'live', burst: false },
    },
    {
      label: 'an ordinary day opens',
      act: DAILY,
      reducedMotion: false,
      expected: { play: 'full', burst: false },
    },
    {
      label: 'the call sounds',
      act: CALL,
      reducedMotion: false,
      expected: { play: 'full', burst: true },
    },
    {
      label: 'her birthday opens',
      act: BIRTHDAY,
      reducedMotion: false,
      expected: { play: 'full', burst: true },
    },
    {
      label: 'a round join anniversary opens',
      act: ROUND_JOIN,
      reducedMotion: false,
      expected: { play: 'full', burst: true },
    },
    {
      label: 'a plain join anniversary opens',
      act: { ...ROUND_JOIN, years: 3, festive: false },
      reducedMotion: false,
      expected: { play: 'full', burst: false },
    },
    {
      label: 'Kehraus opens',
      act: KEHRAUS,
      reducedMotion: false,
      expected: { play: 'full', burst: false },
    },
  ])(
    'plays $expected.play (burst $expected.burst) when $label',
    ({ act, reducedMotion, expected }) => {
      expect(greetingPlayOf(act, reducedMotion)).toEqual(expected);
    },
  );
});
