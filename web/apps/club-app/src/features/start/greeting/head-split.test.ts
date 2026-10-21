import { describe, expect, it } from 'vitest';
import { LAB_GREETINGS, labViewOf } from '@/features/lab/lab-greetings';
import { greetingActAt } from './greeting-act';
import type { GreetingPart } from './greeting-copy';
import { toGreetingText } from './greeting-copy';
import type { HeadSplit } from './head-split';
import { birthdayYearsOf, headSplitOf } from './head-split';

const plain = (text: string): GreetingPart => ({ text, role: 'plain' });
const value = (text: string): GreetingPart => ({ text, role: 'value' });
const named = (text: string): GreetingPart => ({ text, role: 'name' });

const shapeOf = (split: HeadSplit) => ({
  kind: split.kind,
  numeral: split.numeral,
  kicked: split.kicker !== null,
  values: split.sentence.filter((part) => part.role === 'value').length,
  named: split.sentence.some((part) => part.role === 'name'),
});

const WORD = /[\p{L}\d:]+/gu;

const wordsOf = (text: string, skipped: readonly string[]): string[] =>
  (text.match(WORD) ?? []).filter((word) => !skipped.includes(word));

describe('headSplitOf', () => {
  it.each([
    {
      name: 'days to the member session',
      parts: [
        value('22'),
        plain(' Tage bis zu deiner '),
        value('12.'),
        plain(' Session, '),
        named('Lena'),
        plain('.'),
      ],
      shape: { kind: 'number', numeral: '22', kicked: false, values: 1, named: true },
    },
    {
      name: 'a session day',
      parts: [plain('Tag '), value('41'), plain(' deiner '), value('12.'), plain(' Session.')],
      shape: { kind: 'number', numeral: '41', kicked: true, values: 1, named: false },
    },
    {
      name: 'a named countdown to the opening',
      parts: [named('Lena'), plain(', noch '), value('22'), plain(' Tage bis zum 11.11.')],
      shape: { kind: 'number', numeral: '22', kicked: true, values: 0, named: true },
    },
    {
      name: 'the live countdown',
      parts: [plain('Noch '), value('10:52'), plain(' bis 11:11.')],
      shape: { kind: 'number', numeral: '10:52', kicked: true, values: 0, named: false },
    },
    {
      name: 'an ordinal behind a long lead',
      parts: [named('Lena'), plain(', morgen beginnt deine '), value('12.'), plain(' Session.')],
      shape: { kind: 'star', numeral: '✶', kicked: false, values: 1, named: true },
    },
    {
      name: 'a numberless salutation',
      parts: [plain('Willkommen, '), named('Lena'), plain('.')],
      shape: { kind: 'star', numeral: '✶', kicked: false, values: 0, named: true },
    },
  ])('splits $name', ({ parts, shape }) => {
    expect(shapeOf(headSplitOf({ moment: 'daily', parts, birthdayYears: null }))).toEqual(shape);
  });

  it.each([
    [67, { kind: 'age', numeral: '67', kicked: false, values: 0, named: true }],
    [null, { kind: 'star', numeral: '✶', kicked: false, values: 0, named: true }],
  ])('shows the age %s on a birthday', (birthdayYears, shape) => {
    const parts = [plain('Alles Gute zum Geburtstag, '), named('Gerd'), plain('!')];

    expect(shapeOf(headSplitOf({ moment: 'birthday', parts, birthdayYears }))).toEqual(shape);
  });

  it.each(LAB_GREETINGS.map((greeting) => [greeting.slug, greeting] as const))(
    'keeps every word of the headline in reading order for %s',
    (_, greeting) => {
      const parts = labViewOf(greeting).parts;
      const act = greetingActAt(new Date(greeting.at), greeting.viewer);
      const split = headSplitOf({ moment: act.moment, parts, birthdayYears: 32 });
      const lead = split.kind === 'number' ? [split.kicker ?? '', split.numeral] : [];
      const names = parts.filter((part) => part.role === 'name').map((part) => part.text);
      const shown = [...lead, toGreetingText(split.sentence)].join(' ');

      expect(split.sentence.length).toBeGreaterThan(0);
      expect(wordsOf(shown, names)).toEqual(wordsOf(toGreetingText(parts), names));
      expect(split.sentence.filter((part) => part.role === 'name').length).toBe(names.length);
    },
  );
});

describe('birthdayYearsOf', () => {
  it.each([
    ['1959-10-20', 67],
    [null, null],
    ['2026-10-20', null],
  ])('turns %s into %s years on 2026-10-20', (birthDate, years) => {
    expect(birthdayYearsOf(birthDate, new Date('2026-10-20T09:30'))).toBe(years);
  });
});

describe('the moved salutation', () => {
  it.each([
    [[named('Kevin'), plain(', noch '), value('21'), plain(' Tage bis zum 11.11.')], '11.11.', '.'],
    [
      [named('Kevin'), plain(', noch '), value('9'), plain(' Tage bis Weiberfastnacht.')],
      'Weiberfastnacht',
      '.',
    ],
  ])('closes the sentence after the name', (parts, before, closing) => {
    const sentence = headSplitOf({ moment: 'daily', parts, birthdayYears: null }).sentence;
    const roles = sentence.slice(-3).map((part) => part.role);

    expect(roles).toEqual(['plain', 'name', 'plain']);
    expect(sentence.at(-4)?.text.endsWith(before)).toBe(true);
    expect(sentence.at(-1)?.text).toBe(closing);
  });
});
