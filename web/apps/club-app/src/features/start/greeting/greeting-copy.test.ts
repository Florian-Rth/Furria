import { describe, expect, it } from 'vitest';
import type { GreetingAct, SeasonClause } from './greeting-act';
import type { GreetingCopy, GreetingNameForm, GreetingPart } from './greeting-copy';
import {
  GREETING_MAX_LENGTH,
  toGreetingCopy,
  toGreetingText,
  withValuesGlued,
} from './greeting-copy';
import type { GreetingDeck } from './greeting-decks';

type ClausedMoment = 'birthday' | 'welcome' | 'daily';
type PlainMoment =
  | 'carnivalCall'
  | 'womensCarnivalDay'
  | 'roseMonday'
  | 'carnivalTuesday'
  | 'ashWednesday';

interface CopySummary {
  values: string[];
  name: string | null;
  nameForm: GreetingNameForm;
  hasLine: boolean;
}

interface CopyCase {
  label: string;
  act: GreetingAct;
  firstName: string;
  expected: CopySummary;
}

const STAGE = { festive: false, key: 'daily:2027-01-19', sessionYear: 2026 };

const claused = (
  moment: ClausedMoment,
  clause: SeasonClause,
  ordinal: number | null,
): GreetingAct => ({ ...STAGE, moment, clause, ordinal });

const clauseless = (moment: PlainMoment, ordinal: number | null): GreetingAct => ({
  ...STAGE,
  moment,
  clause: null,
  ordinal,
});

const anniversary = (years: number, clause: SeasonClause): GreetingAct => ({
  ...STAGE,
  moment: 'joinAnniversary',
  years,
  clause,
  ordinal: null,
});

const countdown = (secondsToOpening: number, ordinal: number | null): GreetingAct => ({
  ...STAGE,
  moment: 'openingCountdown',
  secondsToOpening,
  clause: null,
  ordinal,
});

const summaryOf = (copy: GreetingCopy): CopySummary => ({
  values: copy.parts.filter((part) => part.role === 'value').map((part) => part.text),
  name: copy.parts.find((part) => part.role === 'name')?.text ?? null,
  nameForm: copy.nameForm,
  hasLine: copy.line !== null,
});

