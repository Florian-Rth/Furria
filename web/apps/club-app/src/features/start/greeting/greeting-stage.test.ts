import { describe, expect, it } from 'vitest';
import type { GreetingAct } from './greeting-act';
import { HEADLINE_DECKS } from './greeting-decks';
import { greetingTickDelayOf, toGreetingStage } from './greeting-stage';

const STAGING = { festive: false, key: 'k', sessionYear: 2026, ordinal: 12 };
const CLAUSE = { kind: 'sessionDay', day: 70 } as const;

describe('toGreetingStage', () => {
  it.each<{ label: string; act: GreetingAct; tempo: string; countFrom: number | undefined }>([
    {
      label: 'a daily act',
      act: { ...STAGING, moment: 'daily', clause: CLAUSE },
      tempo: 'regular',
      countFrom: undefined,
    },
    {
      label: 'Aschermittwoch',
      act: { ...STAGING, moment: 'ashWednesday', clause: null },
      tempo: 'slow',
      countFrom: undefined,
    },
    {
      label: 'the 33rd join anniversary',
      act: { ...STAGING, moment: 'joinAnniversary', years: 33, clause: CLAUSE },
      tempo: 'regular',
      countFrom: 28,
    },
    {
      label: 'the third join anniversary',
      act: { ...STAGING, moment: 'joinAnniversary', years: 3, clause: CLAUSE },
      tempo: 'regular',
      countFrom: 0,
    },
  ])('stages $label', ({ act, tempo, countFrom }) => {
    const stage = toGreetingStage(act, { deck: 'carnival' });

    expect(stage.tempo).toBe(tempo);
    expect(stage.countFrom).toBe(countFrom);
  });

  it('deals the decks of the copy', () => {
    const stage = toGreetingStage(
      { ...STAGING, moment: 'birthday', clause: CLAUSE },
      { deck: 'cheer' },
    );

    expect(stage.deck).toBe(HEADLINE_DECKS.cheer.deck);
    expect(stage.nameDeck).toBe(HEADLINE_DECKS.cheer.nameDeck);
  });
});

describe('greetingTickDelayOf', () => {
  it.each([
    { label: 'the next second while counting down', everySecond: true, expected: 750 },
    { label: 'the next minute otherwise', everySecond: false, expected: 47_750 },
  ])('waits for $label', ({ everySecond, expected }) => {
    expect(greetingTickDelayOf(new Date(2026, 10, 11, 11, 5, 12, 250), everySecond)).toBe(expected);
  });
});
