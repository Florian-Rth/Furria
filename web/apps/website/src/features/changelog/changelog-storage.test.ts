import { describe, expect, it } from 'vitest';
import { readReadEntryIds, writeReadEntryIds } from './changelog-storage';

const createFakeStorage = (initialValue?: string): Pick<Storage, 'getItem' | 'setItem'> => {
  const values = new Map<string, string>();

  if (initialValue !== undefined) {
    values.set('furria.changelog.read', initialValue);
  }

  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
  };
};

const createThrowingStorage = (): Pick<Storage, 'getItem'> => ({
  getItem: () => {
    throw new Error('storage is not available');
  },
});

describe('changelog storage', () => {
  it('reports nothing read for an empty storage', () => {
    expect(readReadEntryIds(createFakeStorage())).toEqual([]);
  });

  it('round-trips read entry ids', () => {
    const storage = createFakeStorage();

    writeReadEntryIds(storage, ['website-p3-club-fe', 'website-p4-news-fe']);

    expect(readReadEntryIds(storage)).toEqual(['website-p3-club-fe', 'website-p4-news-fe']);
  });

  it('degrades to nothing read for a value that is not JSON', () => {
    expect(readReadEntryIds(createFakeStorage('{ website-p4'))).toEqual([]);
  });

  it('degrades to nothing read for JSON of the wrong shape', () => {
    expect(readReadEntryIds(createFakeStorage('{"read":["website-p4-news-fe"]}'))).toEqual([]);
  });

  it('degrades to nothing read for a list that is not made of strings', () => {
    expect(readReadEntryIds(createFakeStorage('[1,2,3]'))).toEqual([]);
  });

  it('degrades to nothing read when storage access throws', () => {
    expect(readReadEntryIds(createThrowingStorage())).toEqual([]);
  });
});