describe('toGreetingCopy', () => {
  it.each<CopyCase>([
    {
      label: 'Lena on a January training night',
      act: claused('daily', { kind: 'sessionDay', day: 70 }, 12),
      firstName: 'Lena',
      expected: { values: ['70', '12.'], name: 'Lena', nameForm: 'vocative', hasLine: false },
    },
    {
      label: 'Gerd in May, greeted by name',
      act: claused('daily', { kind: 'untilOpening', days: 177 }, 33),
      firstName: 'Gerd',
      expected: { values: ['177', '33.'], name: 'Gerd', nameForm: 'vocative', hasLine: false },
    },
    {
      label: 'a long name in May, whose vocative runs past the budget',
      act: claused('daily', { kind: 'untilOpening', days: 277 }, 33),
      firstName: 'Maximilian',
      expected: { values: ['277', '33.'], name: null, nameForm: 'nameless', hasLine: false },
    },
    {
      label: 'Sabine, who holds no membership',
      act: claused('daily', { kind: 'sessionDay', day: 70 }, null),
      firstName: 'Sabine',
      expected: { values: ['70'], name: 'Sabine', nameForm: 'vocative', hasLine: false },
    },
    {
      label: 'her first session, spelled out',
      act: claused('daily', { kind: 'sessionDay', day: 70 }, 1),
      firstName: 'Lena',
      expected: { values: ['70'], name: 'Lena', nameForm: 'vocative', hasLine: false },
    },
    {
      label: 'a first name longer than twelve letters',
      act: claused('daily', { kind: 'sessionDay', day: 70 }, null),
      firstName: 'Maximilianeee',
      expected: { values: ['70'], name: null, nameForm: 'nameless', hasLine: false },
    },
    {
      label: 'a blank first name',
      act: claused('daily', { kind: 'sessionDay', day: 70 }, null),
      firstName: '   ',
      expected: { values: ['70'], name: null, nameForm: 'nameless', hasLine: false },
    },
    {
      label: 'a double first name with stray spaces',
      act: claused('daily', { kind: 'sessionDay', day: 70 }, null),
      firstName: ' Anna  Lena ',
      expected: { values: ['70'], name: 'Anna Lena', nameForm: 'vocative', hasLine: false },
    },
    {
      label: 'a far opening of her first session that only fits the club form',
      act: claused('daily', { kind: 'untilOpening', days: 279 }, 1),
      firstName: 'Lena',
      expected: { values: ['279'], name: 'Lena', nameForm: 'vocative', hasLine: false },
    },
    {
      label: 'the morning of 11.11. for a member',
      act: claused('daily', { kind: 'openingToday' }, 12),
      firstName: 'Lena',
      expected: { values: [], name: 'Lena', nameForm: 'vocative', hasLine: true },
    },
    {
      label: 'the morning of 11.11. for a non-member',
      act: claused('daily', { kind: 'openingToday' }, null),
      firstName: 'Kevin',
      expected: { values: [], name: 'Kevin', nameForm: 'vocative', hasLine: false },
    },
    {
      label: 'the eve of Weiberfastnacht',
      act: claused('daily', { kind: 'untilWomensCarnivalDay', days: 1 }, 12),
      firstName: 'Lena',
      expected: { values: [], name: 'Lena', nameForm: 'vocative', hasLine: false },
    },
    {
      label: 'eleven days before Weiberfastnacht',
      act: claused('daily', { kind: 'untilWomensCarnivalDay', days: 11 }, 12),
      firstName: 'Lena',
      expected: { values: ['11'], name: 'Lena', nameForm: 'vocative', hasLine: false },
    },
    {
      label: 'the countdown',
      act: countdown(157, 12),
      firstName: 'Lena',
      expected: { values: ['2:37'], name: null, nameForm: 'nameless', hasLine: true },
    },
    {
      label: 'the stroke of 11:11',
      act: clauseless('carnivalCall', 12),
      firstName: 'Lena',
      expected: { values: [], name: null, nameForm: 'nameless', hasLine: true },
    },
    {
      label: 'her birthday',
      act: claused('birthday', { kind: 'sessionDay', day: 70 }, 12),
      firstName: 'Lena',
      expected: { values: [], name: 'Lena', nameForm: 'vocative', hasLine: true },
    },
    {
      label: 'her eleventh year in the club',
      act: anniversary(11, { kind: 'untilOpening', days: 40 }),
      firstName: 'Lena',
      expected: { values: ['11'], name: 'Lena', nameForm: 'vocative', hasLine: true },
    },
    {
      label: 'Weiberfastnacht with a name that breaks the budget',
      act: clauseless('womensCarnivalDay', 12),
      firstName: 'Maximiliane',
      expected: { values: [], name: null, nameForm: 'nameless', hasLine: false },
    },
    {
      label: 'Rosenmontag with a twelve-letter name',
      act: clauseless('roseMonday', 12),
      firstName: 'Maximilianne',
      expected: { values: [], name: 'Maximilianne', nameForm: 'vocative', hasLine: false },
    },
    {
      label: 'Aschermittwoch',
      act: clauseless('ashWednesday', 12),
      firstName: 'Lena',
      expected: { values: [], name: null, nameForm: 'nameless', hasLine: true },
    },
    {
      label: 'her first day in the app',
      act: claused('welcome', { kind: 'untilOpening', days: 40 }, null),
      firstName: 'Jana',
      expected: { values: [], name: 'Jana', nameForm: 'vocative', hasLine: true },
    },
  ])('greets $label', ({ act, firstName, expected }) => {
    expect(summaryOf(toGreetingCopy(act, firstName))).toEqual(expected);
  });

  it.each([
    {
      label: 'the countdown of a member',
      act: countdown(157, 12),
      firstName: 'Lena',
      value: '12.',
    },
    {
      label: 'the stroke of 11:11 for a non-member',
      act: clauseless('carnivalCall', null),
      firstName: 'Kevin',
      value: '2026/27',
    },
    {
      label: 'her birthday line in the session',
      act: claused('birthday', { kind: 'sessionDay', day: 70 }, 12),
      firstName: 'Lena',
      value: '70',
    },
    {
      label: 'her anniversary line before the opening',
      act: anniversary(11, { kind: 'untilOpening', days: 40 }),
      firstName: 'Lena',
      value: '40',
    },
    {
      label: 'the thanks on Aschermittwoch for a non-member',
      act: clauseless('ashWednesday', null),
      firstName: 'Sabine',
      value: '2026/27',
    },
  ])('names $value in the line for $label', ({ act, firstName, value }) => {
    expect(toGreetingCopy(act, firstName).line).toContain(value);
  });

  it.each<{ label: string; act: GreetingAct; expected: GreetingDeck }>([
    {
      label: 'an ordinary day',
      act: claused('daily', { kind: 'sessionDay', day: 70 }, 12),
      expected: 'carnival',
    },
    {
      label: 'her birthday',
      act: claused('birthday', { kind: 'sessionDay', day: 70 }, 12),
      expected: 'cheer',
    },
    { label: 'Aschermittwoch', act: clauseless('ashWednesday', 12), expected: 'backwards' },
  ])('rattles the $expected deck on $label', ({ act, expected }) => {
    expect(toGreetingCopy(act, 'Lena').deck).toBe(expected);
  });
});

