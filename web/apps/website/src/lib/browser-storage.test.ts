import { describe, expect, it } from 'vitest';
import { guardedStorage } from './browser-storage';

const blocked = (): Storage => {
  throw new DOMException('blocked', 'SecurityError');
};

const working = (): Storage => {
  const entries = new Map<string, string>();

  return {
    length: 0,
    clear: () => entries.clear(),
    key: () => null,
    getItem: (key) => entries.get(key) ?? null,
    setItem: (key, value) => {
      entries.set(key, value);
    },
    removeItem: (key) => {
      entries.delete(key);
    },
  };
};

const full = (): Storage => ({
  ...working(),
  setItem: () => {
    throw new DOMException('full', 'QuotaExceededError');
  },
});

describe('guardedStorage', () => {
  it.each([
    { label: 'blocked', open: blocked },
    { label: 'full', open: full },
  ])('keeps a value for the page visit when the storage is $label', ({ open }) => {
    const storage = guardedStorage(open);

    storage.setItem('granted', 'yes');

    expect(storage.getItem('granted')).toBe('yes');
  });

  it('reads nothing from a blocked storage', () => {
    expect(guardedStorage(blocked).getItem('granted')).toBeNull();
  });

  it('forgets a kept value once it is removed', () => {
    const storage = guardedStorage(blocked);

    storage.setItem('granted', 'yes');
    storage.removeItem('granted');

    expect(storage.getItem('granted')).toBeNull();
  });

  it('reads through to a working storage', () => {
    const backing = working();
    const storage = guardedStorage(() => backing);

    storage.setItem('granted', 'yes');

    expect(backing.getItem('granted')).toBe('yes');
  });
});
