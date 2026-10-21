import { describe, expect, it } from 'vitest';
import { browserModeIntentOf, searchWithoutBrowserMode } from './browser-mode';

describe('browserModeIntentOf', () => {
  it.each([
    { search: '?pwa=false', expected: 'enter' },
    { search: '?pwa=FALSE', expected: 'enter' },
    { search: '?pwa=off', expected: 'enter' },
    { search: '?pwa=0', expected: 'enter' },
    { search: '?pwa=true', expected: 'leave' },
    { search: '?pwa=on', expected: 'leave' },
    { search: '?pwa=1', expected: 'leave' },
    { search: '?pwa=maybe', expected: null },
    { search: '?view=list', expected: null },
    { search: '', expected: null },
  ])('$search', ({ search, expected }) => {
    expect(browserModeIntentOf(search)).toBe(expected);
  });
});

describe('searchWithoutBrowserMode', () => {
  it.each([
    { search: '?pwa=false', expected: '' },
    { search: '?view=list&pwa=false&day=2026-11-11', expected: '?view=list&day=2026-11-11' },
    { search: '?view=list', expected: '?view=list' },
    { search: '', expected: '' },
  ])('$search', ({ search, expected }) => {
    expect(searchWithoutBrowserMode(search)).toBe(expected);
  });
});
