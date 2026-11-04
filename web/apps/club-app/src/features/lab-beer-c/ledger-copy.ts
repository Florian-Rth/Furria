import type { KkLedgerColumnLabels } from '@furria/ui/KkLedgerList';
import type { KkScreenOrigin } from '@furria/ui/screen-declaration';
import type {
  LabBeerCorrectionReason,
  LabBeerMovementKind,
} from '@/features/lab-beer/beer-lab-types';
import type { RowState } from './ledger-hub';

export const LEDGER_TITLE = 'Bierliste';
export const HUB_TITLE = 'Bierliste verwalten';
export const LAB_ORIGIN: KkScreenOrigin = { label: 'Lab', to: '/lab' };

export const HEAD_LABEL = 'Dein Deckel';
export const FIGURE_OPEN = 'offen';
export const FIGURE_OPEN_CRATES = 'Kisten';
export const FIGURE_PAID_CRATES = 'bezahlt';
export const STATUS_NONE = 'Noch keine Kiste auf deinem Deckel';
export const STATUS_CLEAR = 'Alles bezahlt';

export const statusOpenText = (day: string, days: number): string =>
  days === 0
    ? `Älteste offene Kiste von heute`
    : `Älteste offene Kiste vom ${day} · ${days} ${days === 1 ? 'Tag' : 'Tage'}`;

export const PAY_TITLE = 'So bezahlst du';
export const payOwnerText = (owner: string): string =>
  `An ${owner}, privat – nicht über den Verein`;
export const PAY_LINK_LABEL = 'PayPal';
export const COPY_LABEL = 'Zahlungsangaben kopieren';

export const VIEW_LABEL = 'Ansicht';
export const VIEW_STATEMENT = 'Deckel';
export const VIEW_GIVERS = 'Wer hat gegeben';

export const STATEMENT_LABEL = 'Kisten und Zahlungen';
export const STATEMENT_COLUMNS: KkLedgerColumnLabels = {
  day: 'Tag',
  entry: 'Buchung',
  amount: 'Betrag',
  balance: 'offen',
};
export const STATE_OPEN = 'offen';
export const STATE_PAID = 'bezahlt';
export const enteredByText = (name: string): string => `eingetragen von ${name}`;
export const SETTLEMENT_TITLE = 'Zahlung';
export const settlementMeta = (count: number, range: string): string =>
  `${count} ${count === 1 ? 'Kiste' : 'Kisten'} · ${range}`;
export const monthAside = (count: number): string =>
  count === 0 ? '' : `${count} ${count === 1 ? 'Kiste' : 'Kisten'}`;
export const STATEMENT_EMPTY = 'Keine Buchungen';

export const GIVERS_LABEL = 'Wer hat gegeben';
export const GIVERS_NAME = 'Name';
export const GIVERS_COUNT = 'Kisten';
export const GIVERS_LAST = 'zuletzt';

export const FOOT_LABEL = 'Kiste eintragen';
export const crateUnit = (count: number): string => (count === 1 ? 'Kiste' : 'Kisten');
export const LESS_LABEL = 'Eine Kiste weniger';
export const MORE_LABEL = 'Eine Kiste mehr';
export const HOLD_HINT = 'Halten zum Eintragen';
export const holdLabel = (sum: string): string => `Eintragen · ${sum}`;
export const footLine = (count: number, price: string, after: string): string =>
  `${count} × ${price} · danach offen ${after}`;
export const HOLD_CONFIRM = {
  eyebrow: 'Bierliste',
  question: 'Kisten eintragen?',
  explanation: 'Die Kisten kommen auf deinen Deckel.',
  confirmLabel: 'Eintragen',
  cancelLabel: 'Abbrechen',
  closeLabel: 'Schließen',
} as const;
export const afterText = (after: string): string => `danach offen ${after}`;
export const undoMessage = (count: number, sum: string): string =>
  `${count} ${crateUnit(count)} eingetragen · ${sum}`;
export const undoDetail = (after: string): string => `offen jetzt ${after}`;
export const UNDO_LABEL = 'Rückgängig';
export const EMPTY_STOCK =
  'Keine Kiste mehr im Bestand. Eintragen geht erst nach der nächsten Lieferung.';

