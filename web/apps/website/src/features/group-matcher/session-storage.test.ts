import { describe, expect, it } from 'vitest';
import {
  clearAnswersInSession,
  readAnswersFromSession,
  writeAnswersToSession,
} from './session-storage';

const createFakeStorage = (): Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> => {
  const entries = new Map<string, string>();

  return {
    getItem: (key: string) => entries.get(key) ?? null,
    setItem: (key: string, value: string) => {
      entries.set(key, value);
    },
    removeItem: (key: string) => {
      entries.delete(key);
    },
  };
};

describe('group-matcher session storage', () => {
  it('reads no answers from an empty session', () => {
    expect(readAnswersFromSession(createFakeStorage())).toEqual({});
  });

  it('round-trips the answers through the session', () => {
    const storage = createFakeStorage();

    writeAnswersToSession(storage, { 'age-band': '18-plus', stage: 'yes' });

    expect(readAnswersFromSession(storage)).toEqual({ 'age-band': '18-plus', stage: 'yes' });
  });

  it('forgets the answers again', () => {
    const storage = createFakeStorage();

    writeAnswersToSession(storage, { stage: 'yes' });
    clearAnswersInSession(storage);

    expect(readAnswersFromSession(storage)).toEqual({});
  });

  it('ignores a session entry that is not readable as answers', () => {
    const storage = createFakeStorage();

    storage.setItem('furria.kompass.answers', 'nicht mal JSON');

    expect(readAnswersFromSession(storage)).toEqual({});
  });

  it('ignores a session entry of the wrong shape', () => {
    const storage = createFakeStorage();

    storage.setItem('furria.kompass.answers', JSON.stringify({ stage: 3 }));

    expect(readAnswersFromSession(storage)).toEqual({});
  });
});
