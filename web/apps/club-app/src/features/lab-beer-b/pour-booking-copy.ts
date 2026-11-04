import type { KkHoldConfirm } from '@furria/ui/KkHoldButton';
import { euroOf } from '@/features/lab-beer/beer-lab-ledger';
import { CANCEL_LABEL, CLOSE_LABEL, cratesLabel } from './pour-copy';
import type { PourMember } from './pour-member';

export const BOOK_PAGE_LABEL = 'Kiste buchen';
export const BOOK_EYEBROW = 'Bierliste';
export const STACK_LABEL = 'Wie viele Kisten?';
export const BOOK_HINT = 'Zum Buchen halten';
export const DECLARE_TITLE = 'Teilnahme an der Bierliste';
export const DECLARE_HOLD_NOTE =
  'Mit dem Halten nimmst du teil und buchst die Kisten in einem Schritt.';
export const EMPTY_TITLE = 'Keine Kiste im Bestand';
export const EMPTY_TEXT =
  'Gerade kann niemand buchen. Sobald eine Lieferung eingetragen ist, geht es wieder.';
export const UNDO_LABEL = 'Rückgängig';
export const AGAIN_LABEL = 'Noch eine Kiste buchen';
export const DONE_LINE = 'Prost! Steht auf deinem Deckel.';
export const UNDO_LINE = '10 Sekunden zum Zurücknehmen';

export const DECLARATION_LEAD =
  'Ich nehme an der Bierliste teil. Kisten, die ich buche, kommen auf meinen eigenen Deckel, und ich bezahle sie privat an ';
export const DECLARATION_REST = '. Der Verein ist daran nicht beteiligt.';

export const declarationOf = (owner: string): string =>
  `${DECLARATION_LEAD}${owner}${DECLARATION_REST}`;

export const whoLineOf = (name: string, member: PourMember): string => {
  if (member.standing !== 'enrolled') {
    return `${name} · nimmt noch nicht teil`;
  }

  return member.tab.openCount > 0
    ? `${name} · offen ${euroOf(member.tab.openCents)}`
    : `${name} · alles bezahlt`;
};

export const summaryOf = (priceCents: number, openAfterCents: number): string =>
  `auf deinen Deckel · ${euroOf(priceCents)} je Kiste · danach offen ${euroOf(openAfterCents)}`;

export const holdLabelOf = (count: number, declare: boolean): string =>
  declare ? `Teilnehmen + ${cratesLabel(count)} buchen` : `${cratesLabel(count)} buchen`;

export const bookedTitleOf = (count: number): string => `${cratesLabel(count)} gebucht`;

export const openNowOf = (cents: number): string => `Dein Deckel: ${euroOf(cents)} offen`;

export const confirmOf = (count: number, declare: boolean, owner: string): KkHoldConfirm => ({
  eyebrow: BOOK_EYEBROW,
  question: declare
    ? `Teilnehmen und ${cratesLabel(count)} buchen?`
    : `${cratesLabel(count)} auf deinen Deckel buchen?`,
  explanation: declare ? declarationOf(owner) : `Du bezahlst privat an ${owner}.`,
  confirmLabel: 'Buchen',
  cancelLabel: CANCEL_LABEL,
  closeLabel: CLOSE_LABEL,
});
