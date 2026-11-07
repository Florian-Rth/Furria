import { actScreenPathOf, hallScreenOf } from '@/features/acts/act-screens';
import { actPagePathOf } from '@/features/acts/acts-origin';

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
  to: actPagePathOf(actId),
  search: { view: 'details' },
});

export const settingsLinkOf = (actId: number): ScoreLink => ({
  to: actPagePathOf(actId),
  search: { settings: true },
});

export const eveningLinkOf = (actId: number, eventId: number | null): ScoreLink => ({
  to: actPagePathOf(actId),
  search: eventId === null ? { view: 'details' } : { view: 'details', evening: eventId },
});

export const hallLinkOf = (actId: number, calendarEntryId: number | null): ScoreLink => ({
  to: actScreenPathOf(actId, hallScreenOf(calendarEntryId)),
  search: {},
});
