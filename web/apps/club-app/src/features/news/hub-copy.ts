export const NEWS_LEAD = 'Meldungen des Vereins für die Website.';
export const DRAFTS_TITLE = 'Entwürfe';
export const PLAN_LABEL = 'Meldungen im Lauf der Sessions';
export const RULER_TODAY = 'heute';
export const RULER_OPENING = '11.11.';
export const RULER_FEST = 'Fasching';
export const RULER_SUMMER = 'Sommer';
export const RULER_NO_POSTS = 'keine Meldung';
export const RULER_LEGEND_WORDS = {
  live: 'online',
  pending: 'Änderungen offen',
  withdrawn: 'zurückgezogen',
} as const;
export const rulerPostsOf = (count: number): string =>
  count === 1 ? '1 Meldung' : `${count} Meldungen`;
export const rulerMoreOf = (count: number): string => `und ${count} weitere`;
export const rulerDraftsOf = (count: number): string => (count === 1 ? 'Entwurf' : 'Entwürfe');
export const rulerLaneOf = (yearsLabel: string, count: number): string =>
  `Zur Session ${yearsLabel}, ${rulerPostsOf(count)}`;
export const READY_FACT = 'bereit';
export const MISSING_FACT = 'fehlt';
export const PENDING_FACT = 'Änderungen offen';
export const WITHDRAWN_FACT = 'zurückgezogen';
export const HUB_EMPTY_TITLE = 'Noch keine Meldung';
export const HUB_EMPTY_DESCRIPTION =
  'Schreib die erste. Sie bleibt ein Entwurf, bis du sie auf der Website veröffentlichst.';
export const HUB_LOADING = 'Die Meldungen werden geladen';
export const HUB_ERROR_TITLE = 'MELDUNGEN NICHT GELADEN';
export const HUB_RETRY = 'Erneut versuchen';
export const HUB_ERROR_MESSAGES = {
  unreachable: 'Keine Verbindung zum Server. Prüfe dein Netz und versuch es noch einmal.',
  unexpected: 'Beim Laden ist etwas schiefgelaufen.',
  rejected: 'Der Server hat die Anfrage abgelehnt.',
} as const;
