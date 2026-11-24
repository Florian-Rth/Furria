import type { MentionKind } from '@furria/ui/rich-text';
import { MENTION_KINDS } from '@furria/ui/rich-text';
import { describe, expect, it } from 'vitest';
import { openRichText, richTextOf } from './rich-text-state';

const KINDS: readonly MentionKind[] = ['group', 'person'];

describe('richTextOf(openRichText(text))', () => {
  it.each([
    ['a bold link', '**[fett verlinkt](https://furria.de)** danach'],
    ['a bold person mention', 'Mit **@[Anna Becker](person:7)**.'],
    ['escaped punctuation', 'Preis\\* und \\[Klammer\\]'],
    ['a sentence opening like a list', '\\- kein Punkt'],
  ])('keeps %s', (_, text) => {
    expect(richTextOf(openRichText(text, KINDS))).toBe(text);
  });
});

describe('mention kinds of the host', () => {
  it.each<[string, readonly MentionKind[], string]>([
    ['keeps a hosted kind as a mention', MENTION_KINDS, '@[Ball](event:4)'],
    ['keeps another kind as literal text', KINDS, '@\\[Ball\\](event:4)'],
  ])('%s', (_, kinds, expected) => {
    expect(richTextOf(openRichText('@[Ball](event:4)', kinds))).toBe(expected);
  });
});
