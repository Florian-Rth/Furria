import type { KkHoldConfirm } from '@furria/ui/KkHoldButton';
import type { KkPourCount } from '@furria/ui/KkPourCountPicker';
import { euroOf } from '@/features/lab-beer/beer-lab-ledger';
import { CANCEL_LABEL, CLOSE_LABEL, cratesLabel, daysLabel } from './pour-copy';
import type { PourMember } from './pour-member';
import { MAX_CRATES_PER_BOOKING } from './pour-member';

export const FILTER_LABEL = 'Einträge';
export const FILTER_ALL = 'Alle';
export const FILTER_MINE = 'Meine';
export const COUNT_LABEL = 'Anzahl Kisten';
export const HOLD_HINT = 'Zum Buchen halten';
export const UNDO_LABEL = 'Rückgängig';
export const PAY_LABEL = 'Bezahlen';
export const OWN_NAME = 'Du';
export const STREAM_EMPTY = 'Noch keine Kisten auf der Bierliste.';
export const STREAM_MINE_EMPTY = 'Du hast noch keine Kiste gebucht.';
export const FORMER_LINE =
  'Deine Teilnahme ist beendet. Hier siehst du nur noch deinen Deckel. Wieder teilnehmen: Code an der Palette scannen.';
export const STOCK_EMPTY_LINE =
  'Keine Kiste mehr im Bestand – buchen geht nach der nächsten Lieferung.';

export const countsOf = (maxCount: number): readonly KkPourCount[] =>
  Array.from({ length: MAX_CRATES_PER_BOOKING }, (_, index) => ({
    value: index + 1,
    label: cratesLabel(index + 1),
    disabled: index + 1 > maxCount,
  }));

export const stripFactsOf = (member: PourMember): string => {
  if (member.tab.openCount > 0) {
    return `${cratesLabel(member.tab.openCount)} offen · ${daysLabel(member.openDays ?? 0)}`;
  }

  return member.tab.paidCount > 0
    ? `Alles bezahlt · ${cratesLabel(member.tab.paidCount)} bisher`
    : 'Noch nichts auf deinem Deckel';
};

export const stripAmountOf = (member: PourMember): string | null =>
  member.tab.openCount > 0 ? euroOf(member.tab.openCents) : null;

export const holdLabelOf = (count: number): string => `${cratesLabel(count)} buchen`;

export const bookContextOf = (openAfterCents: number, priceCents: number): string =>
  `auf deinen Deckel · ${euroOf(priceCents)} je Kiste · danach offen ${euroOf(openAfterCents)}`;

export const bookConfirmOf = (count: number, priceCents: number, owner: string): KkHoldConfirm => ({
  eyebrow: 'Bierliste',
  question: `${cratesLabel(count)} auf deinen Deckel buchen?`,
  explanation: `${euroOf(priceCents)} je Kiste. Du bezahlst privat an ${owner}.`,
  confirmLabel: 'Buchen',
  cancelLabel: CANCEL_LABEL,
  closeLabel: CLOSE_LABEL,
});

export const bookedTextOf = (count: number): string =>
  `${cratesLabel(count)} gebucht · 10 s zum Zurücknehmen`;

export const enteredByNote = (name: string): string => `eingetragen von ${name}`;

export const settleTextOf = (count: number, owner: string): string =>
  `an ${owner} bezahlt · ${cratesLabel(count)}`;

export const dayFactsOf = (crateCount: number): string =>
  crateCount === 0 ? '' : cratesLabel(crateCount);

export const PAY_TITLE = 'Bezahlen';
export const PAY_OPEN_TITLE = 'Offen, älteste zuerst';
export const PAY_COPY_LABEL = 'Kopieren';
export const PAY_COPIED_LABEL = 'Kopiert';

export const payLeadOf = (owner: string): string =>
  `Du bezahlst privat an ${owner} – der Verein ist nicht beteiligt. Sobald ${owner} die Zahlung einträgt, stehen die Kisten hier als bezahlt.`;

export const payLinkLabelOf = (cents: number): string => `Mit PayPal zahlen · ${euroOf(cents)}`;

export const payTotalOf = (count: number, cents: number): string =>
  `${cratesLabel(count)} · ${euroOf(cents)}`;

export const paypalLinkOf = (link: string, cents: number): string =>
  `${link.replace(/\/+$/, '')}/${(cents / 100).toFixed(2)}EUR`;

export const olderLabelOf = (hidden: number): string =>
  hidden === 1 ? 'Älteren Tag zeigen' : `Ältere Tage zeigen · ${hidden}`;
