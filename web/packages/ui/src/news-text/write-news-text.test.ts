import { describe, expect, it } from 'vitest';
import type { NewsBlock } from './news-text-model';
import { readNewsText } from './read-news-text';
import { writeNewsText } from './write-news-text';

describe('writeNewsText(readNewsText(text))', () => {
  it.each([
    ['a paragraph', 'Ein Absatz.'],
    ['two paragraphs', 'Erster Absatz.\n\nZweiter Absatz.'],
    ['a subheading', '## Was jetzt passiert\n\nText.'],
    ['a flat list', '- Termin: 11.11.\n- Ort: überall'],
    ['bold', 'Es lagern **4,2 Tonnen** Konfetti.'],
    ['a link', 'Mehr bei [dem Museum](https://www.deutsches-museum.de).'],
    ['a group mention', 'Der @[Elferrat](group:12) tagt.'],
    ['a bold person mention', 'Mit **@[Anna Becker](person:7)**.'],
    ['escaped punctuation', 'Preis\\* und \\[Klammer\\]'],
    ['a sentence opening like a heading', '\\## kein Titel'],
    ['a sentence opening like a list', '\\- kein Punkt'],
    ['a sentence opening like a numbered list', '1\\. FC Köln'],
    ['a bold link', '**[fett verlinkt](https://furria.de)** danach'],
    ['an escaped exclamation before a link', 'Achtung\\![hier](https://furria.de)'],
  ])('keeps %s', (_, text) => {
    expect(writeNewsText(readNewsText(text))).toBe(text);
  });
});

describe('writeNewsText', () => {
  it.each<[string, NewsBlock[], string]>([
    [
      'markup characters escaped',
      [
        {
          kind: 'paragraph',
          inlines: [{ kind: 'text', text: 'a*b [c] `d` \\ <br>', bold: false, href: null }],
        },
      ],
      'a\\*b \\[c\\] \\`d\\` \\\\ \\<br>',
    ],
    [
      'a lone less-than sign kept',
      [{ kind: 'paragraph', inlines: [{ kind: 'text', text: '3 < 4', bold: false, href: null }] }],
      '3 < 4',
    ],
    [
      'structure openers escaped',
      [
        {
          kind: 'paragraph',
          inlines: [{ kind: 'text', text: '> Zitat', bold: false, href: null }],
        },
        { kind: 'paragraph', inlines: [{ kind: 'text', text: '+ plus', bold: false, href: null }] },
        { kind: 'paragraph', inlines: [{ kind: 'text', text: '___', bold: false, href: null }] },
        { kind: 'paragraph', inlines: [{ kind: 'text', text: '===', bold: false, href: null }] },
        {
          kind: 'paragraph',
          inlines: [{ kind: 'text', text: '~~~ code', bold: false, href: null }],
        },
        {
          kind: 'paragraph',
          inlines: [{ kind: 'text', text: '2) zwei', bold: false, href: null }],
        },
      ],
      '\\> Zitat\n\n\\+ plus\n\n\\___\n\n\\===\n\n\\~~~ code\n\n2\\) zwei',
    ],
    [
      'whitespace collapsed and trimmed',
      [
        {
          kind: 'paragraph',
          inlines: [
            { kind: 'text', text: '  eins\n\tzwei ', bold: false, href: null },
            { kind: 'text', text: ' drei  ', bold: true, href: null },
          ],
        },
      ],
      'eins zwei ** drei**',
    ],
    [
      'a blank bold run written plain',
      [
        {
          kind: 'paragraph',
          inlines: [
            { kind: 'text', text: 'a', bold: false, href: null },
            { kind: 'text', text: ' ', bold: true, href: null },
            { kind: 'text', text: 'b', bold: false, href: null },
          ],
        },
      ],
      'a b',
    ],
    [
      'a mention before a link guarded',
      [
        {
          kind: 'paragraph',
          inlines: [
            { kind: 'text', text: 'Mail @', bold: false, href: null },
            { kind: 'text', text: 'uns', bold: false, href: 'https://furria.de' },
          ],
        },
      ],
      'Mail \\@[uns](https://furria.de)',
    ],
    [
      'parentheses in an address encoded',
      [
        {
          kind: 'paragraph',
          inlines: [
            {
              kind: 'text',
              text: 'Wiki',
              bold: false,
              href: 'https://de.wikipedia.org/wiki/K_(V)',
            },
          ],
        },
      ],
      '[Wiki](https://de.wikipedia.org/wiki/K_%28V%29)',
    ],
    [
      'an invalid address written as plain text',
      [
        {
          kind: 'paragraph',
          inlines: [{ kind: 'text', text: 'klick', bold: false, href: 'javascript:x' }],
        },
      ],
      'klick',
    ],
    [
      'a mention with an invalid id written as its label',
      [
        {
          kind: 'paragraph',
          inlines: [
            { kind: 'mention', mention: { kind: 'group', id: 0, label: 'Elferrat' }, bold: false },
          ],
        },
      ],
      'Elferrat',
    ],
    [
      'a mention with a blank label dropped',
      [
        {
          kind: 'paragraph',
          inlines: [
            { kind: 'text', text: 'Hallo ', bold: false, href: null },
            { kind: 'mention', mention: { kind: 'group', id: 3, label: ' ' }, bold: false },
          ],
        },
      ],
      'Hallo',
    ],
    [
      'empty blocks and items dropped',
      [
        { kind: 'heading', inlines: [{ kind: 'text', text: '  ', bold: false, href: null }] },
        { kind: 'paragraph', inlines: [] },
        { kind: 'list', items: [[], [{ kind: 'text', text: 'eins', bold: false, href: null }]] },
        { kind: 'list', items: [[]] },
      ],
      '- eins',
    ],
  ])('writes %s', (_, blocks, expected) => {
    expect(writeNewsText(blocks)).toBe(expected);
  });
});
