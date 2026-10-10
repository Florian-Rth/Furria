import { describe, expect, it } from 'vitest';
import { newsDocOf, newsTextOf, newsTextSchema } from './news-prose';

const { nodes, marks } = newsTextSchema;

describe('newsTextOf(newsDocOf(text))', () => {
  it.each([
    ['nothing', ''],
    ['a paragraph', 'Ein Absatz.'],
    ['a subheading and a paragraph', '## Was jetzt passiert\n\nText.'],
    ['a flat list', '- Termin: 11.11.\n- Ort: überall'],
    ['bold', 'Es lagern **4,2 Tonnen** Konfetti.'],
    ['a link', 'Mehr bei [dem Museum](https://www.deutsches-museum.de).'],
    ['a bold link', '**[fett verlinkt](https://furria.de)** danach'],
    ['a group mention', 'Der @[Elferrat](group:12) tagt.'],
    ['a bold person mention', 'Mit **@[Anna Becker](person:7)**.'],
    ['escaped punctuation', 'Preis\\* und \\[Klammer\\]'],
    ['a sentence opening like a list', '\\- kein Punkt'],
  ])('keeps %s', (_, text) => {
    expect(newsTextOf(newsDocOf(text))).toBe(text);
  });
});

describe('newsTextOf', () => {
  it.each([
    [
      'markup typed as text escaped',
      nodes.doc.create(null, nodes.paragraph.create(null, newsTextSchema.text('1. *Stern* [x]'))),
      '1\\. \\*Stern\\* \\[x\\]',
    ],
    ['an empty document as nothing', nodes.doc.create(null, nodes.paragraph.create()), ''],
    [
      'a heading flattened to its words',
      nodes.doc.create(null, nodes.heading.create(null, newsTextSchema.text('  Titel '))),
      '## Titel',
    ],
    [
      'a mention with a bold mark',
      nodes.doc.create(
        null,
        nodes.paragraph.create(null, [
          nodes.mention.create({ kind: 'person', id: 3, label: 'Markus' }, null, [
            marks.strong.create(),
          ]),
        ]),
      ),
      '**@[Markus](person:3)**',
    ],
  ])('writes %s', (_, doc, expected) => {
    expect(newsTextOf(doc)).toBe(expected);
  });
});
