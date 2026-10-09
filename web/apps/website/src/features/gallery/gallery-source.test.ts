import { describe, expect, it } from 'vitest';
import type { GallerySection } from '@/lib/public-gallery/schemas';
import { resolveGallerySource } from './gallery-source';

const retry = (): void => {};

const sections: GallerySection[] = [
  { session: { startYear: 2025, yearsLabel: '2025/26', number: 67 }, albums: [] },
];

describe('resolveGallerySource', () => {
  it.each<[string, GallerySection[] | undefined, boolean, string]>([
    ['nothing arrived or failed yet', undefined, false, 'loading'],
    ['the request gave up', undefined, true, 'error'],
    ['a later refetch fails', sections, true, 'ready'],
    ['nothing is published yet', [], false, 'ready'],
  ])('when %s the source is %s', (_, source, hasFailed, status) => {
    expect(resolveGallerySource(source, hasFailed, retry).status).toBe(status);
  });
});
