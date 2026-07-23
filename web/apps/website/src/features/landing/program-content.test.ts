import { describe, expect, it } from 'vitest';
import { deriveEventDisplay } from './program-content';

describe('deriveEventDisplay', () => {
  it('derives day, German month abbreviation and time for 14 Feb', () => {
    expect(deriveEventDisplay('2026-02-14T19:11')).toEqual({
      day: '14',
      month: 'FEB',
      time: '19:11 Uhr',
    });
  });

  it('keeps the zero-padded day for 08 Feb', () => {
    expect(deriveEventDisplay('2026-02-08T14:30')).toEqual({
      day: '08',
      month: 'FEB',
      time: '14:30 Uhr',
    });
  });
});
