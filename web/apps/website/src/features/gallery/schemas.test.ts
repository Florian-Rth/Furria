import { describe, expect, it } from 'vitest';
import { AlbumSearchSchema } from './schemas';

type UrlSearch = Record<string, string | string[] | null>;

describe('AlbumSearchSchema', () => {
  it.each<[UrlSearch, number | undefined]>([
    [{ photo: '6' }, 6],
    [{}, undefined],
    [{ photo: 'zwölf' }, undefined],
    [{ photo: '3.5' }, undefined],
    [{ photo: '0' }, undefined],
    [{ photo: ['1', '2'] }, undefined],
  ])('normalises %j to the photo %s', (search, photo) => {
    expect(AlbumSearchSchema.parse(search).photo).toBe(photo);
  });
});
