import { describe, expect, it } from 'vitest';
import { decodeBase64Url, encodeBase64Url } from './base64url';

describe('encodeBase64Url', () => {
  it.each([{ bytes: [0xfb], encoded: '-w' }])(
    'encodes $bytes without padding as $encoded',
    ({ bytes, encoded }) => {
      expect(encodeBase64Url(new Uint8Array(bytes))).toBe(encoded);
    },
  );

  it('encodes only the viewed slice of a larger buffer', () => {
    const buffer = new Uint8Array([0x00, 0x66, 0x6f, 0x6f, 0x00]).buffer;

    expect(encodeBase64Url(new Uint8Array(buffer, 1, 3))).toBe('Zm9v');
  });
});

describe('decodeBase64Url', () => {
  it.each([{ encoded: '-w', bytes: [0xfb] }])(
    'decodes $encoded into $bytes',
    ({ encoded, bytes }) => {
      expect(Array.from(new Uint8Array(decodeBase64Url(encoded)))).toEqual(bytes);
    },
  );
});
