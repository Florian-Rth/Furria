import { describe, expect, it } from 'vitest';
import type { HistoryStack, HistoryTops } from './history-turn';
import { redoStackOf, undoStackOf } from './history-turn';

describe('undoStackOf', () => {
  it.each<{ tops: HistoryTops; stack: HistoryStack | null }>([
    { tops: { document: null, visit: null }, stack: null },
    { tops: { document: 5, visit: null }, stack: 'document' },
    { tops: { document: null, visit: 5 }, stack: 'visit' },
    { tops: { document: 9, visit: 5 }, stack: 'document' },
    { tops: { document: 5, visit: 9 }, stack: 'visit' },
  ])('undoes the newest edit first: $tops', ({ tops, stack }) => {
    expect(undoStackOf(tops)).toBe(stack);
  });
});

describe('redoStackOf', () => {
  const noUndo: HistoryTops = { document: null, visit: null };

  it.each<{ redos: HistoryTops; undos: HistoryTops; stack: HistoryStack | null }>([
    { redos: { document: null, visit: null }, undos: noUndo, stack: null },
    { redos: { document: 5, visit: null }, undos: noUndo, stack: 'document' },
    { redos: { document: null, visit: 5 }, undos: noUndo, stack: 'visit' },
    { redos: { document: 9, visit: 5 }, undos: noUndo, stack: 'visit' },
    { redos: { document: 5, visit: 9 }, undos: noUndo, stack: 'document' },
    { redos: { document: 5, visit: null }, undos: { document: null, visit: 7 }, stack: null },
    { redos: { document: 5, visit: null }, undos: { document: null, visit: 3 }, stack: 'document' },
    { redos: { document: null, visit: 5 }, undos: { document: 7, visit: null }, stack: null },
  ])(
    'redoes the last undone edit unless a newer edit followed: $redos $undos',
    ({ redos, undos, stack }) => {
      expect(redoStackOf(redos, undos)).toBe(stack);
    },
  );
});