export const REFUSALS: Record<string, string> = {
  notEnrolled: 'Du nimmst nicht an der Bierliste teil.',
  outOfStock: 'Nicht genug Kisten im Bestand.',
  countOutOfRange: 'Diese Anzahl geht nicht.',
  moreThanOpen: 'So viele offene Kisten gibt es nicht.',
  undoWindowClosed: 'Zu spät – rückgängig machen kann jetzt nur noch der Getränkewart.',
  notTheBooker: 'Nur wer die Kiste eingetragen hat, kann sie zurücknehmen.',
  notAffiliated: 'Nicht möglich.',
};

export const formerText = (day: string, by: string): string =>
  `Teilnahme beendet am ${day} von ${by}. Offene Kisten bleiben auf deinem Deckel.`;
export const REJOIN_LABEL = 'Wieder teilnehmen';

export const DECLARATION_TITLE = 'An der Bierliste teilnehmen';
export const declarationText = (owner: string): string =>
  `Ich nehme an der Bierliste teil. Kisten, die ich eintrage, kommen auf meinen eigenen Deckel. Ich bezahle sie privat an ${owner}. Der Verein ist daran nicht beteiligt.`;
export const DECLARATION_CHECK = 'Verstanden und einverstanden';
export const DECLARATION_CONFIRM = 'Teilnehmen';

export const BOOK_EYEBROW = 'Bierliste';
export const bookOwnerText = (owner: string): string => `Kisten von ${owner} · privat`;
export const RECEIPT_LABEL = 'Rechnung';
export const receiptPrice = (count: number, price: string): string => `${count} × ${price}`;
export const RECEIPT_BEFORE = 'bisher offen';
export const RECEIPT_AFTER = 'danach offen';
export const RECEIPT_SUM = 'Summe';
export const DONE_TITLE = 'Eingetragen';
export const doneTime = (time: string): string => `um ${time} Uhr`;
export const DONE_OPEN = 'offen jetzt';
export const DONE_AGAIN = 'Noch eine Kiste';
export const BOOK_FOR = 'für';

export const HUB_SETTINGS = 'Einstellungen';
export const HUB_QR = 'Palettencode';
export const HEALTH_LABEL = 'Stand';
export const TILE_STOCK = 'Bestand';
export const TILE_OPEN = 'Offen';
export const TILE_OVERDUE = 'Überfällig';
export const TILE_RUNNING = 'Teilnahmen';
export const stockFigure = (count: number): string => `${count}`;
export const emptyOnText = (day: string): string => `leer ca. ${day}`;
export const NO_FORECAST = 'kein Verbrauch';
export const openPeopleText = (count: number): string =>
  count === 0 ? 'keine' : `auf ${count} ${count === 1 ? 'Deckel' : 'Deckeln'}`;
export const OVERDUE_NOTE = 'älter als 7 Tage';
export const endedText = (count: number): string =>
  count === 0 ? 'keine beendet' : `${count} beendet`;
export const tileAria = (label: string, figure: string): string => `${label}: ${figure}`;
export const gaugeLabel = (share: number): string =>
  `Bestand zu ${Math.round(share * 100)} % gefüllt`;

export const SORT_LABEL = 'Sortierung';
export const SORT_OPEN = 'offen €';
export const SORT_OLDEST = 'älteste';
export const SORT_NAME = 'Name';
export const FILTER_LABELS: Record<string, string> = {
  all: 'Alle',
  open: 'Mit offenen Kisten',
  overdue: 'Überfällig',
  running: 'Laufende Teilnahmen',
};
export const SHOW_ALL = 'Alle zeigen';
export const TABLE_LABEL = 'Deckel aller';
export const TABLE_HEAD = {
  name: 'Name',
  count: 'Kisten',
  amount: 'offen',
  oldest: 'älteste',
  paid: 'bezahlt',
} as const;
export const TABLE_EMPTY = 'Keine';
export const ROW_STATE_LABELS: Record<RowState, string> = {
  ended: 'beendet',
  overdue: 'überfällig',
  open: 'offen',
  clear: 'bezahlt',
  fresh: 'neu',
};
export const phoneMetaText = (count: number, day: string | null, paid: number): string =>
  count === 0 ? `${paid} bezahlt` : `${count} offen · seit ${day ?? ''} · ${paid} bezahlt`;

export const PANE_CLOSE = 'Schließen';
export const PANE_TABS_LABEL = 'Bereich';
export const PANE_TAB_TAB = 'Deckel';
export const PANE_TAB_ENROLLMENT = 'Teilnahme';
export const paneContext = (openCount: number, open: string): string =>
  openCount === 0 ? 'Deckel ausgeglichen' : `${openCount} offen · ${open}`;
