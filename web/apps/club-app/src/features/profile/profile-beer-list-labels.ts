import type { KkChipTone } from '@furria/ui/KkChip';
import type { KkConfirmFact } from '@furria/ui/KkConfirmDialog';
import type { KkIconName } from '@furria/ui/KkIcon';
import type { KkPanelActionEmphasis } from '@furria/ui/panel-action';

export type BeerListDialog = 'enroll' | 'leave';

export const BEER_LIST_TITLE = 'Bierliste';
export const BEER_LIST_STATUS_LABEL = 'Status';

export interface BeerListStateCopy {
  status: string;
  hint: string;
  tone: KkChipTone;
  actionLabel: string;
  actionIcon: KkIconName;
  actionEmphasis: KkPanelActionEmphasis;
}

export const BEER_LIST_STATES: Record<'enrolled' | 'notEnrolled', BeerListStateCopy> = {
  enrolled: {
    status: 'eingetragen',
    hint: 'Kisten von der Bierliste werden auf deinen Namen gebucht.',
    tone: 'green',
    actionLabel: 'Austragen',
    actionIcon: 'close',
    actionEmphasis: 'quiet',
  },
  notEnrolled: {
    status: 'nicht eingetragen',
    hint: 'Trag dich ein, um Kisten von der Bierliste auf deinen Namen zu buchen.',
    tone: 'neutral',
    actionLabel: 'Eintragen',
    actionIcon: 'add',
    actionEmphasis: 'strong',
  },
};

export const BEER_LIST_ENROLLED_MESSAGE = 'Du stehst jetzt auf der Bierliste.';
export const BEER_LIST_LEFT_MESSAGE = 'Du bist von der Bierliste ausgetragen.';

export const BEER_LIST_CANCEL = 'Abbrechen';
export const BEER_LIST_CLOSE = 'Schließen';

export interface BeerListDialogCopy {
  eyebrow: string;
  question: string;
  explanation: string;
  facts: readonly KkConfirmFact[];
  consequence?: string;
  confirmLabel: string;
}

const ENROLL_DECLARATION: readonly KkConfirmFact[] = [
  {
    label: 'Kisten',
    value: 'Jede Kiste, die du nimmst, wird zum aktuellen Kistenpreis auf deinen Namen gebucht.',
  },
  {
    label: 'Bezahlen',
    value:
      'Du zahlst direkt an die Person, der die Bierliste gehört. Es ist ihre private Kasse, nicht die des Vereins.',
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
    eyebrow: BEER_LIST_TITLE,
    question: 'Auf die Bierliste setzen?',
    explanation: 'Mit dem Eintragen bestätigst du diese Erklärung.',
    facts: ENROLL_DECLARATION,
    confirmLabel: 'Zustimmen und eintragen',
  },
  leave: {
    eyebrow: BEER_LIST_TITLE,
    question: 'Von der Bierliste austragen?',
    explanation: 'Du kannst danach keine Kisten mehr auf deinen Namen buchen.',
    facts: [],
    consequence:
      'Offene Kisten bleiben offen, bis sie bezahlt sind. Du kannst dich jederzeit wieder eintragen.',
    confirmLabel: 'Austragen',
  },
};
