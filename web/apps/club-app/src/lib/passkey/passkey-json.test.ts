import { describe, expect, it } from 'vitest';
import {
  PasskeyAssertionJsonSchema,
  PasskeyAttestationJsonSchema,
  PasskeyRequestOptionsJsonSchema,
} from './passkey-json';

describe('PasskeyRequestOptionsJsonSchema', () => {
  it('drops transports the browser does not know', () => {
    const options = PasskeyRequestOptionsJsonSchema.parse({
      challenge: 'AAE',
      allowCredentials: [{ type: 'public-key', id: 'AQID', transports: ['internal', 'cable'] }],
    });

    expect(options.allowCredentials?.[0]?.transports).toEqual(['internal']);
  });
});

describe('PasskeyAttestationJsonSchema', () => {
  it('fills a missing attachment and missing transports', () => {
    const credential = PasskeyAttestationJsonSchema.parse({
      id: 'AQID',
      rawId: 'AQID',
      type: 'public-key',
      response: { clientDataJSON: 'e30', attestationObject: 'oA' },
      clientExtensionResults: {},
    });

    expect(credential.authenticatorAttachment).toBeNull();
    expect(credential.response.transports).toEqual([]);
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
