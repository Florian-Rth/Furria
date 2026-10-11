import { describe, expect, it } from 'vitest';
import { stampSignatureOf } from './stamp-signature';

describe('stampSignatureOf', () => {
  it('signs with name, date and time', () => {
    expect(stampSignatureOf('Lena Schmitz', '2026-10-09T19:42:00')).toBe(
      'Lena Schmitz · 09.10.2026 · 19:42',
    );
  });
});
