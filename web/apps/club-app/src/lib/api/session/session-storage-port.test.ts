import { describe, expect, it } from 'vitest';
import { readStoredToken, writeStoredToken } from './session-storage-port';

const buildFakeStorage = (initial: Record<string, string>): Storage => {
  const entries = { ...initial };

  return {
    get length(): number {
      return Object.keys(entries).length;
    },
    clear: (): void => {
      for (const key of Object.keys(entries)) {
        delete entries[key];
      }
    },
    getItem: (key: string): string | null => entries[key] ?? null,
    key: (index: number): string | null => Object.keys(entries)[index] ?? null,
    removeItem: (key: string): void => {
      delete entries[key];
    },
    setItem: (key: string, value: string): void => {
      entries[key] = value;
    },
  };
};

describe('readStoredToken', () => {
  it.each([
    ['no entry at all', {}, null],
    ['an empty string', { 'furria.club-app.refresh-token': '' }, null],
    ['a real token', { 'furria.club-app.refresh-token': 'refresh-abc' }, 'refresh-abc'],
  ])('reads %s as %s', (_case, initial, expected) => {
    expect(readStoredToken(buildFakeStorage(initial))).toBe(expected);
  });
});

describe('writeStoredToken', () => {
  it('confirms the write when the read-back matches', () => {
    const storage = buildFakeStorage({});

    expect(writeStoredToken(storage, 'refresh-abc')).toBe(true);
  });

  it('reports a failed write when the read-back does not match', () => {
    const storage = buildFakeStorage({});
    const droppingStorage: Storage = {
      ...storage,
      setItem: (): void => {},
    };

    expect(writeStoredToken(droppingStorage, 'refresh-abc')).toBe(false);
  });
});
