import { describe, expect, it } from 'vitest';
import type { GroupTone, TrainingSlotFacts } from './group-identity';
import {
  toAnniversary,
  toFoundedLine,
  toGroupTone,
  toRhythmSentence,
  toTrainingSlotLine,
} from './group-identity';

const slot = (
  weekday: TrainingSlotFacts['weekday'],
  startsAt: string,
  durationMinutes: number,
  venueName: string | null,
): TrainingSlotFacts => ({ weekday, startsAt, durationMinutes, venueName });

describe('toAnniversary', () => {
  it.each([
    { foundedYear: null, sessionYear: 2026, expected: null },
    { foundedYear: 2026, sessionYear: 2026, expected: null },
    { foundedYear: 2025, sessionYear: 2026, expected: null },
    { foundedYear: 2022, sessionYear: 2026, expected: null },
    { foundedYear: 2021, sessionYear: 2026, expected: { years: 5, label: '5 Jahre' } },
    { foundedYear: 2013, sessionYear: 2026, expected: null },
    { foundedYear: 1976, sessionYear: 2026, expected: { years: 50, label: '50 Jahre' } },
    { foundedYear: 2030, sessionYear: 2026, expected: null },
    { foundedYear: 2031, sessionYear: 2026, expected: null },
  ])(
    'turns the founded year $foundedYear into $expected in $sessionYear',
    ({ foundedYear, sessionYear, expected }) => {
      expect(toAnniversary(foundedYear, sessionYear)).toEqual(expected);
    },
  );
});

describe('toGroupTone', () => {
  it.each([
    { groupId: 1, tone: 'rose' as GroupTone, expected: 'rose' },
    { groupId: 0, tone: null, expected: 'clay' },
    { groupId: 2, tone: null, expected: 'lime' },
    { groupId: 9, tone: null, expected: 'rose' },
    { groupId: 12, tone: null, expected: 'lime' },
    { groupId: 20, tone: null, expected: 'clay' },
  ])('paints group $groupId as $expected', ({ groupId, tone, expected }) => {
    expect(toGroupTone(groupId, tone)).toBe(expected);
  });
});

describe('toFoundedLine', () => {
  it.each([
    { foundedYear: null, expected: null },
    { foundedYear: 1974, expected: 'seit 1974' },
  ])('writes $expected for $foundedYear', ({ foundedYear, expected }) => {
    expect(toFoundedLine(foundedYear)).toBe(expected);
  });
});

describe('toTrainingSlotLine', () => {
  it.each([
    {
      fixture: slot('tuesday', '19:30:00', 90, 'Sporthalle'),
      expected: 'dienstags 19:30 – 21:00 Uhr, Sporthalle',
    },
    {
      fixture: slot('thursday', '18:00', 60, null),
      expected: 'donnerstags 18:00 – 19:00 Uhr',
    },
    {
      fixture: slot('saturday', '23:15:00', 90, 'Festzelt'),
      expected: 'samstags 23:15 – 00:45 Uhr, Festzelt',
    },
    {
      fixture: slot('sunday', '09:05:00', 55, null),
      expected: 'sonntags 09:05 – 10:00 Uhr',
    },
  ])('writes $expected', ({ fixture, expected }) => {
    expect(toTrainingSlotLine(fixture)).toBe(expected);
  });
});

describe('toRhythmSentence', () => {
  it('says nothing when the group has stated no rhythm', () => {
    expect(toRhythmSentence([])).toBeNull();
  });

  it('names one slot without a conjunction', () => {
    expect(toRhythmSentence([slot('tuesday', '19:30:00', 90, 'Sporthalle')])).toBe(
      'Wir trainieren dienstags 19:30 – 21:00 Uhr, Sporthalle.',
    );
  });

  it('joins two slots with and', () => {
    expect(
      toRhythmSentence([
        slot('tuesday', '19:30:00', 90, 'Sporthalle'),
        slot('thursday', '18:00:00', 60, null),
      ]),
    ).toBe(
      'Wir trainieren dienstags 19:30 – 21:00 Uhr, Sporthalle und donnerstags 18:00 – 19:00 Uhr.',
    );
  });

  it('joins three slots with commas and a closing and', () => {
    expect(
      toRhythmSentence([
        slot('monday', '17:00:00', 60, null),
        slot('tuesday', '19:30:00', 90, null),
        slot('friday', '18:00:00', 45, null),
      ]),
    ).toBe(
      'Wir trainieren montags 17:00 – 18:00 Uhr, dienstags 19:30 – 21:00 Uhr und freitags 18:00 – 18:45 Uhr.',
    );
  });
});
