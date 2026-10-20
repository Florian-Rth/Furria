import { describe, expect, it } from 'vitest';
import type { PlannedEvent } from './event-plan';
import { paneActionOf } from './pane-actions';

const TODAY = '2026-10-19';

const planned = (overrides: Partial<PlannedEvent> = {}): PlannedEvent => ({
  eventId: 1,
  startsAt: '2027-01-16T18:11:00Z',
  status: 'presaleScheduled',
  isOver: false,
  publishedAt: '2026-10-01T10:00:00Z',
  createdAt: '2026-10-01T10:00:00Z',
  priceCents: 1900,
  presaleStartsAt: '2026-11-14T10:00:00Z',
  detailsMissing: [],
  ticketRequests: { open: 0, cards: 0, oldestRequestedAt: null },
  review: { publishedAlbums: 0, publishedNews: 0 },
  steps: [
    { step: 'details', state: 'done', dueOn: '2026-10-18', opensOn: null },
    { step: 'tickets', state: 'open', dueOn: '2026-11-17', opensOn: null },
    { step: 'review', state: 'waiting', dueOn: '2027-01-30', opensOn: '2027-01-17' },
  ],
  currentStep: 'tickets',
  ...overrides,
});

const unpublished = { publishedAt: null };

describe('paneActionOf', () => {
  it.each([
    { name: 'website online → view', pane: 'website' as const, overrides: {}, kind: 'view' },
    {
      name: 'website ready → publish',
      pane: 'website' as const,
      overrides: { ...unpublished, detailsMissing: ['published' as const] },
      kind: 'publish',
    },
    {
      name: 'website blocked → Eckdaten',
      pane: 'website' as const,
      overrides: { ...unpublished, detailsMissing: ['venue' as const, 'published' as const] },
      kind: 'step',
    },
    {
      name: 'missing picture → picture desk',
      pane: 'details' as const,
      overrides: { detailsMissing: ['venue' as const, 'picture' as const] },
      kind: 'picture',
    },
    {
      name: 'missing venue → editor',
      pane: 'details' as const,
      overrides: { detailsMissing: ['venue' as const] },
      kind: 'editDetails',
    },
    {
      name: 'complete and unpublished → publish',
      pane: 'details' as const,
      overrides: { ...unpublished, detailsMissing: ['published' as const] },
      kind: 'publish',
    },
    {
      name: 'missing price → ticket editor',
      pane: 'tickets' as const,
      overrides: { priceCents: null },
      kind: 'editTickets',
    },
    {
      name: 'sold out without a price → nothing left',
      pane: 'tickets' as const,
      overrides: { priceCents: null, status: 'soldOut' as const },
      kind: 'none',
    },
    {
      name: 'open requests → handled in the list',
      pane: 'requests' as const,
      overrides: {
        ticketRequests: { open: 2, cards: 4, oldestRequestedAt: '2026-10-18T09:00:00Z' },
      },
      kind: 'none',
    },
    {
      name: 'open review → album',
      pane: 'review' as const,
      overrides: {
        steps: [
          { step: 'review' as const, state: 'open' as const, dueOn: '2026-11-01', opensOn: null },
        ],
      },
      kind: 'album',
    },
    {
      name: 'cancelled → nothing',
      pane: 'details' as const,
      overrides: { status: 'cancelled' as const, detailsMissing: ['picture' as const] },
      kind: 'none',
    },
  ])('$name', ({ pane, overrides, kind }) => {
    expect(
      paneActionOf({ event: planned(overrides), pane, todayIsoDay: TODAY, addsAlbums: true }).kind,
    ).toBe(kind);
  });

  it('moves on to the next pending step once a step is done', () => {
    expect(
      paneActionOf({ event: planned(), pane: 'details', todayIsoDay: TODAY, addsAlbums: true }),
    ).toEqual({ kind: 'step', pane: 'tickets' });
  });

  it('wraps around to an earlier pending step', () => {
    const event = planned({
      publishedAt: null,
      detailsMissing: ['published'],
      steps: [
        { step: 'details', state: 'done', dueOn: '2026-10-18', opensOn: null },
        { step: 'tickets', state: 'done', dueOn: '2026-11-17', opensOn: null },
        { step: 'review', state: 'waiting', dueOn: '2027-01-30', opensOn: '2027-01-17' },
      ],
      currentStep: null,
    });

    expect(paneActionOf({ event, pane: 'tickets', todayIsoDay: TODAY, addsAlbums: true })).toEqual({
      kind: 'step',
      pane: 'website',
    });
  });

  it('skips the album without the right to add one', () => {
    const event = planned({
      steps: [{ step: 'review', state: 'open', dueOn: '2026-11-01', opensOn: null }],
    });

    expect(
      paneActionOf({ event, pane: 'review', todayIsoDay: TODAY, addsAlbums: false }).kind,
    ).not.toBe('album');
  });
});
