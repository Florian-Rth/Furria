import { describe, expect, it } from 'vitest';
import type { WebsitePicture } from './schemas';
import { copySourcesOf, hubPositionsOf, websiteBoardOf } from './website-board';

const pages = [
  { key: 'landing', title: 'Landing', path: '/' },
  { key: 'events', title: 'Events', path: '/events' },
] as const;

const slots = {
  'landing.hero': {
    page: 'landing',
    title: 'Hero',
    description: 'Hero',
    positions: ['landscape'],
    decorative: false,
  },
  'events.strip': {
    page: 'events',
    title: 'Strip',
    description: 'Strip',
    positions: ['landscape', 'landscape', 'portrait'],
    decorative: true,
  },
} as const;

const stored = (
  slot: string,
  position: number,
  overrides: { aspect?: number; alt?: string | null; state?: 'processing' | 'ready' | 'failed' },
): WebsitePicture => ({
  slot,
  position,
  mediaItemId: position,
  aspect: overrides.aspect ?? 7 / 5,
  alt: overrides.alt ?? null,
  picture: {
    state: overrides.state ?? 'ready',
    picture: null,
    uncroppedUrl: overrides.state === 'ready' || overrides.state === undefined ? '/u' : null,
    crop: null,
  },
  updatedAt: '2026-10-12T10:00:00+00:00',
  updatedBy: null,
});

describe('websiteBoardOf', () => {
  it('counts filled positions, missing alt texts and stale cuts across the site', () => {
    const board = websiteBoardOf(pages, slots, [
      stored('landing.hero', 1, {}),
      stored('events.strip', 1, {}),
      stored('events.strip', 3, { aspect: 7 / 5 }),
      stored('retired.banner', 1, {}),
    ]);

    expect(board.summary).toEqual({ filled: 3, total: 4, altMissing: 1, mismatched: 1 });
    expect(board.orphans.map((orphan) => [orphan.slot, orphan.orphan])).toEqual([
      ['retired.banner', true],
    ]);
  });

  it.each([
    ['nothing stored', [], 'empty'],
    [
      'a stored picture without its required alt text',
      [stored('landing.hero', 1, {})],
      'altMissing',
    ],
    ['a described picture', [stored('landing.hero', 1, { alt: 'Garde' })], null],
    [
      'a picture still developing',
      [stored('landing.hero', 1, { alt: 'Garde', state: 'processing' })],
      'processing',
    ],
    ['a picture that failed', [stored('landing.hero', 1, { state: 'failed' })], 'failed'],
    ['a cut of another format', [stored('landing.hero', 1, { aspect: 4 / 5 })], 'mismatch'],
  ])('flags the slot for %s', (_, pictures, flag) => {
    const board = websiteBoardOf(pages, slots, pictures);

    expect(board.pages[0]?.slots[0]?.flag).toBe(flag);
  });

  it('never asks a decorative slot for alt text', () => {
    const board = websiteBoardOf(pages, slots, [stored('events.strip', 2, {})]);

    expect(board.pages[1]?.slots[0]?.flag).toBeNull();
  });
});

describe('copySourcesOf', () => {
  it('offers every other shown picture whose original can be cut again', () => {
    const board = websiteBoardOf(pages, slots, [
      stored('landing.hero', 1, {}),
      stored('events.strip', 1, {}),
      stored('events.strip', 2, { state: 'processing' }),
      stored('events.strip', 3, { aspect: 7 / 5 }),
    ]);

    const sources = copySourcesOf(board, { slot: 'events.strip', position: 1 }).map((source) => [
      source.slot,
      source.position,
    ]);

    expect(sources).toEqual([
      ['landing.hero', 1],
      ['events.strip', 3],
    ]);
  });
});

describe('hubPositionsOf', () => {
  it('leads with the filled positions in page order, then the empty ones, without orphans', () => {
    const board = websiteBoardOf(pages, slots, [
      stored('events.strip', 2, {}),
      stored('retired.banner', 1, {}),
    ]);

    expect(hubPositionsOf(board).map((position) => [position.slot, position.position])).toEqual([
      ['events.strip', 2],
      ['landing.hero', 1],
      ['events.strip', 1],
      ['events.strip', 3],
    ]);
  });
});
