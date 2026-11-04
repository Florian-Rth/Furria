export const BEER_TITLE = 'Bierliste';
export const BEER_HUB_TITLE = 'Bierliste verwalten';

export const cratesLabel = (count: number): string => (count === 1 ? '1 Kiste' : `${count} Kisten`);

export const daysLabel = (days: number): string => (days === 1 ? '1 Tag' : `${days} Tagen`);

export const OPEN_LABEL = 'Offen';
export const NOTHING_OPEN = 'nichts';
export const PAID_LABEL = 'Bezahlt';
export const openSinceLabel = (days: number): string => `seit ${daysLabel(days)} offen`;
export const tabDetailLabel = (openCount: number, sinceDay: string): string =>
  `${cratesLabel(openCount)} · älteste vom ${sinceDay}`;
export const allPaidDetail = (paidCount: number): string =>
  paidCount === 0 ? 'Noch keine Kiste gebucht' : `${cratesLabel(paidCount)}, alles bezahlt`;
export const discLabel = (openCount: number, paidCount: number): string =>
  `${cratesLabel(openCount)} offen, ${cratesLabel(paidCount)} bezahlt`;

export const PAY_LABEL = 'Bezahlen an';
export const PAYPAL_LABEL = 'PayPal';
export const COPY_LABEL = 'Zahlungsdaten kopieren';
export const COPIED_LABEL = 'Kopiert';

export const COUNT_LABEL = 'Anzahl Kisten';
export const countCaption = (count: number): string => (count === 1 ? 'Kiste' : 'Kisten');
export const countOptionLabel = (count: number): string => cratesLabel(count);
export const bookLabel = (count: number): string =>
  count === 1 ? 'Kiste buchen' : `${count} Kisten buchen`;
export const HOLD_HINT = 'Gedrückt halten zum Buchen';
export const bookNote = (price: string): string => `${price} je Kiste · kommt auf deine Liste`;
export const bookConfirm = (count: number, owner: string) => ({
  eyebrow: BEER_TITLE,
  question: `${cratesLabel(count)} buchen?`,
  explanation: `Die Kisten kommen auf deine Liste. Du zahlst sie privat an ${owner}.`,
  confirmLabel: bookLabel(count),
  cancelLabel: 'Abbrechen',
  closeLabel: 'Schließen',
});

export const bookedTitle = (count: number): string => `${cratesLabel(count)} gebucht`;
export const bookedDetail = (amount: string): string => `${amount} kommen auf deine Liste`;
export const UNDO_LABEL = 'Rückgängig';
export const DONE_TITLE = 'Fertig';
export const doneDetail = (count: number, total: string): string =>
  `${cratesLabel(count)} gebucht · offen jetzt ${total}`;
export const BOOK_AGAIN = 'Noch eine buchen';

export const HISTORY_TITLE = 'Deine Kisten';
export const HISTORY_LABEL = 'Deine Kisten nach Zahlung';
export const OPEN_GROUP = 'Offen';
export const paidGroupTitle = (day: string): string => `Bezahlt am ${day}`;
export const CRATE_LINE = 'Kiste';
export const enteredByLine = (name: string): string => `Kiste · von ${name}`;
export const openDaysNote = (days: number): string => (days === 0 ? 'heute' : `${days} T.`);
export const OLDER_PAYMENTS = 'Ältere Zahlungen';

export const GIVERS_TITLE = 'Wer hat Kisten gegeben';
export const GIVERS_LABEL = 'Gegebene Kisten, zuletzt gegeben zuerst';
export const NO_GIVERS = 'Noch keine Kisten gegeben.';

export const FORMER_NOTE =
  'Du nimmst nicht mehr an der Bierliste teil. Wieder teilnehmen kannst du in Mein Profil.';

export const DECLARE_TITLE = 'An der Bierliste teilnehmen';
export const declareText = (owner: string): string =>
  `Ich nehme an der Bierliste von ${owner} teil. Kisten, die ich buche, stehen auf meinem Namen, bis ich sie ${owner} privat bezahlt habe. Der Verein ist daran nicht beteiligt.`;
export const DECLARE_CONFIRM = 'Ich nehme teil';

export const EMPTY_TITLE = 'Keine Kisten mehr da';
export const emptyText = (owner: string): string =>
  `Der Bestand ist leer. Buchen geht erst wieder, wenn ${owner} eine Lieferung eingetragen hat.`;

export const REFUSALS = {
  notEnrolled: 'Du nimmst nicht an der Bierliste teil.',
  outOfStock: 'So viele Kisten sind nicht mehr da.',
  countOutOfRange: 'Diese Anzahl geht nicht.',
  moreThanOpen: 'So viele Kisten sind nicht offen.',
  undoWindowClosed: 'Rückgängig geht nur direkt nach dem Buchen.',
  notTheBooker: 'Diese Kisten hat jemand anderes gebucht.',
  notAffiliated: 'Diese Person gehört nicht zum Verein.',
} as const;

