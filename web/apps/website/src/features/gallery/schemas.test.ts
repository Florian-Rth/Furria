import { describe, expect, it } from 'vitest';
import { AlbumSearchSchema } from './schemas';

const parsePhoto = (search: Record<string, unknown>): number | undefined =>
  AlbumSearchSchema.parse(search).photo;

describe('AlbumSearchSchema', () => {
  it('reads a positive integer from the URL string', () => {
    expect(parsePhoto({ photo: '6' })).toBe(6);
  });

  it('leaves the param out when it is absent', () => {
    expect(parsePhoto({})).toBeUndefined();
  });

  it('normalises garbage to no param instead of throwing', () => {
    expect(parsePhoto({ photo: 'zwölf' })).toBeUndefined();
    expect(parsePhoto({ photo: '' })).toBeUndefined();
    expect(parsePhoto({ photo: '3.5' })).toBeUndefined();
    expect(parsePhoto({ photo: '-2' })).toBeUndefined();
    expect(parsePhoto({ photo: '0' })).toBeUndefined();
    expect(parsePhoto({ photo: ['1', '2'] })).toBeUndefined();
    expect(parsePhoto({ photo: null })).toBeUndefined();
  });

  it('ignores unrelated params', () => {
    expect(parsePhoto({ foto: '4' })).toBeUndefined();
  });
});
