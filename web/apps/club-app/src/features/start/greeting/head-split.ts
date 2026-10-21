import type { GreetingMoment } from './greeting-act';
import type { GreetingPart } from './greeting-copy';
import { toGreetingText } from './greeting-copy';

export type HeadSplitKind = 'number' | 'age' | 'star';

export interface HeadSplit {
  kind: HeadSplitKind;
  numeral: string;
  kicker: string | null;
  sentence: GreetingPart[];
}

export interface HeadSplitSource {
  moment: GreetingMoment;
  parts: readonly GreetingPart[];
  birthdayYears: number | null;
}

export const HEAD_STAR = '✶';

const NUMERAL = /^\d+(:\d{2})?$/u;
const LEADING_SPACE = /^\s+/u;
const LEAD_PUNCTUATION = /^[\s,]+|[\s,]+$/gu;
const CLOSING = /([.!])$/u;
const DATE_DOT = /\d\.$/u;
const NAME_GAP = ', ';
const WORD_GAP = /\s+/u;
const KICKER_WORDS = 2;
const YEAR_END = 4;

const wordCountOf = (text: string): number =>
  text.split(WORD_GAP).filter((word) => word !== '').length;

const starOf = (parts: readonly GreetingPart[]): HeadSplit => ({
  kind: 'star',
  numeral: HEAD_STAR,
  kicker: null,
  sentence: [...parts],
});

const trailOf = (parts: readonly GreetingPart[]): GreetingPart[] =>
  parts
    .map((part, index) =>
      index === 0 ? { ...part, text: part.text.replace(LEADING_SPACE, '') } : part,
    )
    .filter((part) => part.text !== '');

const closingOf = (text: string): { text: string; mark: string } => {
  if (DATE_DOT.test(text)) {
    return { text, mark: '.' };
  }

  const mark = CLOSING.exec(text)?.[1];

  return mark === undefined ? { text, mark: '' } : { text: text.slice(0, -1), mark };
};

const addressedOf = (sentence: GreetingPart[], names: GreetingPart[]): GreetingPart[] => {
  const last = sentence.at(-1);

  if (names.length === 0 || last === undefined) {
    return sentence;
  }

  const closing = closingOf(last.text);

  const addressed: GreetingPart[] = [
    ...sentence.slice(0, -1),
    { ...last, text: closing.text },
    { text: NAME_GAP, role: 'plain' },
    ...names,
    { text: closing.mark, role: 'plain' },
  ];

  return addressed.filter((part) => part.text !== '');
};

export const birthdayYearsOf = (birthDate: string | null, now: Date): number | null => {
  if (birthDate === null) {
    return null;
  }

  const years = now.getFullYear() - Number(birthDate.slice(0, YEAR_END));

  return years > 0 ? years : null;
};

export const headSplitOf = ({ moment, parts, birthdayYears }: HeadSplitSource): HeadSplit => {
  if (moment === 'birthday') {
    return birthdayYears === null
      ? starOf(parts)
      : { kind: 'age', numeral: String(birthdayYears), kicker: null, sentence: [...parts] };
  }

  const at = parts.findIndex((part) => part.role === 'value' && NUMERAL.test(part.text));
  const numeral = parts[at];

  if (numeral === undefined) {
    return starOf(parts);
  }

  const lead = parts.slice(0, at);
  const names = lead.filter((part) => part.role === 'name');
  const kicker = toGreetingText(lead.filter((part) => part.role !== 'name'))
    .replace(LEAD_PUNCTUATION, '')
    .trim();
  const trail = trailOf(parts.slice(at + 1));

  if (wordCountOf(kicker) > KICKER_WORDS || trail.length === 0) {
    return starOf(parts);
  }

  return {
    kind: 'number',
    numeral: numeral.text,
    kicker: kicker === '' ? null : kicker,
    sentence: addressedOf(trail, names),
  };
};
