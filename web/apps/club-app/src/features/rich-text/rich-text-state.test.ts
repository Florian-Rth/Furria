import type { MentionKind } from '@furria/ui/rich-text';
import { MENTION_KINDS, readRichText, writeRichText } from '@furria/ui/rich-text';
import { describe, expect, it } from 'vitest';
import type { RichTextCommand } from './rich-text-commands';
import type { RichTextState } from './rich-text-state';
import {
  editRichText,
  openRichText,
  richTextOf,
  richTextViewOf,
  settleRichText,
} from './rich-text-state';
import type { Mentionable } from './types';

const KINDS: readonly MentionKind[] = ['group', 'person'];

const mentionable = (fields: Partial<Mentionable>): Mentionable => ({
  kind: 'group',
  id: 'group:1',
  targetId: 1,
  name: 'Elferrat',
  line: 'Der Rat der Elf',
  tone: 'clay',
  initials: 'ER',
  image: null,
  isOffered: true,
  ...fields,
});

const MENTIONABLES = [
  mentionable({
    kind: 'person',
    id: 'person:7',
    targetId: 7,
    name: 'Anna Becker',
    line: 'Präsidentin',
  }),
  mentionable({ id: 'group:12', targetId: 12 }),
  mentionable({ id: 'group:13', targetId: 13, name: 'Kindergarde', isOffered: false }),
  mentionable({ id: 'group:14', targetId: 14, name: 'Rote Funken', line: 'Tanzgarde' }),
];

const edited = (state: RichTextState, commands: readonly RichTextCommand[]): RichTextState =>
  commands.reduce((current, command) => {
    const next = editRichText(current, command);
    if (next === null) {
      throw new Error(`${command.kind} does not apply`);
    }
    return next;
  }, state);

const typedWithMentionables = (typed: string): RichTextState =>
  edited(
    settleRichText(openRichText('', KINDS), {
      mentionables: MENTIONABLES,
      liveText: null,
      changedMark: '',
    }),
    [{ kind: 'type', text: typed }],
  );

