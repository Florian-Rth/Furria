import type { KkImageSource } from '@furria/ui/image-source';
import { toImageSource } from '@furria/ui/image-source';
import { stageOf } from './news-lifecycle';
import type { NewsHub, NewsPostSummary } from './schemas';
import type { NewsCategory, NewsRequirement, NewsStage } from './types';

export type HubFact =
  | { kind: 'missing'; missing: NewsRequirement[] }
  | { kind: 'ready' }
  | { kind: 'live' }
  | { kind: 'pending'; at: string }
  | { kind: 'withdrawn'; at: string };

export interface HubRow {
  id: number;
  stage: NewsStage;
  title: string;
  category: NewsCategory | null;
  picture: KkImageSource | null;
  date: string;
  fact: HubFact;
}

export interface HubSection {
  key: string;
  kind: 'drafts' | 'session';
  startYear: number | null;
  sessionNumber: number | null;
  rows: HubRow[];
}

const DRAFTS_KEY = 'drafts';

const factOf = (post: NewsPostSummary, stage: NewsStage): HubFact => {
  if (stage === 'draft') {
    return post.missing.length === 0
      ? { kind: 'ready' }
      : { kind: 'missing', missing: post.missing };
  }
  if (stage === 'pending') {
    return { kind: 'pending', at: post.pendingSavedAt ?? post.updatedAt };
  }
  if (stage === 'withdrawn') {
    return { kind: 'withdrawn', at: post.withdrawnAt ?? post.updatedAt };
  }
  return { kind: 'live' };
};

export const hubRowOf = (post: NewsPostSummary): HubRow => {
  const stage = stageOf(post.state, post.hasPendingChanges);
  return {
    id: post.newsPostId,
    stage,
    title: post.title,
    category: post.category,
    picture: toImageSource(post.picture, 'banner'),
    date: post.publishedAt ?? post.updatedAt,
    fact: factOf(post, stage),
  };
};

export const hubSectionsOf = (hub: NewsHub): HubSection[] =>
  hub.sections
    .filter((section) => section.posts.length > 0)
    .map((section) => {
      const rows = section.posts.map(hubRowOf);
      const startYear = section.sessionStartYear;
      return {
        key: startYear === null ? DRAFTS_KEY : String(startYear),
        kind: startYear === null ? 'drafts' : 'session',
        startYear,
        sessionNumber: section.sessionNumber,
        rows,
      };
    });
