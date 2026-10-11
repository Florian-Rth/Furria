import { describe, expect, it } from 'vitest';
import { buildIdSlug, readSlugId, serverSlugAddress } from './detail-address';

describe('buildIdSlug', () => {
  it.each([
    [12, '1. Prunksitzung', '12-1-prunksitzung'],
    [7, 'Weiberfasching & Kostümball', '7-weiberfasching-kostuemball'],
    [3, 'Große Café-Sitzung', '3-grosse-cafe-sitzung'],
    [5, '!!!', '5'],
  ])('builds the address of item %i titled %s', (id, title, slug) => {
    expect(buildIdSlug(id, title)).toBe(slug);
  });
});

describe('readSlugId', () => {
  it.each([
    ['12-1-prunksitzung', 12],
    ['12', 12],
    ['prunksitzung', null],
    ['12prunksitzung', null],
    ['0-nichts', null],
    ['99999999999999999999-zu-gross', null],
  ])('reads the id of %s', (slug, id) => {
    expect(readSlugId(slug)).toBe(id);
  });
});

describe('serverSlugAddress', () => {
  const address = serverSlugAddress((post: { slug: string }) => post.slug);

  it.each([
    ['motto-2027', 'motto-2027'],
    ['', null],
  ])('reads the detail key of %j', (slug, key) => {
    expect(address.readKey(slug)).toBe(key);
  });
});
