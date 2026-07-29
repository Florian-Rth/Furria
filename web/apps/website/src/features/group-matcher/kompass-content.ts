import { CLUB_CONTACT_EMAIL } from '@/lib/club';
import type { Stance } from '@/lib/seed/group-matcher';

export const kompassSectionId = 'konfetti-kompass';
export const kompassKicker = 'KONFETTI-KOMPASS';
export const kompassTitle = 'WO PASSE ICH HIN?';

export const kompassIntro =
  'Elf Fragen, keine Anmeldung, kein Name, keine E-Mail-Adresse. Antworte, wie es wirklich ist — und überspring, was dir nichts sagt.';

export interface KompassStanceChoice {
  value: Stance;
  label: string;
}

export const kompassStanceChoices: KompassStanceChoice[] = [
  { value: 'yes', label: 'Ja' },
  { value: 'neutral', label: 'Neutral' },
  { value: 'no', label: 'Nein' },
];

export const kompassLabels = {
  back: '← zurück',
  skip: 'überspringen',
  restart: 'Von vorne',
  loading: 'Die Fragen kommen gleich.',
  errorTitle: 'Die Fragen kommen nicht durch.',
  errorText:
    'Das liegt an uns, nicht an dir. Versuch es gleich noch einmal — oder schreib uns, dann antwortet ein Mensch.',
  errorRetry: 'Nochmal versuchen',
  errorMail: 'Schreib uns',
  doneTitle: 'ALLE FRAGEN DURCH.',
  doneHint:
    'Deine Antworten bleiben stehen, solange dieser Tab offen ist — auch nach einem Neuladen.',
} as const;

export const kompassMailHref = `mailto:${CLUB_CONTACT_EMAIL}`;

export const kompassProgressDoneLabel = 'Alle Fragen durch';

export const buildProgressLabel = (index: number, total: number): string =>
  index >= total ? kompassProgressDoneLabel : `Frage ${index + 1} von ${total}`;

export const buildAnsweredSummary = (answered: number, total: number): string =>
  answered === 0
    ? 'Du hast jede Frage übersprungen.'
    : `Du hast ${answered} von ${total} Fragen beantwortet.`;
