import { sessionAt, sessionOpeningAt } from '@/lib/club';
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
  pictureSource: string | null;
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

export interface PlanTick {
  id: number;
  stage: NewsStage;
  position: number;
}

export interface PlanSession {
  startYear: number;
  ticks: PlanTick[];
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
    pictureSource: post.picture?.smallUrl ?? null,
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

const sessionPositionOf = (iso: string, startYear: number): number => {
  const opening = sessionOpeningAt(startYear).getTime();
  const next = sessionOpeningAt(startYear + 1).getTime();
  return Math.min(Math.max((Date.parse(iso) - opening) / (next - opening), 0), 1);
};

const sessionYearOf = (iso: string): number => sessionAt(new Date(iso)).startYear;

export const pressPlanOf = (sections: readonly HubSection[], now: Date): PlanSession[] => {
  const currentYear = sessionAt(now).startYear;
  const rows = sections.flatMap((section) => section.rows);
  const yearOfRow = (row: HubRow): number =>
    row.stage === 'draft' ? currentYear : sessionYearOf(row.date);
  const firstYear = Math.min(currentYear, ...rows.map(yearOfRow));
  return Array.from({ length: currentYear - firstYear + 1 }, (_, offset) => {
    const startYear = firstYear + offset;
    const ticks = rows
      .filter((row) => yearOfRow(row) === startYear)
      .map((row) => ({
        id: row.id,
        stage: row.stage,
        position: sessionPositionOf(row.date, startYear),
      }))
      .sort((left, right) => left.position - right.position);
    return { startYear, ticks };
  });
};