export const PAY_ACTION = 'Zahlung buchen';
export const CRATE_ACTION = 'Kiste eintragen';
export const END_ACTION = 'Teilnahme beenden';
export const PAYMENT_TITLE = 'Zahlung buchen';
export const PAYMENT_EXPLAIN = 'Ganze Kisten, älteste zuerst.';
export const paymentConfirm = (count: number, sum: string): string =>
  `${count} ${crateUnit(count)} · ${sum} als bezahlt buchen`;
export const paymentRest = (count: number): string =>
  count === 0 ? 'danach ausgeglichen' : `danach noch ${count} offen`;
export const SETTLES_LABEL = 'Begleicht';
export const CANCEL = 'Abbrechen';
export const crateForConfirm = (count: number, name: string): string =>
  `${count} ${crateUnit(count)} für ${name} eintragen`;
export const ENROLLMENT_SINCE = 'Teilnahme seit';
export const ENROLLMENT_ENDED = 'Beendet';
export const enrollmentEndedText = (day: string, by: string): string => `${day} von ${by}`;
export const ENROLLMENT_RUNNING = 'läuft';
export const END_CONFIRM = {
  eyebrow: 'Teilnahme',
  question: 'Teilnahme beenden?',
  explanation:
    'Danach kann diese Person keine Kisten mehr eintragen. Offene Kisten bleiben auf ihrem Deckel.',
  confirmLabel: 'Beenden',
  cancelLabel: 'Abbrechen',
  closeLabel: 'Schließen',
} as const;

export const STOCK_TITLE = 'Bestand';
export const stockContext = (count: number): string => `${count} ${crateUnit(count)} im Bestand`;
export const forecastText = (crates: number, pace: string, day: string | null): string =>
  day === null
    ? `21 Tage: ${crates} Kisten · kein Verbrauch`
    : `21 Tage: ${crates} Kisten ≈ ${pace} am Tag → leer ca. ${day}`;
export const DELIVERY_TITLE = 'Lieferung';
export const DELIVERY_FIELD = 'Kisten geliefert';
export const DELIVERY_ACTION = 'Lieferung buchen';
export const CORRECTION_TITLE = 'Korrektur';
export const CORRECTION_FIELD = 'Kisten (− weniger, + mehr)';
export const CORRECTION_REASON = 'Grund';
export const CORRECTION_ACTION = 'Korrektur buchen';
export const STEP_LABELS = { less: 'Weniger', more: 'Mehr' } as const;
export const REASONS: Record<LabBeerCorrectionReason, string> = {
  shrinkage: 'Schwund',
  breakage: 'Bruch',
  miscount: 'Zählfehler',
};
export const MOVEMENT_KINDS: Record<LabBeerMovementKind, string> = {
  delivery: 'Lieferung',
  correction: 'Korrektur',
  handoverCarry: 'Übernommen',
};
export const HISTORY_LABEL = 'Bewegungen';
export const HISTORY_COLUMNS: KkLedgerColumnLabels = {
  day: 'Tag',
  entry: 'Bewegung',
  amount: 'Kisten',
  balance: 'Bestand',
};

export const SETTINGS_TITLE = 'Einstellungen';
export const PRICE_FIELD = 'Preis je Kiste';
export const LINK_FIELD = 'PayPal-Link';
export const NOTE_FIELD = 'Zahlungsangaben (z. B. IBAN)';
export const SAVE_SETTINGS = 'Speichern';
export const SAVED = 'Gespeichert';
export const PRICE_INVALID = 'Preis in Euro, z. B. 18,00';
export const PRICE_NOTE = 'Gilt für neue Kisten. Eingetragene Kisten behalten ihren Preis.';
export const QR_TITLE = 'Palettencode';
export const QR_EYEBROW = 'Bierliste';
export const QR_HEADLINE = 'Kiste nehmen, scannen';
export const qrLines = (owner: string, price: string): readonly string[] => [
  `${price} je Kiste · an ${owner}`,
  'Kommt auf deinen eigenen Deckel',
];
export const QR_LABEL = 'Palettencode zum Eintragen';
export const PRINT_ACTION = 'Drucken';
export const HANDOVER_TITLE = 'Übergabe';
export const HANDOVER_TEXT =
  'Bierliste an eine neue Person übergeben. Der Bestand geht mit, offene Kisten bleiben bei dir.';

export const LAB_SWITCH_LABEL = 'Lab: Ansicht als';
export const LAB_EMPTY_STOCK = 'Lab: Bestand leeren';
export const LAB_RESET = 'Lab: zurücksetzen';
