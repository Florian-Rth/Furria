import { actDetailsPathOf } from '@/features/acts/act-details';
import { actScreenPathOf, hallScreenOf } from '@/features/acts/act-screens';

export type ScoreLinkSearch = Record<string, string | number | boolean>;

export interface ScoreLink {
  to: string;
  search: ScoreLinkSearch;
}

export const playLinkOf = (actId: number): ScoreLink => ({
  to: actScreenPathOf(actId, { kind: 'practice', eventId: null }),
  search: {},
});

export const editorLinkOf = (actId: number): ScoreLink => ({
  to: actScreenPathOf(actId, { kind: 'edit', eventId: null }),
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

export const eveningLinkOf = (actId: number, eventId: number | null): ScoreLink => ({
  to: actDetailsPathOf(actId, eventId === null ? null : { kind: 'evening', eventId }),
  search: {},
});

export const hallLinkOf = (actId: number, calendarEntryId: number | null): ScoreLink => ({
  to: actScreenPathOf(actId, hallScreenOf(calendarEntryId)),
  search: {},
});
