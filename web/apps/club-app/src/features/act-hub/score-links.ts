import { actDetailsPathOf } from '@/features/acts/act-details';
import { actScreenPathOf } from '@/features/acts/act-screens';

export type ScoreLinkSearch = Record<string, string | number | boolean>;

export interface ScoreLink {
  to: string;
  search: ScoreLinkSearch;
}

export const playLinkOf = (actId: number): ScoreLink => ({
  to: actScreenPathOf(actId, { kind: 'practice' }),
  search: {},
});

export const editorLinkOf = (actId: number): ScoreLink => ({
  to: actScreenPathOf(actId, { kind: 'edit' }),
  search: {},
});

export const musicLinkOf = (actId: number): ScoreLink => ({
  to: actScreenPathOf(actId, { kind: 'music' }),
  search: {},
});

export const detailsLinkOf = (actId: number): ScoreLink => ({
  to: actDetailsPathOf(actId, null),
  search: {},
});

export const settingsLinkOf = (actId: number): ScoreLink => ({
  to: actDetailsPathOf(actId, { kind: 'settings' }),
  search: {},
});
