const toPaddedBase64 = (base64url: string): string => {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);

  return `${base64}${padding}`;
};

const toBytes = (source: ArrayBuffer | ArrayBufferView): Uint8Array =>
  source instanceof ArrayBuffer
    ? new Uint8Array(source)
    : new Uint8Array(source.buffer, source.byteOffset, source.byteLength);

export const encodeBase64Url = (source: ArrayBuffer | ArrayBufferView): string => {
  const binary = Array.from(toBytes(source), (byte) => String.fromCharCode(byte)).join('');

  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

export const decodeBase64Url = (base64url: string): ArrayBuffer => {
  const binary = atob(toPaddedBase64(base64url));
  const bytes = new Uint8Array(binary.length);
  bytes.set(Array.from(binary, (character) => character.charCodeAt(0)));

  return bytes.buffer;
};
