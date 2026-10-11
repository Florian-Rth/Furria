import { format } from 'date-fns';
import type { NewsStage } from './types';

export type PressKind = 'first' | 'changes' | 'republish';

export const STAGE_BEFORE_PRESS: Record<PressKind, NewsStage> = {
  first: 'draft',
  changes: 'pending',
  republish: 'withdrawn',
};

export const pressAddressOf = (host: string, path: string, slug: string): string =>
  `${host}${path}${slug}`;

export const pressMomentOf = (iso: string): string => format(new Date(iso), 'dd.MM.yy, HH:mm');

const PRESS_KINDS: Record<NewsStage, PressKind> = {
  draft: 'first',
  live: 'changes',
  pending: 'changes',
  withdrawn: 'republish',
};

export const pressKindOf = (stage: NewsStage): PressKind => PRESS_KINDS[stage];
