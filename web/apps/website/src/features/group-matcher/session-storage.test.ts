import { describe, expect, it } from 'vitest';
import { readAnswersFromSession, writeAnswersToSession } from './session-storage';

const createFakeStorage = (): Pick<Storage, 'getItem' | 'setItem'> => {
  const entries = new Map<string, string>();

  return {
    getItem: (key: string) => entries.get(key) ?? null,
    setItem: (key: string, value: string) => {
      entries.set(key, value);
    },
  };
};

const storageHolding = (stored: string | null): Pick<Storage, 'getItem'> => ({
  getItem: () => stored,
});

describe('group-matcher session storage', () => {
  it('round-trips the answers through the session', () => {
    const storage = createFakeStorage();

    writeAnswersToSession(storage, { 'age-band': '18-plus', stage: 'yes' });

    expect(readAnswersFromSession(storage)).toEqual({ 'age-band': '18-plus', stage: 'yes' });
  });

  it.each([
    ['nothing stored', null],
    ['an entry that is not JSON', 'nicht mal JSON'],
    ['an entry of the wrong shape', JSON.stringify({ stage: 3 })],
  ])('reads no answers from %s', (_, stored) => {
    expect(readAnswersFromSession(storageHolding(stored))).toEqual({});
  });
});
