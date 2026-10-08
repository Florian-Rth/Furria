import { describe, expect, it } from 'vitest';
import { readReadEntryIds, writeReadEntryIds } from './changelog-storage';

const createFakeStorage = (): Pick<Storage, 'getItem' | 'setItem'> => {
  const values = new Map<string, string>();

  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
  };
};

const storageHolding = (stored: string | null): Pick<Storage, 'getItem'> => ({
  getItem: () => stored,
});

describe('changelog storage', () => {
  it('round-trips read entry ids', () => {
    const storage = createFakeStorage();

    writeReadEntryIds(storage, ['website-p3-club-fe', 'website-p4-news-fe']);

    expect(readReadEntryIds(storage)).toEqual(['website-p3-club-fe', 'website-p4-news-fe']);
  });

  it.each([
    ['nothing stored', null],
    ['a value that is not JSON', '{ website-p4'],
    ['JSON of the wrong shape', '{"read":["website-p4-news-fe"]}'],
    ['a list that is not made of strings', '[1,2,3]'],
  ])('degrades to nothing read for %s', (_, stored) => {
    expect(readReadEntryIds(storageHolding(stored))).toEqual([]);
  });

  it('degrades to nothing read when storage access throws', () => {
    const throwingStorage: Pick<Storage, 'getItem'> = {
      getItem: () => {
        throw new Error('storage is not available');
      },
    };

    expect(readReadEntryIds(throwingStorage)).toEqual([]);
  });
});
