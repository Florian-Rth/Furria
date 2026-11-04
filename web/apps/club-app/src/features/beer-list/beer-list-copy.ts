import type { QueryErrorKind } from '@/lib/query-error';
import { cratesLabel } from './booking/booking-copy';
import type { BeerBookingGate } from './booking/booking-gate';

export const BEER_LIST_TITLE = 'Bierliste';
export const BEER_LIST_META = 'Kisten buchen und deine Liste sehen';
export const openMeta = (amount: string): string => `${amount} offen`;

const daysLabel = (days: number): string => (days === 1 ? '1 Tag' : `${days} Tagen`);

export const openSinceLabel = (days: number): string => `seit ${daysLabel(days)} offen`;
export const openDetail = (openCount: number, sinceDay: string): string =>
  `${cratesLabel(openCount)} · älteste vom ${sinceDay}`;
export const settledDetail = (paidCount: number): string =>
  paidCount === 0 ? 'Noch keine Kiste gebucht' : `${cratesLabel(paidCount)}, alles bezahlt`;

export const PAY_LABEL = 'Bezahlen an';
export const PAY_EARLIER_LABEL = 'Noch offen bei';
export const payeeLine = (name: string | null, amount: string): string =>
  name === null ? amount : `${name} · ${amount}`;
export const PAYPAL_LABEL = 'PayPal';
export const COPY_LABEL = 'Zahlungsdaten kopieren';
export const COPIED_LABEL = 'Kopiert';

export const HISTORY_TITLE = 'Deine Kisten';
export const HISTORY_LABEL = 'Deine Kisten nach Zahlung';
export const OLDER_PAYMENTS = 'Ältere Zahlungen';
export const OPEN_GROUP = 'Offen';
export const earlierOpenGroup = (owner: string | null): string =>
  owner === null ? 'Offen, frühere Liste' : `Offen bei ${owner}`;
export const paidGroupTitle = (day: string): string => `Bezahlt am ${day}`;
export const CRATE_LINE = 'Kiste';
export const enteredByLine = (firstName: string): string => `Kiste · von ${firstName}`;
export const openDaysNote = (days: number): string => (days === 0 ? 'heute' : `${days} T.`);

export const GIVERS_TITLE = 'Wer hat Kisten gegeben';
export const GIVERS_LABEL = 'Gegebene Kisten nach Name';
export const NO_GIVERS = 'Noch keine Kisten gegeben.';

const FORMER_NOTE =
  'Du nimmst nicht mehr an der Bierliste teil. Hier siehst du, was noch offen ist. Wieder teilnehmen kannst du in Mein Profil.';
const KEEPER_NOTE =
  'Selbst Kisten buchen kannst du, sobald du in Mein Profil an der Bierliste teilnimmst.';
const NO_POT_NOTE = 'Gerade ist keine Bierliste offen. Buchen geht wieder, sobald eine läuft.';

export const GATE_NOTES: Record<Exclude<BeerBookingGate, 'open'>, string> = {
  former: FORMER_NOTE,
  keeper: KEEPER_NOTE,
  noPot: NO_POT_NOTE,
  enroll: KEEPER_NOTE,
};

export const DENIED_MESSAGE = 'Die Bierliste siehst du, wenn du in Mein Profil an ihr teilnimmst.';
export const RETRY_LABEL = 'Erneut laden';
export const FAILED_LINE = 'Deine Bierliste konnte nicht geladen werden.';

export const BEER_LIST_ERROR_MESSAGES: Record<QueryErrorKind, string> = {
  unreachable: 'Keine Verbindung zum Server.',
  unexpected: 'Die Bierliste konnte nicht geladen werden.',
  rejected: 'Der Server hat die Anfrage abgelehnt.',
};
