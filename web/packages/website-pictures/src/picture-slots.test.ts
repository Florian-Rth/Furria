import { describe, expect, it } from 'vitest';
import { fillCountOf, fillOf, orphansOf, slotsByPage, transferTargetsOf } from './picture-slots';

const pages = [
  { key: 'landing', title: 'Landing', path: '/' },
  { key: 'club', title: 'Club', path: '/club' },
  { key: 'site', title: 'Site', path: null },
];

const slots = {
  'club.story': {
    page: 'club',
    title: 'Story',
    description: 'Story',
    positions: ['landscape'],
    decorative: false,
  },
  'landing.hero': {
    page: 'landing',
    title: 'Hero',
    description: 'Hero',
    positions: ['landscape'],
    decorative: false,
  },
  'landing.stack': {
    page: 'landing',
    title: 'Stack',
    description: 'Stack',
    positions: ['landscape', 'portrait', 'landscape'],
    decorative: true,
  },
} as const;

describe('slotsByPage', () => {
  it('groups the slots under their pages in page order, leaving out pages without slots', () => {
    const grouped = slotsByPage(pages, slots).map((group) => ({
      page: group.page.key,
      slots: group.slots.map((slot) => slot.key),
    }));

    expect(grouped).toEqual([
      { page: 'landing', slots: ['landing.hero', 'landing.stack'] },
      { page: 'club', slots: ['club.story'] },
    ]);
  });
});

describe('fillOf', () => {
  it('reports every declared position as empty, filled or cut to another aspect', () => {
    const stored = [
      { slot: 'landing.stack', position: 1, aspect: 7 / 5 },
      { slot: 'landing.stack', position: 2, aspect: 7 / 5 },
      { slot: 'landing.hero', position: 3, aspect: 4 / 5 },
    ];

    const states = fillOf('landing.stack', slots['landing.stack'], stored).map((fill) => [
      fill.position,
      fill.state,
    ]);

    expect(states).toEqual([
      [1, 'filled'],
      [2, 'aspectMismatch'],
      [3, 'empty'],
    ]);
  });

  it('treats an aspect stored with float noise as the declared one', () => {
    const stored = [{ slot: 'landing.hero', position: 1, aspect: 1.4000000000000001 }];

    expect(fillOf('landing.hero', slots['landing.hero'], stored)[0]?.state).toBe('filled');
  });
});

describe('fillCountOf', () => {
  it.each([
    ['nothing stored', [], { filled: 0, total: 5 }],
    [
      'filled and mismatched positions, ignoring orphans',
      [
        { slot: 'landing.hero', position: 1, aspect: 7 / 5 },
        { slot: 'landing.stack', position: 2, aspect: 7 / 5 },
        { slot: 'landing.stack', position: 4, aspect: 7 / 5 },
        { slot: 'gone.slot', position: 1, aspect: 7 / 5 },
      ],
      { filled: 2, total: 5 },
    ],
  ])('counts %s', (_, stored, expected) => {
    expect(fillCountOf(slots, stored)).toEqual(expected);
  });
});

describe('orphansOf', () => {
  it('returns the stored pictures whose slot or position the catalogue no longer declares', () => {
    const stored = [
      { slot: 'landing.hero', position: 1, aspect: 7 / 5 },
      { slot: 'landing.hero', position: 2, aspect: 7 / 5 },
      { slot: 'landing.stack', position: 3, aspect: 7 / 5 },
      { slot: 'retired.banner', position: 1, aspect: 2 },
    ];

    expect(orphansOf(slots, stored)).toEqual([
      { slot: 'landing.hero', position: 2, aspect: 7 / 5 },
      { slot: 'retired.banner', position: 1, aspect: 2 },
    ]);
  });
});

describe('transferTargetsOf', () => {
  const stored = [
    { slot: 'landing.hero', position: 1, aspect: 7 / 5 },
    { slot: 'landing.stack', position: 1, aspect: 4 / 5 },
  ];

  it.each([
    [
      'a landscape orphan to every empty landscape position',
      7 / 5,
      [
        { slot: 'club.story', position: 1 },
        { slot: 'landing.stack', position: 3 },
      ],
    ],
    [
      'a portrait orphan to the empty portrait position',
      4 / 5,
      [{ slot: 'landing.stack', position: 2 }],
    ],
    ['an orphan whose aspect no empty position declares nowhere', 2, []],
  ])('offers %s', (_, aspect, expected) => {
    const orphan = { slot: 'retired.banner', position: 1, aspect };

    expect(transferTargetsOf(slots, orphan, stored)).toEqual(expected);
  });
});