export const potLine = (owner: string): string => `Bierliste · ${owner}`;
export const openShort = (amount: string): string => `${amount} offen`;

export const LAB_SWITCH_LABEL = 'Lab: Ansicht als';
export const LAB_EMPTY_STOCK = 'Bestand leer';
export const LAB_VIEWER_LABELS = {
  openTab: 'Lena · offen',
  bigDebt: 'Kevin · lange offen',
  allPaid: 'Paul · bezahlt',
  former: 'Dieter · beendet',
  fresh: 'Anna · neu',
  notEnrolled: 'Nina · nicht dabei',
  owner: 'Sabine · Inhaberin',
  operator: 'Frank · verwaltet',
} as const;

export const QUEUE_LABEL = 'Offene Arbeit, dringendste zuerst';
export const FILTER_LABEL = 'Offene Listen filtern';
export const FILTER_OPEN = 'Offen';
export const FILTER_OVERDUE = 'Ab 7 Tagen';
export const peopleCount = (count: number): string =>
  count === 1 ? '1 Person' : `${count} Personen`;
export const TOTAL_OPEN = 'Offen gesamt';
export const totalDetail = (people: number, overdue: number): string =>
  overdue === 0
    ? `bei ${peopleCount(people)}`
    : `bei ${peopleCount(people)} · ${overdue} ab 7 Tagen`;
export const QUEUE_EMPTY = 'Nichts offen.';
export const FILTER_EMPTY = 'Keine Liste ist 7 Tage oder länger offen.';
export const OPEN_ROW = 'Zahlung öffnen';
export const PAYMENT_ACTION = 'Zahlung';
export const queueFact = (count: number, amount: string): string =>
  `${cratesLabel(count)} · ${amount}`;
export const FORMER_FACT = 'beendet';
export const sinceDays = (days: number): string => (days === 0 ? 'heute' : `${days} T.`);

export const stockTitle = (stock: number): string => `Bestand: ${cratesLabel(stock)}`;
export const stockFact = (day: string, pace: string): string => `leer ≈ ${day} · ${pace}/Tag`;
export const DELIVERY_ACTION = 'Lieferung';
export const stockDays = (days: number): string => `≈ ${Math.max(0, Math.round(days))} T.`;

export const SETTLED_TITLE = 'Bezahlt';
export const SETTLED_LABEL = 'Vollständig bezahlte Listen';
export const settledCount = (count: number): string => `${count} bezahlt`;

export const ENTRIES_LABEL = 'Weitere Bereiche';
export const ENTRY_STOCK = 'Bestand';
export const ENTRY_ENROLLMENTS = 'Teilnahmen';
export const ENTRY_CRATE_FOR = 'Kiste buchen';
export const ENTRY_SETTINGS = 'Einstellungen';
export const ENTRY_HANDOVER = 'Übergabe';
export const CLOSE_LABEL = 'Schließen';

export const paymentTitle = (name: string): string => `Zahlung · ${name}`;
export const PAYMENT_COUNT = 'Bezahlte Kisten';
export const STEP_LABELS = { less: 'Eine Kiste weniger', more: 'Eine Kiste mehr' } as const;
export const SETTLES_LABEL = 'Diese Kisten werden bezahlt, älteste zuerst';
export const SETTLES_HEAD = 'Wird bezahlt';
export const STAYS_HEAD = 'Bleibt offen';
export const paymentBook = (amount: string): string => `Zahlung buchen · ${amount}`;
export const PAYMENT_HINT = 'Gedrückt halten zum Buchen';
export const paymentConfirm = (name: string, count: number, amount: string) => ({
  eyebrow: 'Zahlung',
  question: `${amount} von ${name} erhalten?`,
  explanation: `${cratesLabel(count)} werden als bezahlt eingetragen, älteste zuerst.`,
  confirmLabel: 'Zahlung buchen',
  cancelLabel: 'Abbrechen',
  closeLabel: 'Schließen',
});
export const paidBefore = (count: number, day: string): string =>
  `Vorher bezahlt: ${cratesLabel(count)}, zuletzt am ${day}`;
export const FORMER_PAYMENT_NOTE = 'Teilnahme beendet – offene Kisten bleiben bis zur Zahlung.';

