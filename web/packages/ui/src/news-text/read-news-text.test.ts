import { describe, expect, it } from 'vitest';
import type { NewsBlock, NewsInline } from './news-text-model';
import { readNewsInlines, readNewsText } from './read-news-text';

const plain = (text: string): NewsInline => ({ kind: 'text', text, bold: false, href: null });
const bold = (text: string): NewsInline => ({ kind: 'text', text, bold: true, href: null });

describe('readNewsText', () => {
  it.each<[string, string, NewsBlock[]]>([
    ['nothing', '', []],
    ['blank lines', '\n  \n\n', []],
    ['a paragraph', 'Ein Absatz.', [{ kind: 'paragraph', inlines: [plain('Ein Absatz.')] }]],
    [
      'paragraphs split by blank lines',
      'Erster.\n\nZweiter.',
      [
        { kind: 'paragraph', inlines: [plain('Erster.')] },
        { kind: 'paragraph', inlines: [plain('Zweiter.')] },
      ],
    ],
    [
      'adjacent lines as one paragraph',
      'eins\nzwei',
      [{ kind: 'paragraph', inlines: [plain('eins zwei')] }],
    ],
    [
      'windows line endings',
      'eins\r\n\r\nzwei',
      [
        { kind: 'paragraph', inlines: [plain('eins')] },
        { kind: 'paragraph', inlines: [plain('zwei')] },
      ],
    ],
    [
      'a subheading',
      '## Was jetzt passiert',
      [{ kind: 'heading', inlines: [plain('Was jetzt passiert')] }],
    ],
    [
      'a subheading right above its paragraph',
      '## Titel\nText',
      [
        { kind: 'heading', inlines: [plain('Titel')] },
        { kind: 'paragraph', inlines: [plain('Text')] },
      ],
    ],
    [
      'a flat list',
      '- eins\n- zwei',
      [{ kind: 'list', items: [[plain('eins')], [plain('zwei')]] }],
    ],
    [
      'a list interrupting a paragraph',
      'Davor\n- Punkt\nDanach',
      [
        { kind: 'paragraph', inlines: [plain('Davor')] },
        { kind: 'list', items: [[plain('Punkt')]] },
        { kind: 'paragraph', inlines: [plain('Danach')] },
      ],
    ],
    [
      'two lists split by a blank line',
      '- a\n\n- b',
      [
        { kind: 'list', items: [[plain('a')]] },
        { kind: 'list', items: [[plain('b')]] },
      ],
    ],
    [
      'other heading levels as text',
      '### Tiefer',
      [{ kind: 'paragraph', inlines: [plain('### Tiefer')] }],
    ],
    [
      'an escaped heading marker as text',
      '\\## kein Titel',
      [{ kind: 'paragraph', inlines: [plain('## kein Titel')] }],
    ],
    [
      'an escaped list marker as text',
      '\\- kein Punkt',
      [{ kind: 'paragraph', inlines: [plain('- kein Punkt')] }],
    ],
    [
      'a numbered list as text',
      '1\\. FC Köln',
      [{ kind: 'paragraph', inlines: [plain('1. FC Köln')] }],
    ],
  ])('reads %s', (_, text, expected) => {
    expect(readNewsText(text)).toEqual(expected);
  });
});

describe('readNewsInlines', () => {
  it.each<[string, string, NewsInline[]]>([
    ['bold', 'Es sind **4,2 Tonnen** da.', [plain('Es sind '), bold('4,2 Tonnen'), plain(' da.')]],
    ['an unclosed bold marker as text', 'nur ** ein Stern', [plain('nur ** ein Stern')]],
    ['a single asterisk as text', 'Preis*', [plain('Preis*')]],
    [
      'an external link',
      'Mehr [beim Museum](https://museum.de/a).',
      [
        plain('Mehr '),
        { kind: 'text', text: 'beim Museum', bold: false, href: 'https://museum.de/a' },
        plain('.'),
      ],
    ],
    [
      'a bold link',
      '**[fett](http://furria.de)**',
      [{ kind: 'text', text: 'fett', bold: true, href: 'http://furria.de' }],
    ],
    ['a script address as text', '[x](javascript:alert)', [plain('[x](javascript:alert)')]],
    ['an address with whitespace as text', '[x](https://a .de)', [plain('[x](https://a .de)')]],
    ['a link with a blank label as text', '[ ](https://a.de)', [plain('[ ](https://a.de)')]],
    [
      'a group mention',
      'Der @[Elferrat](group:12) tagt.',
      [
        plain('Der '),
        { kind: 'mention', mention: { kind: 'group', id: 12, label: 'Elferrat' }, bold: false },
        plain(' tagt.'),
      ],
    ],
    [
      'a bold person mention',
      '**@[Anna Becker](person:7)**',
      [{ kind: 'mention', mention: { kind: 'person', id: 7, label: 'Anna Becker' }, bold: true }],
    ],
    [
      'an escaped bracket in a mention label',
      '@[Elf\\]rat](group:1)',
      [{ kind: 'mention', mention: { kind: 'group', id: 1, label: 'Elf]rat' }, bold: false }],
    ],
    ['a mention of another kind as text', '@[X](event:1)', [plain('@[X](event:1)')]],
    ['a mention of id zero as text', '@[X](group:0)', [plain('@[X](group:0)')]],
    ['a mention of a non-numeric id as text', '@[X](group:abc)', [plain('@[X](group:abc)')]],
    ['escaped punctuation', 'Preis\\* und \\[Klammer\\]', [plain('Preis* und [Klammer]')]],
    ['a backslash before a letter as text', 'C:\\Weg', [plain('C:\\Weg')]],
    ['html as text', '<b>fett</b>', [plain('<b>fett</b>')]],
    [
      'an image as text',
      '![Bild](https://a.de/b.png)',
      [plain('!'), { kind: 'text', text: 'Bild', bold: false, href: 'https://a.de/b.png' }],
    ],
  ])('reads %s', (_, source, expected) => {
    expect(readNewsInlines(source)).toEqual(expected);
  });
});
