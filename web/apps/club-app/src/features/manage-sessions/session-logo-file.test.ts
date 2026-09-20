import { describe, expect, it } from 'vitest';
import { SESSION_LOGO_MAX_LENGTH } from './schemas';
import { toLogoFileRejection } from './session-logo-file';

describe('toLogoFileRejection', () => {
  it('takes an SVG the club picked', () => {
    expect(toLogoFileRejection({ type: 'image/svg+xml', size: 4_200 })).toBeNull();
  });

  it.each(['image/png', 'application/pdf', 'text/plain', ''])(
    'refuses %j before it reaches the form',
    (type) => {
      expect(toLogoFileRejection({ type, size: 4_200 })).not.toBeNull();
    },
  );

  it('takes a file that just fits the column', () => {
    expect(
      toLogoFileRejection({ type: 'image/svg+xml', size: SESSION_LOGO_MAX_LENGTH }),
    ).toBeNull();
  });

  it('refuses a file wider than the column', () => {
    expect(
      toLogoFileRejection({ type: 'image/svg+xml', size: SESSION_LOGO_MAX_LENGTH + 1 }),
    ).not.toBeNull();
  });

  it('names the type before the size when both are wrong', () => {
    const rejection = toLogoFileRejection({ type: 'image/png', size: SESSION_LOGO_MAX_LENGTH + 1 });

    expect(rejection).toBe(toLogoFileRejection({ type: 'image/png', size: 1 }));
  });
});