export const STOCK_PANE = 'Bestand & Prognose';
export const STOCK_NOW = 'Bestand';
export const stockNowDetail = (pace: string): string => `${pace} Kisten am Tag (21 Tage)`;
export const emptyOnLabel = (day: string): string => `leer etwa ${day}`;
export const NO_FORECAST = 'Kein Verbrauch in den letzten 21 Tagen';
export const RUNWAY_LABEL = (days: string): string => `Reicht noch ${days}`;
export const RUNWAY_START = 'heute';
export const RUNWAY_HORIZON = '7 T.';
export const RUNWAY_END = '14 T.';
export const DELIVERY_TITLE = 'Lieferung buchen';
export const DELIVERY_COUNT = 'Gelieferte Kisten';
export const deliveryBook = (count: number): string => `${cratesLabel(count)} einbuchen`;
export const CORRECTION_TITLE = 'Korrektur';
export const CORRECTION_COUNT = 'Kisten';
export const CORRECTION_REASON = 'Grund';
export const CORRECTION_REASONS = [
  { id: 'shrinkage', label: 'Schwund' },
  { id: 'breakage', label: 'Bruch' },
  { id: 'miscount', label: 'Zählfehler' },
] as const;
export const CORRECTION_DIRECTION = 'Richtung';
export const CORRECTION_DIRECTIONS = [
  { id: 'less', label: 'Weniger da' },
  { id: 'more', label: 'Mehr da' },
] as const;
export const correctionBook = (count: number, less: boolean): string =>
  `${less ? '−' : '+'}${cratesLabel(count)} korrigieren`;
export const MOVEMENTS_TITLE = 'Bewegungen';
export const MOVEMENTS_LABEL = 'Lieferungen und Korrekturen, neueste zuerst';
export const MOVEMENT_KINDS = {
  delivery: 'Lieferung',
  correction: 'Korrektur',
  handoverCarry: 'Übernommen',
} as const;
export const REASON_LABELS = { shrinkage: 'Schwund', breakage: 'Bruch', miscount: 'Zählfehler' };
export const movementAmount = (count: number): string => (count > 0 ? `+${count}` : `−${-count}`);
export const bookedNote = (text: string): string => text;
export const deliveryDone = (count: number): string => `${cratesLabel(count)} eingebucht`;
export const correctionDone = (count: number): string => `Bestand um ${count} korrigiert`;

export const ENROLLMENTS_PANE = 'Teilnahmen';
export const ENROLLED_HEAD = 'Nehmen teil';
export const ENDED_HEAD = 'Beendet';
export const enrolledSince = (day: string): string => `seit ${day}`;
export const endedLine = (day: string, by: string): string => `am ${day} von ${by}`;
export const END_ACTION = 'Beenden';
export const endConfirm = (name: string) => ({
  eyebrow: 'Teilnahme',
  question: `Teilnahme von ${name} beenden?`,
  explanation: `${name} kann danach keine Kisten mehr buchen. Offene Kisten bleiben offen, bis sie bezahlt sind.`,
  confirmLabel: 'Teilnahme beenden',
  cancelLabel: 'Abbrechen',
  closeLabel: 'Schließen',
});
export const openFact = (amount: string): string => `${amount} offen`;

export const CRATE_FOR_PANE = 'Kiste für jemanden buchen';
export const CRATE_FOR_PERSON = 'Für wen';
export const crateForBook = (count: number, name: string): string =>
  `${cratesLabel(count)} für ${name} buchen`;
export const crateForDone = (count: number, name: string): string =>
  `${cratesLabel(count)} für ${name} gebucht`;
export const CRATE_FOR_NOTE =
  'Die Kisten kommen auf die Liste dieser Person. Vermerkt wird, dass du sie eingetragen hast.';

export const SETTINGS_PANE = 'Einstellungen';
export const PRICE_LABEL = 'Preis je Kiste';
export const PRICE_HINT = 'Gilt für neue Kisten. Gebuchte Kisten behalten ihren Preis.';
export const PRICE_ERROR = 'Bitte einen Preis wie 18,00 eingeben.';
export const LINK_LABEL = 'PayPal-Link';
export const NOTE_LABEL = 'Zahlungshinweis (z. B. IBAN)';
export const SAVE_LABEL = 'Speichern';
export const SAVED_LABEL = 'Gespeichert';
export const PALLET_TITLE = 'Palettencode';
export const PALLET_LABEL = 'QR-Code zum Buchen an der Palette';
export const PALLET_NOTE =
  'Ausdrucken und an die Palette kleben. Scannen öffnet direkt das Buchen.';
export const PRINT_LABEL = 'Drucken';

export const HANDOVER_PANE = 'Übergabe';
export const handoverOwner = (owner: string): string => `Die Bierliste läuft auf ${owner}.`;
export const HANDOVER_NOTE =
  'Die Übergabe an eine neue Person – mit Abrechnung und übernommenem Bestand – kommt noch.';
export const OWNER_LABEL = 'Inhaberin';
