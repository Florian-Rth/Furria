import { ApiError } from '@furria/api-client';
import { describe, expect, it } from 'vitest';
import type { DetailRead } from './canonical-detail';
import { resolveCanonicalDetail } from './canonical-detail';

interface Article {
  slug: string;
}

const slugOf = (article: Article): string => article.slug;

describe('resolveCanonicalDetail', () => {
  it.each<[string, string, DetailRead<Article>, string]>([
    ['the address carries no key', 'prunksitzung', { status: 'unaddressable' }, 'not-found'],
    [
      'the API knows no such item',
      '12',
      { status: 'failed', error: new ApiError({ kind: 'status', status: 404 }) },
      'not-found',
    ],
    [
      'the API is down',
      '12',
      { status: 'failed', error: new ApiError({ kind: 'status', status: 503 }) },
      'fail',
    ],
    ['the request never left', '12', { status: 'failed', error: new Error('offline') }, 'fail'],
    [
      'the address is outdated',
      '12-alt',
      { status: 'found', detail: { slug: '12-neu' } },
      'redirect',
    ],
    ['the address is canonical', '12-neu', { status: 'found', detail: { slug: '12-neu' } }, 'show'],
  ])('when %s the route decides %s', (_, requestedSlug, read, kind) => {
    expect(resolveCanonicalDetail(requestedSlug, read, slugOf).kind).toBe(kind);
  });

  it('redirects to the canonical address', () => {
    expect(
      resolveCanonicalDetail('12-alt', { status: 'found', detail: { slug: '12-neu' } }, slugOf),
    ).toEqual({ kind: 'redirect', canonicalSlug: '12-neu' });
  });
});
