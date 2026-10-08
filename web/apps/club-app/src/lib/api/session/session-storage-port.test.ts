import { describe, expect, it } from 'vitest';
import { normalizeStoredToken, writeStoredToken } from './session-storage-port';

const buildFakeStorage = (keepsWrites: boolean): Storage => {
  const entries = new Map<string, string>();

  return {
    get length(): number {
      return entries.size;
    },
    clear: (): void => {
      entries.clear();
    },
    getItem: (key: string): string | null => entries.get(key) ?? null,
    key: (index: number): string | null => [...entries.keys()][index] ?? null,
    removeItem: (key: string): void => {
      entries.delete(key);
    },
    setItem: (key: string, value: string): void => {
      if (keepsWrites) {
        entries.set(key, value);
      }
    },
  };
};

describe('normalizeStoredToken', () => {
  it.each([
    ['no entry at all', null, null],
    ['an empty string', '', null],
    ['a real token', 'refresh-abc', 'refresh-abc'],
  ])('reads %s as %s', (_case, stored, expected) => {
    expect(normalizeStoredToken(stored)).toBe(expected);
  });
});

describe('writeStoredToken', () => {
  it.each([
    ['keeps the write', true, true],
    ['silently drops the write', false, false],
  ])('confirms the write when the storage %s: %s', (_case, keepsWrites, expected) => {
    expect(writeStoredToken(buildFakeStorage(keepsWrites), 'refresh-abc')).toBe(expected);
  });
});
