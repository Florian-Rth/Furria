import type { ReadinessCheck } from '@/features/season/schemas';
import type { Readiness } from '@/features/season/season-grid';
import type { MarkPlace } from './season-columns';

export const SEASON_TITLE = 'Saison';
export const SESSIONS_LABEL = 'Session';
export const INDEX_TITLE = 'Auftritte';
export const INDEX_LABEL = 'Alle Auftritte der Session';
export const INDEX_OPEN_LABEL = 'Hervorheben';
export const INDEX_CLOSE_LABEL = 'Schließen';
export const INDEX_NONE = 'Auftritt wählen';
export const INDEX_CLEAR = 'Hervorhebung aufheben';
export const ROW_OPEN_LABEL = 'Besetzung des Abends';
export const INDEX_ROW_LABEL = 'Hervorheben';
export const TRAY_TITLE = 'In der Ablage';
export const ABSENT_TITLE = 'Nicht dabei';
export const ADJUSTED_CHIP = 'angepasst';
export const CONFIRMED_CHIP = 'Ablauf steht';
export const DRAFT_CHIP = 'in Arbeit';
export const NO_ORDER_CHIP = 'noch kein Ablauf';
export const TODAY_CHIP = 'Heute';
export const EMPTY_EVENING = 'Noch kein Auftritt im Ablauf.';
export const LOAD_FAILED = 'Die Saison konnte nicht geladen werden.';
export const NO_EVENINGS = 'Diese Session hat noch keine Abende.';
export const CAST_TITLE = 'Besetzung an diesem Abend';
export const CAST_LABEL = 'Wer tanzt an diesem Abend mit? Antippen schaltet um.';
export const CAST_ADD = 'Jemand springt ein';
export const CAST_ADD_DONE = 'Fertig';
export const CAST_CLOSE = 'Zuklappen';
export const CAST_NO_CHANGES = 'Wie in der Session — niemand fehlt, niemand springt ein.';
export const CAST_EMPTY = 'Dieser Auftritt hat keine feste Besetzung.';
export const GUEST_BADGE = 'Gast';
export const GRID_LABEL = 'Abende der Session';

const CHECK_LABELS: Record<ReadinessCheck, string> = {
  music: 'Musik',
  steps: 'Schritte',
  formation: 'Aufstellung',
  videos: 'Videos',
  finalFile: 'Endfassung',
  cast: 'Besetzung',
};

const TILE_STATE_LABELS = {
  in: 'tanzt mit',
  out: 'fehlt an diesem Abend',
  guest: 'springt ein',
  person: 'tanzt mit',
} as const;

const DAY = new Intl.DateTimeFormat('de-DE', {
  weekday: 'short',
  day: '2-digit',
  month: '2-digit',
  year: '2-digit',
  timeZone: 'Europe/Berlin',
});

export const toEveningDate = (startsAt: string): string => DAY.format(new Date(startsAt));

export const toReadinessLabel = (name: string, readiness: Readiness): string => {
  const head = `${name}: ${readiness.done} von ${readiness.total} bereit`;

  return readiness.ready
    ? `${head}, alles fertig`
    : `${head}, offen: ${readiness.open.map((check) => CHECK_LABELS[check]).join(', ')}`;
};

export const toEveningCount = (lines: number, tray: number): string =>
  tray === 0 ? `${lines} im Ablauf` : `${lines} im Ablauf · ${tray} in der Ablage`;

export const toEveningsFact = (count: number, total: number): string =>
  `${count} von ${total} Abenden`;

export const toMarkChip = (name: string, place: MarkPlace): string => {
  switch (place.state) {
    case 'placed':
      return `${name}: Nr. ${place.number}`;
    case 'tray':
      return `${name}: in der Ablage`;
    case 'none':
      return `${name}: nicht dabei`;
  }
};

export const toNumberLabel = (number: number): string => `Nr. ${number}`;

export const toRemoveLabel = (actName: string, eveningTitle: string): string =>
  `${actName} aus ${eveningTitle} nehmen`;

export const toAddLabel = (actName: string, eveningTitle: string): string =>
  `${actName} auf ${eveningTitle} setzen`;

export const toCastChangeFact = (out: number, standsIn: number): string | null => {
  const parts = [
    out === 0 ? null : `${out} fehlt`,
    standsIn === 0 ? null : `${standsIn} springt ein`,
  ].filter((part) => part !== null);

  return parts.length === 0 ? null : parts.join(' · ');
};

export const toTileStateLabel = (state: keyof typeof TILE_STATE_LABELS): string =>
  TILE_STATE_LABELS[state];

export const toCastOutChip = (name: string): string => `Fehlt: ${name}`;

export const toCastInChip = (name: string): string => `Springt ein: ${name}`;

export const toEveningPosition = (position: number, total: number): string =>
  `Abend ${position} von ${total}`;
