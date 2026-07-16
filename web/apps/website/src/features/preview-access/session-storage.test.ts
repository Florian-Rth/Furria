import { describe, expect, it } from 'vitest';
import { readGrantedFromSession, writeGrantedToSession } from './session-storage';

const createFakeStorage = (): Pick<Storage, 'getItem' | 'setItem'> => {
  const entries = new Map<string, string>();

  return {
    getItem: (key: string) => entries.get(key) ?? null,
    setItem: (key: string, value: string) => {
      entries.set(key, value);
    },
  };
};

describe('preview-access session storage', () => {
  it('reports no access for an empty session', () => {
    expect(readGrantedFromSession(createFakeStorage())).toBe(false);
  });

  it('round-trips granted access through the session', () => {
    const storage = createFakeStorage();

    writeGrantedToSession(storage);

    expect(readGrantedFromSession(storage)).toBe(true);
  });
});
