import { describe, expect, it } from 'vitest';
import {
  PRESS_BEATS_MS,
  pressAddressOf,
  pressCuesAfterRegister,
  pressDateOf,
  pressMomentOf,
  pressSignatureOf,
  registerRemainderOf,
} from './press-run';

describe('registerRemainderOf', () => {
  const { registerAtLeast } = PRESS_BEATS_MS;

  it.each([
    { elapsed: 0, expected: registerAtLeast },
    { elapsed: registerAtLeast / 2, expected: registerAtLeast / 2 },
    { elapsed: registerAtLeast, expected: 0 },
    { elapsed: registerAtLeast * 3, expected: 0 },
  ])('holds the register $expected ms after $elapsed ms', ({ elapsed, expected }) => {
    expect(registerRemainderOf(elapsed)).toBe(expected);
  });
});

describe('pressCuesAfterRegister', () => {
  it('runs strike, cut, stamp and settles in order, each strictly after the last', () => {
    const cues = pressCuesAfterRegister();

    expect(cues.map((cue) => cue.phase)).toEqual(['strike', 'cut', 'stamp', 'settled']);
    expect(cues.every((cue, index) => index === 0 || cue.atMs > (cues[index - 1]?.atMs ?? 0))).toBe(
      true,
    );
  });
});

describe('press formatters', () => {
  it('writes the address', () => {
    expect(pressAddressOf('furria.de', '/news/', 'prinzenpaar')).toBe('furria.de/news/prinzenpaar');
  });

  it('writes the date', () => {
    expect(pressDateOf('2026-10-09T19:42:00')).toBe('09.10.2026');
  });

  it('writes the moment', () => {
    expect(pressMomentOf('2026-10-09T19:42:00')).toBe('09.10.26, 19:42');
  });

  it('signs with name, date and time', () => {
    expect(pressSignatureOf('Lena Schmitz', '2026-10-09T19:42:00')).toBe(
      'Lena Schmitz · 09.10.2026 · 19:42',
    );
  });
});
