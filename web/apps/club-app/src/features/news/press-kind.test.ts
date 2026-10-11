import { describe, expect, it } from 'vitest';
import { pressAddressOf, pressMomentOf } from './press-kind';

describe('press formatters', () => {
  it('writes the address', () => {
    expect(pressAddressOf('furria.de', '/news/', 'prinzenpaar')).toBe('furria.de/news/prinzenpaar');
  });

  it('writes the moment', () => {
    expect(pressMomentOf('2026-10-09T19:42:00')).toBe('09.10.26, 19:42');
  });
});
