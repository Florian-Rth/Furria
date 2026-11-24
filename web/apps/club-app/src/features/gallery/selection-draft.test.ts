import { describe, expect, it } from 'vitest';
import type { PublicationState, SelectionEntry } from './selection-draft';
import { publicationStateOf } from './selection-draft';

describe('publicationStateOf', () => {
  const one: SelectionEntry[] = [{ mediaItemId: 1, caption: '' }];

  it.each<[string, number | null, string | null, SelectionEntry[], boolean, PublicationState]>([
    ['no session', null, null, one, false, { kind: 'noSession' }],
    ['empty selection', 2025, null, [], false, { kind: 'empty' }],
    ['published but edited', 2025, '2026-02-15T10:00:00Z', one, true, { kind: 'unsaved' }],
  ])('%s', (_case, sessionStartYear, publishedAt, draft, dirty, expected) => {
    expect(publicationStateOf({ sessionStartYear, publishedAt }, draft, dirty)).toEqual(expected);
  });
});