describe('richTextOf(openRichText(text))', () => {
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

describe('editRichText', () => {
  it.each<[string, string, RichTextCommand[], string]>([
    [
      'escapes markup typed as text',
      '',
      [{ kind: 'type', text: '1. *Stern* [x]' }],
      '1\\. \\*Stern\\* \\[x\\]',
    ],
    [
      'turns a paragraph into a subheading',
      'Titel\n\nText',
      [{ kind: 'heading' }],
      '## Titel\n\nText',
    ],
    [
      'turns a subheading back into a paragraph',
      '## Titel\n\nText',
      [{ kind: 'heading' }],
      'Titel\n\nText',
    ],
    ['wraps a paragraph into a list', 'Punkt\n\nText', [{ kind: 'list' }], '- Punkt\n\nText'],
    ['lifts a list item into a paragraph', '- Punkt', [{ kind: 'paragraph' }], 'Punkt'],
    [
      'writes bold while typing',
      '',
      [{ kind: 'bold' }, { kind: 'type', text: 'fett' }],
      '**fett**',
    ],
    [
      'inserts a link at the caret',
      '',
      [
        { kind: 'type', text: 'Mehr bei ' },
        { kind: 'link', href: 'https://furria.de' },
      ],
      'Mehr bei [https://furria.de](https://furria.de)',
    ],
  ])('%s', (_, text, commands, expected) => {
    expect(richTextOf(edited(openRichText(text, KINDS), commands))).toBe(expected);
  });

  it.each<[string, string, RichTextCommand]>([
    ['a subheading inside a list', '- Punkt', { kind: 'heading' }],
    ['a list from a subheading', '## Titel', { kind: 'list' }],
    ['a link to no web address', 'Text', { kind: 'link', href: 'furria.de' }],
    ['a mention choice without an open picker', 'Text', { kind: 'choose-mention', id: 'group:12' }],
    ['a relabel without an edited mention', 'Text', { kind: 'relabel-mention', label: 'Rat' }],
  ])('refuses %s', (_, text, command) => {
    expect(editRichText(openRichText(text, KINDS), command)).toBeNull();
  });

  it('keeps a toggled subheading through the text syntax', () => {
    const text = richTextOf(edited(openRichText('Titel\n\nText', KINDS), [{ kind: 'heading' }]));

    expect(writeRichText(readRichText(text, KINDS))).toBe(text);
    expect(richTextOf(openRichText(text, KINDS))).toBe(text);
  });

  it('reports the caret block as a subheading after the toggle', () => {
    const state = edited(openRichText('Titel', KINDS), [{ kind: 'heading' }]);

    expect(richTextViewOf(state).format).toEqual({ block: 'heading', bold: false, link: null });
  });
});

describe('mentions', () => {
  it('writes a chosen mention into the text', () => {
    const state = edited(typedWithMentionables('Wir grüßen @an'), [
      { kind: 'choose-mention', id: 'person:7' },
    ]);

    expect(richTextOf(state)).toBe('Wir grüßen @[Anna Becker](person:7)');
    expect(richTextViewOf(state).picker).toBeNull();
  });

  it.each([
    ['offers only offered targets, groups first', '@', ['group:12', 'group:14', 'person:7']],
    ['matches the start of any word in name or line', 'Die @tanz', ['group:14']],
    ['matches an office', '@präs', ['person:7']],
    ['never offers a hidden group', '@kinder', []],
  ])('%s', (_, typed, expected) => {
    const picker = richTextViewOf(typedWithMentionables(typed)).picker;

    expect(picker?.choices.map((choice) => choice.id)).toEqual(expected);
  });

  it.each<[string, RichTextCommand[], string | null]>([
    ['starts on the first choice', [], 'group:12'],
    ['steps to the next choice', [{ kind: 'step-mention', step: 'next' }], 'group:14'],
    [
      'wraps past the last choice',
      [
        { kind: 'step-mention', step: 'next' },
        { kind: 'step-mention', step: 'next' },
        { kind: 'step-mention', step: 'next' },
      ],
      'group:12',
    ],
    ['wraps before the first choice', [{ kind: 'step-mention', step: 'previous' }], 'person:7'],
    [
      'returns to the first choice when the query changes',
      [
        { kind: 'step-mention', step: 'next' },
        { kind: 'type', text: 'r' },
      ],
      'group:12',
    ],
  ])('%s', (_, commands, expected) => {
    const state = edited(typedWithMentionables('@'), commands);

    expect(richTextViewOf(state).picker?.activeId).toBe(expected);
  });

  it.each<[string, string, RichTextCommand[]]>([
    ['closes the picker when dismissed', '@an', [{ kind: 'dismiss-mention' }]],
    [
      'keeps a dismissed picker closed while typing on',
      '@an',
      [{ kind: 'dismiss-mention' }, { kind: 'type', text: 'n' }],
    ],
    ['opens no picker inside a word', 'mail@an', []],
  ])('%s', (_, typed, commands) => {
    expect(richTextViewOf(edited(typedWithMentionables(typed), commands)).picker).toBeNull();
  });

  it('orders every kind of target', () => {
    const mentionables = [
      mentionable({ kind: 'album', id: 'album:1', name: 'Album' }),
      mentionable({ kind: 'news-post', id: 'news-post:1', name: 'Meldung' }),
      mentionable({ kind: 'event', id: 'event:1', name: 'Ball' }),
      mentionable({ kind: 'calendar-entry', id: 'calendar-entry:1', name: 'Probe' }),
      mentionable({ kind: 'person', id: 'person:1', name: 'Anna' }),
      mentionable({ kind: 'group', id: 'group:1', name: 'Garde' }),
    ];
    const state = edited(
      settleRichText(openRichText('', KINDS), { mentionables, liveText: null, changedMark: '' }),
      [{ kind: 'type', text: '@' }],
    );

    expect(richTextViewOf(state).picker?.choices.map((choice) => choice.kind)).toEqual([
      'group',
      'person',
      'calendar-entry',
      'event',
      'news-post',
      'album',
    ]);
  });

  it('starts a mention with a space after a word', () => {
    const state = edited(typedWithMentionables('Gruß an'), [{ kind: 'start-mention' }]);

    expect(richTextViewOf(state).picker?.choices).toHaveLength(3);
  });
});
