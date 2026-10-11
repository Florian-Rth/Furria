import type { PublishConfirmCopy } from '@/lib/publish-copy';
import { PUBLISHED_STAMP } from '@/lib/publish-copy';
import type { PressKind } from './press-kind';

export const STAMP_TITLES: Record<PressKind, string> = {
  first: PUBLISHED_STAMP,
  changes: 'Aktualisiert',
  republish: 'Wieder online',
};
export const WITHDRAWN_STAMP = 'Zurückgezogen';
export const FIRST_PUBLICATION_NOTE = 'Adresse und Datum stehen danach fest';
export const REPUBLISH_NOTE = 'Adresse und Datum bleiben';

export const LINE_PUBLISHING = 'wird veröffentlicht …';
export const LINE_VIEW_ONLY = 'nur ansehen, nicht bearbeitbar';
export const LINE_MISSING = 'fehlt';
export const LINE_SINCE = 'seit';
export const LIVE_VERSION_WORD = 'Live-Fassung';

export const MORE_ACTIONS = 'Weitere Aktionen';
export const VERSION_TOGGLE_LABEL = 'Angezeigte Fassung';
export const SHOW_LIVE_ITEM = 'Live-Fassung ansehen';
export const SHOW_WORKING_ITEM = 'Zurück zu den Änderungen';
export const PUBLISH_SHORT = 'Veröffentlichen';

export const PRESS_CONFIRM_COPY: Record<PressKind, PublishConfirmCopy> = {
  first: {
    eyebrow: 'Aktuelles',
    question: 'Meldung jetzt veröffentlichen?',
    explanation: 'Sie erscheint sofort auf der Website unter Aktuelles.',
    consequence: 'Adresse und Datum stehen danach fest.',
    confirmLabel: 'Veröffentlichen',
  },
  changes: {
    eyebrow: 'Aktuelles',
    question: 'Änderungen jetzt veröffentlichen?',
    explanation: 'Die Website zeigt danach die neue Fassung.',
    confirmLabel: 'Änderungen veröffentlichen',
  },
  republish: {
    eyebrow: 'Aktuelles',
    question: 'Meldung wieder veröffentlichen?',
    explanation: 'Sie erscheint wieder auf der Website unter Aktuelles.',
    consequence: 'Adresse und Datum bleiben.',
    confirmLabel: 'Wieder veröffentlichen',
  },
};
