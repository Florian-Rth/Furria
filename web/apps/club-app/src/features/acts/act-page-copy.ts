import type { CatalogueAct } from '@/features/running-order/schemas';
import { formatIsoDay } from '@/lib/membership-labels';
import { ARCHIVED_NOTE, toClosedActNote } from './acts-copy';

export const ACT_FALLBACK_TITLE = 'Auftritt';
export const ACT_LOADING_LABEL = 'Auftritt wird geladen';
export const ACT_DENIED_MESSAGE =
  'Diesen Auftritt sehen seine Besetzung, die Gruppenleitung und die Ablaufplanung.';
export const SETTINGS_LABEL = 'Bearbeiten';
export const ACT_DETAILS_LABEL = 'Details';
export const ACT_CARD_LABEL = 'Zum Auftritt';
export const STUDIO_OPEN_LABEL = 'Studio öffnen';
export const STUDIO_MUSIC_LABEL = 'Musik anlegen';
export const SETTINGS_TITLE = 'Auftritt bearbeiten';
export const CAST_ONLY_NOTE =
  'Musik, Schritte und Videos sehen die Besetzung und die Leitung der Gruppe.';
export const CO_EDITORS_TITLE = 'Bearbeiten mit';
export const CO_EDITORS_NOTE = 'Pflegen Musik, Schritte, Videos und Aufstellung mit.';
export const CO_EDITORS_EMPTY = 'Bisher pflegt nur die Gruppenleitung.';
export const CO_EDITOR_GRANT_LABEL = 'Aus der Besetzung dazunehmen';
export const toCoEditorRevokeLabel = (name: string): string =>
  `${name} nicht mehr mitbearbeiten lassen`;

const ISO_DAY_LENGTH = 10;

export const toCoEditorSince = (grantedAt: string): string =>
  `seit ${formatIsoDay(grantedAt.slice(0, ISO_DAY_LENGTH))}`;

export const toActStateNote = (act: CatalogueAct): string | null => {
  if (act.closed) {
    return toClosedActNote(act.sessionYear);
  }

  return act.archived ? ARCHIVED_NOTE : null;
};
