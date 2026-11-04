import type { KkConfirmFact } from '@furria/ui/KkConfirmDialog';

export type BeerListDialog = 'enroll' | 'leave';

export const BEER_LIST_TITLE = 'Bierliste';
export const BEER_LIST_STATUS_LABEL = 'Status';
export const BEER_LIST_ENROLLED = 'eingetragen';
export const BEER_LIST_NOT_ENROLLED = 'nicht eingetragen';
export const BEER_LIST_ENROLLED_HINT = 'Kisten vom Getränkewart gehen auf deinen Deckel.';
export const BEER_LIST_NOT_ENROLLED_HINT =
  'Trag dich ein, um Kisten vom Getränkewart auf deinen Deckel zu nehmen.';

export const BEER_LIST_ENROLLED_MESSAGE = 'Du stehst jetzt auf der Bierliste.';
export const BEER_LIST_LEFT_MESSAGE = 'Du bist von der Bierliste ausgetragen.';

export const BEER_LIST_CANCEL = 'Abbrechen';
export const BEER_LIST_CLOSE = 'Schließen';

export interface BeerListDialogCopy {
  actionLabel: string;
  eyebrow: string;
  question: string;
  explanation: string;
  facts: readonly KkConfirmFact[];
  consequence?: string;
  confirmLabel: string;
}

const ENROLL_DECLARATION: readonly KkConfirmFact[] = [
  {
    label: 'Deckel',
    value: 'Jede Kiste, die du nimmst, kommt zum aktuellen Kistenpreis auf deinen Deckel.',
  },
  {
    label: 'Bezahlen',
    value:
      'Du zahlst direkt an den Getränkewart. Die Bierliste ist seine Kasse, nicht die des Vereins.',
  },
  {
    label: 'Sichtbar',
    value:
      'Wer auf der Bierliste steht, sieht, wie viele Kisten du gegeben hast. Was offen ist, siehst nur du und wer die Liste führt.',
  },
  {
    label: 'Erinnerung',
    value: 'Bleibt eine Kiste offen, erinnert dich die App, bis sie bezahlt ist.',
  },
];

export const BEER_LIST_DIALOGS: Record<BeerListDialog, BeerListDialogCopy> = {
  enroll: {
    actionLabel: 'Eintragen',
    eyebrow: BEER_LIST_TITLE,
    question: 'Auf die Bierliste setzen?',
    explanation: 'Mit dem Eintragen bestätigst du diese Erklärung.',
    facts: ENROLL_DECLARATION,
    confirmLabel: 'Zustimmen und eintragen',
  },
  leave: {
    actionLabel: 'Austragen',
    eyebrow: BEER_LIST_TITLE,
    question: 'Von der Bierliste austragen?',
    explanation: 'Du kannst danach keine Kisten mehr auf deinen Deckel nehmen.',
    facts: [],
    consequence:
      'Offene Kisten bleiben auf deinem Deckel, bis sie bezahlt sind. Du kannst dich jederzeit wieder eintragen.',
    confirmLabel: 'Austragen',
  },
};
