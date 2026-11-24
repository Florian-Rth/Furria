import { describe, expect, it } from 'vitest';
import { fillOf, orphansOf, transferTargetsOf } from './picture-slots';

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
  ])('offers %s', (_, aspect, expected) => {
    const orphan = { slot: 'retired.banner', position: 1, aspect };

    expect(transferTargetsOf(slots, orphan, stored)).toEqual(expected);
  });
});
