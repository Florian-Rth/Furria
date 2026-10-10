import type { KkNewsProofLabels } from '@furria/ui';
import { CHANGED_MARK, UNTITLED } from './news-copy';

export const POSTER_FALLBACK = 'Meldung';

export const PEEK_SHEET_ID = 'news-proof-peek';
export const PEEK_SHEET_TITLE = 'So erscheint sie';
export const PEEK_CLOSE_LABEL = 'Schließen';

export const PROOF_LABELS: KkNewsProofLabels = {
  panels: {
    lead: 'Aufmacher',
    row: 'Listenzeile',
    card: 'Startseiten-Karte',
    whatsapp: 'WhatsApp',
  },
  tiles: {
    lead: 'Aufmacher',
    row: 'Liste',
    card: 'Startseite',
    whatsapp: 'WhatsApp',
  },
  sheet: 'So erscheint sie',
  open: 'Vorschau öffnen: Aufmacher, Liste, Startseite, WhatsApp',
  enlarge: 'in Originalgröße ansehen',
  cut: 'gekürzt',
  changed: CHANGED_MARK,
  live: 'Live',
  untitled: UNTITLED,
  teaserPlaceholder: 'Noch kein Vorspann',
  readMore: 'Ganze Meldung lesen →',
  posterFallback: POSTER_FALLBACK,
  readMark: '✓✓',
};
