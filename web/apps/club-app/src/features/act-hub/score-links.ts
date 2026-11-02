export type ScoreLinkSearch = Record<string, string | number | boolean>;

export interface ScoreLink {
  to: string;
  search: ScoreLinkSearch;
}

const actPathOf = (actId: number): string => `/acts/${actId}`;

export const playLinkOf = (actId: number): ScoreLink => ({
  to: actPathOf(actId),
  search: { view: 'play' },
});

export const editorLinkOf = (actId: number): ScoreLink => ({
  to: actPathOf(actId),
  search: { view: 'play', edit: true },
});

export const musicLinkOf = (actId: number): ScoreLink => ({
  to: `${actPathOf(actId)}/musik`,
  search: {},
});

export const detailsLinkOf = (actId: number): ScoreLink => ({
  to: actPathOf(actId),
  search: { view: 'details' },
});

export const settingsLinkOf = (actId: number): ScoreLink => ({
  to: actPathOf(actId),
  search: { settings: true },
});

export const eveningLinkOf = (actId: number, eventId: number | null): ScoreLink => ({
  to: actPathOf(actId),
  search: eventId === null ? { view: 'details' } : { view: 'details', evening: eventId },
});

export const hallLinkOf = (actId: number, calendarEntryId: number | null): ScoreLink => ({
  to: actPathOf(actId),
  search:
    calendarEntryId === null
      ? { view: 'training' }
      : { view: 'training', training: calendarEntryId },
});