describe('withValuesGlued', () => {
  it.each<{ label: string; parts: GreetingPart[]; expected: string }>([
    {
      label: 'binds the part after a value to it',
      parts: [
        { text: '40', role: 'value' },
        { text: ' Tage', role: 'plain' },
      ],
      expected: '\u00A0Tage',
    },
    {
      label: 'leaves a part that follows plain text alone',
      parts: [
        { text: 'Tag', role: 'plain' },
        { text: ' der Session', role: 'plain' },
      ],
      expected: ' der Session',
    },
  ])('$label', ({ parts, expected }) => {
    expect(withValuesGlued(parts)[1]?.text).toBe(expected);
  });
});

describe('the greeting budget at worst-case inputs', () => {
  const ordinals = [null, 1, 9, 99];
  const names = ['', 'Lena', 'Maximilianne'];
  const clauses: SeasonClause[] = [
    { kind: 'untilOpening', days: 279 },
    { kind: 'untilOpening', days: 2 },
    { kind: 'openingTomorrow' },
    { kind: 'openingToday' },
    { kind: 'sessionDay', day: 120 },
    { kind: 'untilWomensCarnivalDay', days: 11 },
    { kind: 'untilWomensCarnivalDay', days: 1 },
  ];
  const plainMoments: PlainMoment[] = [
    'carnivalCall',
    'womensCarnivalDay',
    'roseMonday',
    'carnivalTuesday',
    'ashWednesday',
  ];
  const clausedMoments: ClausedMoment[] = ['birthday', 'welcome', 'daily'];
  const acts: GreetingAct[] = ordinals.flatMap((ordinal) => [
    countdown(660, ordinal),
    ...plainMoments.map((moment) => clauseless(moment, ordinal)),
    ...clauses.flatMap((clause) => [
      ...clausedMoments.map((moment) => claused(moment, clause, ordinal)),
      anniversary(1, clause),
      anniversary(99, clause),
    ]),
  ]);
  const copies = acts.flatMap((act) => names.map((firstName) => toGreetingCopy(act, firstName)));
  const texts = [
    ...new Set(
      copies.flatMap((copy) =>
        copy.line === null ? [toGreetingText(copy.parts)] : [toGreetingText(copy.parts), copy.line],
      ),
    ),
  ];

  it.each(texts)('keeps "%s" within the budget', (text) => {
    expect(text.length).toBeLessThanOrEqual(GREETING_MAX_LENGTH);
  });
});
