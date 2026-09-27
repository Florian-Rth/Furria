import { describe, expect, it } from 'vitest';
import {
  PasskeyAssertionJsonSchema,
  PasskeyAttestationJsonSchema,
  PasskeyRequestOptionsJsonSchema,
  toAssertionJson,
  toAttestationJson,
  toCreationOptions,
  toRequestOptions,
} from './passkey-json';

const bytesOf = (buffer: BufferSource | undefined): number[] =>
  buffer instanceof ArrayBuffer ? Array.from(new Uint8Array(buffer)) : [];

const bufferOf = (bytes: number[]): ArrayBuffer => new Uint8Array(bytes).buffer;

describe('toCreationOptions', () => {
  it('decodes the challenge, the user handle and every excluded credential', () => {
    const options = toCreationOptions({
      rp: { id: 'club.furria.de', name: 'club.furria.de' },
      user: { id: 'NDI', name: 'anna@web.de', displayName: 'Anna Muster' },
      challenge: '-_8',
      pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
      excludeCredentials: [{ type: 'public-key', id: 'AQID', transports: ['internal'] }],
    });

    expect(bytesOf(options.challenge)).toEqual([0xfb, 0xff]);
    expect(bytesOf(options.user.id)).toEqual([0x34, 0x32]);
    expect(options.excludeCredentials?.map((descriptor) => bytesOf(descriptor.id))).toEqual([
      [1, 2, 3],
    ]);
  });
});

describe('toRequestOptions', () => {
  it.each([
    { allowCredentials: undefined, expected: undefined },
    { allowCredentials: [], expected: [] },
    { allowCredentials: [{ type: 'public-key' as const, id: 'AQID' }], expected: [[1, 2, 3]] },
  ])('decodes the challenge and allows $expected', ({ allowCredentials, expected }) => {
    const options = toRequestOptions({
      challenge: 'AAE',
      rpId: 'club.furria.de',
      allowCredentials,
    });

    expect(bytesOf(options.challenge)).toEqual([0x00, 0x01]);
    expect(options.allowCredentials?.map((descriptor) => bytesOf(descriptor.id))).toEqual(expected);
  });
});

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

describe('toAttestationJson', () => {
  it('encodes every buffer as base64url', () => {
    const credential = toAttestationJson({
      id: 'AQID',
      rawId: bufferOf([1, 2, 3]),
      authenticatorAttachment: 'platform',
      response: {
        clientDataJSON: bufferOf([0x7b, 0x7d]),
        attestationObject: bufferOf([0xfb, 0xff]),
        transports: ['internal', 'hybrid'],
      },
    });

    expect(credential).toEqual({
      id: 'AQID',
      rawId: 'AQID',
      type: 'public-key',
      authenticatorAttachment: 'platform',
      response: {
        clientDataJSON: 'e30',
        attestationObject: '-_8',
        transports: ['internal', 'hybrid'],
      },
    });
  });
});

describe('toAssertionJson', () => {
  it.each([
    { userHandle: bufferOf([0x34, 0x32]), expected: 'NDI' },
    { userHandle: null, expected: null },
  ])('encodes the user handle $expected', ({ userHandle, expected }) => {
    const credential = toAssertionJson({
      id: 'AQID',
      rawId: bufferOf([1, 2, 3]),
      authenticatorAttachment: null,
      response: {
        clientDataJSON: bufferOf([0x7b, 0x7d]),
        authenticatorData: bufferOf([0x00]),
        signature: bufferOf([0x01]),
        userHandle,
      },
    });

    expect(credential.response).toEqual({
      clientDataJSON: 'e30',
      authenticatorData: 'AA',
      signature: 'AQ',
      userHandle: expected,
    });
  });
});
