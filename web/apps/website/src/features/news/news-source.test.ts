import { describe, expect, it } from 'vitest';
import type { NewsSection } from '@/lib/public-news/schemas';
import { resolveNewsSource } from './news-source';

const retry = (): void => {};

const sections: NewsSection[] = [
  { session: { startYear: 2025, yearsLabel: '2025/26', number: 67 }, posts: [] },
];

describe('resolveNewsSource', () => {
  it.each<[string, NewsSection[] | undefined, boolean, string]>([
    ['nothing arrived or failed yet', undefined, false, 'loading'],
    ['the request gave up', undefined, true, 'error'],
    ['a later refetch fails', sections, true, 'ready'],
    ['nothing is published yet', [], false, 'ready'],
  ])('when %s the source is %s', (_, source, hasFailed, status) => {
    expect(resolveNewsSource(source, hasFailed, retry).status).toBe(status);
  });
});
