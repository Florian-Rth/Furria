import type { KkHoldConfirm } from '@furria/ui/KkHoldButton';
import type { QueryErrorKind } from '@/lib/query-error';

export const cratesLabel = (count: number): string => (count === 1 ? '1 Kiste' : `${count} Kisten`);

export const OPEN_TOTAL_LABEL = 'Offen';
export const discLabel = (openCount: number, paidCount: number): string =>
  `${cratesLabel(openCount)} offen, ${cratesLabel(paidCount)} bezahlt`;
export const COUNT_LABEL = 'Anzahl Kisten';
export const countCaption = (count: number): string => (count === 1 ? 'Kiste' : 'Kisten');
export const bookLabel = (count: number): string =>
  count === 1 ? 'Kiste buchen' : `${count} Kisten buchen`;
export const HOLD_HINT = 'Gedrückt halten zum Buchen';
export const priceNote = (price: string): string => `${price} je Kiste`;

const landsOnTab = (count: number): string =>
  count === 1 ? 'Die Kiste kommt auf deine Liste.' : 'Die Kisten kommen auf deine Liste.';

export const bookConfirm = (count: number): KkHoldConfirm => ({
  eyebrow: 'Bierliste',
  question: `${cratesLabel(count)} buchen?`,
  explanation: landsOnTab(count),
  confirmLabel: bookLabel(count),
  cancelLabel: 'Abbrechen',
  closeLabel: 'Schließen',
});

export const EMPTY_STOCK_NOTE = 'Bestand leer.';

export const bookedTitle = (count: number): string => `${cratesLabel(count)} gebucht`;
export const bookedDetail = (amount: string): string => `+${amount} auf deiner Liste`;
export const UNDO_LABEL = 'Rückgängig';
export const bookedStamp = (amount: string): string => `+${amount}`;

export const BOOKING_ERROR_MESSAGES: Record<QueryErrorKind, string> = {
  unreachable: 'Keine Verbindung zum Server. Die Kiste ist nicht gebucht.',
  unexpected: 'Das hat nicht geklappt. Bitte versuche es erneut.',
  rejected: 'Der Server hat die Buchung abgelehnt.',
};

export const UNDO_ERROR_MESSAGES: Record<QueryErrorKind, string> = {
  unreachable: 'Keine Verbindung zum Server. Die Kiste bleibt gebucht.',
  unexpected: 'Rückgängig hat nicht geklappt. Die Kiste bleibt gebucht.',
  rejected: 'Rückgängig geht nur direkt nach dem Buchen. Die Kiste bleibt gebucht.',
};
