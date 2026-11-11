import { describe, expect, it } from 'vitest';
import type { PublicSource } from '@/lib/public-resource/public-source';
import { presentGroupMatcherSource } from './group-matcher-source';
import type { GroupMatcher } from './types';

const matcher: GroupMatcher = { groups: [], questions: [] };
const retry = (): void => undefined;

describe('presentGroupMatcherSource', () => {
  it.each<[string, PublicSource<GroupMatcher | null>, string | null]>([
    ['loading', { status: 'loading' }, 'loading'],
    ['failed', { status: 'error', retry }, 'error'],
    ['present', { status: 'ready', data: matcher }, 'ready'],
    ['absent', { status: 'ready', data: null }, null],
  ])('shows a %s read as %s', (_label, source, shown) => {
    expect(presentGroupMatcherSource(source)?.status ?? null).toBe(shown);
  });
});
