import { describe, expect, it } from 'vitest';
import { PasskeyAssertionJsonSchema, PasskeyRequestOptionsJsonSchema } from './passkey-json';

describe('PasskeyRequestOptionsJsonSchema', () => {
  it('drops transports the browser does not know', () => {
    const options = PasskeyRequestOptionsJsonSchema.parse({
      challenge: 'AAE',
      allowCredentials: [{ type: 'public-key', id: 'AQID', transports: ['internal', 'cable'] }],
    });

    expect(options.allowCredentials?.[0]?.transports).toEqual(['internal']);
  });
});

describe('PasskeyAssertionJsonSchema', () => {
  it('reads a missing user handle as none', () => {
    const credential = PasskeyAssertionJsonSchema.parse({
      id: 'AQID',
      rawId: 'AQID',
      type: 'public-key',
      authenticatorAttachment: 'platform',
      response: { clientDataJSON: 'e30', authenticatorData: 'AA', signature: 'AQ' },
    });

    expect(credential.response.userHandle).toBeNull();
  });
});
