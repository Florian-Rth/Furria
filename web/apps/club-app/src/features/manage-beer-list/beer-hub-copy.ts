import type { KkHoldConfirm } from '@furria/ui/KkHoldButton';
import type { KkNumberStepLabels } from '@furria/ui/KkNumberField';
import type { KkPourQuickItem } from '@furria/ui/KkPourQuickBar';
import type { KkPourStockLine, KkPourStockLinesLabels } from '@furria/ui/pour-stock-line';
import type { KkScreenOrigin } from '@furria/ui/screen-declaration';
import { payWaysLine } from '@/features/beer-list/beer-list-copy';
import { BEER_LIST_PATH } from '@/features/session/app-sections';
import type { PersonRef } from '@/lib/api/schemas';
import { formatEuroCents } from '@/lib/money';
import type { QueryErrorKind } from '@/lib/query-error';
import type {
  BeerBookable,
  BeerHubSummary,
  BeerJournalEntry,
  BeerKindFilter,
  BeerOutlook,
  BeerRosterRow,
} from './beer-hub';
import {
  DRINK_NAME_MAX,
  leadDrinkOf,
  listedDrinksOf,
  OVERDUE_AFTER_DAYS,
  STOCK_MAX_CRATES,
} from './beer-hub';
import type { BeerDayName } from './beer-time';
import { clockOf, dayMonthOfKey, shortDateOf, weekdayDateOf } from './beer-time';
import type {
  BeerEnrollment,
  BeerJournalCrate,
  BeerJournalPayment,
  BeerPaymentDrink,
  BeerStockChange,
  BeerStockDrink,
} from './schemas';

export const HUB_TITLE = 'Bierliste';
export const HUB_PATH = '/beer-list/manage';
export const HUB_ENTRY_LABEL = 'Bierliste verwalten';
export const HUB_ORIGIN: KkScreenOrigin = { label: 'Bierliste', to: BEER_LIST_PATH };
export const CLOSE_LABEL = 'Schließen';
export const CANCEL_LABEL = 'Abbrechen';

export const cratesLabel = (count: number): string => (count === 1 ? '1 Kiste' : `${count} Kisten`);

const cratesOfDrink = (count: number, drink: string | null): string =>
  drink === null ? cratesLabel(count) : `${cratesLabel(count)} ${drink}`;

const paidDrinksTextOf = (drinks: readonly BeerPaymentDrink[], crates: number): string => {
  const [only] = drinks;

  if (drinks.length > 1) {
    return drinks.map((drink) => `${drink.crates} ${drink.name}`).join(' · ');
  }

  return cratesOfDrink(crates, only?.name ?? null);
};

export const euroOf = formatEuroCents;

const WHOLE_EUROS_FROM_CENTS = 100_000;

const wholeEuroFormat = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
});

/** Figure tile: from 1.000 € on, whole euros keep the figure inside a phone-width tile. */
export const tileEuroOf = (cents: number): string =>
  cents >= WHOLE_EUROS_FROM_CENTS ? wholeEuroFormat.format(Math.round(cents / 100)) : euroOf(cents);

export const fullNameOf = (person: PersonRef | null): string =>
  person === null ? 'Unbekannt' : `${person.firstName} ${person.lastName}`;

export const firstNameOf = (person: PersonRef | null): string =>
  person === null ? 'Unbekannt' : person.firstName;

export const dayLabelOf = (name: BeerDayName, dayKey: string): string => {
  if (name === 'today') {
    return 'Heute';
  }

  return name === 'yesterday' ? 'Gestern' : weekdayDateOf(dayKey);
};

export const daysLabel = (days: number): string => {
  if (days === 0) {
    return 'seit heute';
  }

  return days === 1 ? 'seit gestern' : `seit ${days} Tagen`;
};

const personsOf = (count: number): string => (count === 1 ? '1 Person' : `${count} Personen`);

export const HEAD_LABEL = 'Lage der Bierliste';
export const STOCK_LABEL = 'Bestand';
export const STOCK_UNIT = 'Kisten';
export const COUNTERS_LABEL = 'Kennzahlen';
export const OPEN_LABEL = 'offen';
export const OVERDUE_LABEL = `ab ${OVERDUE_AFTER_DAYS} Tagen`;
export const PEOPLE_LABEL = 'nehmen teil';
export const QUICK_LABEL = 'Schnell eintragen';
export const KIND_FILTER_LABEL = 'Art';
export const PERSON_FILTER_LABEL = 'Person';
export const PERSON_FILTER_ALL = 'Alle Personen';
export const JOURNAL_EMPTY = 'Keine Einträge.';
export const ROSTER_LABEL = 'Offene Kisten';
export const OLDER_LABEL = 'Ältere Tage zeigen';

export const QUICK_ITEMS: readonly KkPourQuickItem[] = [
  { id: 'payment', label: 'Zahlung', icon: 'add', lead: true },
  { id: 'crates', label: 'Kisten', icon: 'add' },
  { id: 'stock', label: 'Bestand', icon: 'edit' },
];

export const KIND_LABELS: Record<BeerKindFilter, string> = {
  all: 'Alles',
  crate: 'Kisten',
  payment: 'Zahlung',
  stock: 'Bestand',
  enrollment: 'Teilnahme',
};

export const KIND_ORDER: readonly BeerKindFilter[] = [
  'all',
  'crate',
  'payment',
  'stock',
  'enrollment',
];

export const stockCaptionOf = (outlook: BeerOutlook): string => {
  if (outlook.emptyOn === null || outlook.daysLeft === null) {
    return `kein Verbrauch in ${outlook.paceWindowDays} Tagen`;
  }

  const day = weekdayDateOf(outlook.emptyOn);

  return outlook.warns
    ? `leer ≈ ${day} · in ${Math.round(outlook.daysLeft)} T.`
    : `reicht bis ≈ ${day}`;
};

export const headCaptionOf = (summary: BeerHubSummary): string =>
  summary.leadName === null
    ? stockCaptionOf(summary)
    : `${summary.leadName}: ${stockCaptionOf(summary)}`;

export const stockChartLabelsOf = (summary: BeerHubSummary): KkPourStockLinesLabels => ({
  from: dayMonthOfKey(summary.seriesFromOn),
  now: 'heute',
});

export const stockLinesOf = (summary: BeerHubSummary): readonly KkPourStockLine[] =>
  summary.drinks.map((drink) => ({
    key: String(drink.beerDrinkId),
    label: drink.name,
    facts: cratesLabel(drink.stock),
    outlook: stockCaptionOf(drink.outlook),
    warn: drink.outlook.warns,
    values: drink.series,
    forecastDays: drink.outlook.daysLeft,
  }));

const actorNote = (entry: BeerJournalEntry, verb: string): string | null =>
  entry.actor === null || entry.actor.personId === entry.person?.personId
    ? null
    : `${verb} ${firstNameOf(entry.actor)}`;

export interface BeerJournalCopy {
  text: string;
  note: string | null;
  amount: string | null;
  delta: string | null;
}

export const signed = (value: number): string => (value > 0 ? `+${value}` : `−${Math.abs(value)}`);

const movementTextOf = (entry: BeerJournalEntry): string => {
  const crates = cratesOfDrink(entry.count, entry.drink);

  if (entry.movement === 'handoverCarry') {
    return `Übernommen · ${crates}`;
  }

  return entry.movement === 'handedOver' ? `Übergeben · ${crates}` : `Lieferung · ${crates}`;
};

export const journalCopyOf = (entry: BeerJournalEntry): BeerJournalCopy => {
  const amount = entry.cents === null ? null : euroOf(entry.cents);
  const delta = entry.stockDelta === 0 ? null : signed(entry.stockDelta);

  switch (entry.kind) {
    case 'crate':
      return {
        text: cratesOfDrink(entry.count, entry.drink),
        note: entry.undone ? 'zurückgenommen' : actorNote(entry, 'eingetragen von'),
        amount,
        delta,
      };
    case 'payment':
      return {
        text: `zahlt ${paidDrinksTextOf(entry.drinks, entry.count)}`,
        note: entry.undone ? 'zurückgenommen' : actorNote(entry, 'gebucht von'),
        amount,
        delta,
      };
    case 'delivery':
      return { text: movementTextOf(entry), note: actorNote(entry, 'von'), amount, delta };
    case 'correction':
      return {
        text: `Korrektur · ${cratesOfDrink(entry.count, entry.drink)}`,
        note: actorNote(entry, 'von'),
        amount,
        delta,
      };
    case 'enrolled':
      return { text: 'nimmt teil', note: null, amount, delta };
    default:
      return { text: 'Teilnahme beendet', note: actorNote(entry, 'von'), amount, delta };
  }
};

export const rosterFactsOf = (row: BeerRosterRow): string => {
  const ended = row.enrollmentId === null ? 'Teilnahme beendet · ' : '';

  if (row.openCrates > 0) {
    return `${ended}${daysLabel(row.openDays ?? 0)} · ${cratesLabel(row.paidCrates)} bezahlt`;
  }

  return row.paidCrates > 0
    ? `${ended}alles bezahlt · ${cratesLabel(row.paidCrates)}`
    : `${ended}noch keine Kiste`;
};

export const endConfirmOf = (name: string): KkHoldConfirm => ({
  eyebrow: 'Teilnahme',
  question: `Teilnahme von ${name} beenden?`,
  explanation: `${name} kann dann keine Kisten mehr buchen.`,
  confirmLabel: 'Beenden',
  cancelLabel: CANCEL_LABEL,
  closeLabel: CLOSE_LABEL,
});

export const crateUndoConfirmOf = (count: number): KkHoldConfirm => ({
  eyebrow: 'Kiste',
  question: `${cratesLabel(count)} zurücknehmen?`,
  explanation: 'Die Kiste wird gestrichen und zählt wieder zum Bestand.',
  confirmLabel: 'Zurücknehmen',
  cancelLabel: CANCEL_LABEL,
  closeLabel: CLOSE_LABEL,
});

export const paymentUndoConfirmOf = (count: number): KkHoldConfirm => ({
  eyebrow: 'Zahlung',
  question: `Zahlung über ${cratesLabel(count)} zurücknehmen?`,
  explanation: 'Die Kisten dieser Zahlung sind danach wieder offen.',
  confirmLabel: 'Zurücknehmen',
  cancelLabel: CANCEL_LABEL,
  closeLabel: CLOSE_LABEL,
});

export const END_LABEL = 'Teilnahme beenden';
export const HOLD_HINT = 'Zum Bestätigen halten';
export const UNDO_LABEL = 'Zurücknehmen';
export const PAY_ALL_LABEL = 'Alles';
export const payStepLabelsOf = (name: string): KkNumberStepLabels => ({
  less: `${name}: eine Kiste weniger`,
  more: `${name}: eine Kiste mehr`,
});
export const payOpenOf = (open: number): string => `von ${open}`;
export const STEP_LABELS = { less: 'Eine weniger', more: 'Eine mehr' } as const;
export const PERSON_LABEL = 'Person';
export const COUNT_FIELD_LABEL = 'Anzahl Kisten';
export const STOCK_FIELD_LABEL = 'Kisten dazu (+) oder weg (−)';
export const NO_OPEN_TABS = 'Gerade sind keine Kisten offen.';
export const OPEN_SECTION = 'Offen';
export const PAYMENTS_SECTION = 'Zahlungen';
export const ENROLL_SECTION = 'Teilnahme';
export const PAID_SWITCH_LABEL = 'Schon bezahlt';
export const NO_PEOPLE = 'Noch nimmt niemand teil.';

export const paymentButtonOf = (cents: number): string => `Zahlung buchen · ${euroOf(cents)}`;

export const crateButtonOf = (
  count: number,
  drink: string | null,
  name: string | null,
  paid: boolean,
): string =>
  `${cratesOfDrink(count, drink)}${name === null ? '' : ` für ${name}`} buchen${paid ? ' · bezahlt' : ''}`;

export const stockButtonOf = (change: BeerStockChange | null): string => {
  if (change === null) {
    return 'Bestand buchen';
  }

  return change.kind === 'delivery'
    ? `Lieferung buchen · ${signed(change.crates)}`
    : `Korrektur buchen · ${signed(change.crates)}`;
};

export const stockAfterOf = (stock: number, delta: number): string | undefined =>
  stock + delta < 0 ? undefined : `Bestand danach: ${stock + delta} Kisten`;

export const personOptionLabelOf = (row: BeerRosterRow): string =>
  row.openCrates > 0
    ? `${fullNameOf(row.person)} · ${openCountOf(row.openCrates)}`
    : fullNameOf(row.person);

export const FORM_TITLES = {
  payment: 'Zahlung buchen',
  crates: 'Kisten eintragen',
  stock: 'Bestand',
} as const;

export const SETTINGS_TITLE = 'Einstellungen';
export const PRICE_LABEL = 'Preis je Kiste';
export const DRINK_LABEL = 'Getränk';
export const DRINK_NAME_LABEL = 'Getränk';
export const DRINKS_SECTION = 'Getränke';
export const RETIRED_SECTION = 'Ausgelistet';
export const ADD_DRINK_LABEL = 'Getränk hinzufügen';
export const ADD_DRINK_ROW_LABEL = 'Weiteres Getränk';
export const REMOVE_DRINK_LABEL = 'Getränk entfernen';
export const EDIT_DRINK_SECTION = 'Name und Preis';
export const RETIRE_LABEL = 'Getränk auslisten';
export const DRINK_UNKNOWN = 'Dieses Getränk gibt es auf der Liste nicht.';
export const drinkPriceOf = (cents: number): string => `${euroOf(cents)} je Kiste`;
export const drinkFactsOf = (crates: number, cents: number): string =>
  `${cratesLabel(crates)} · ${drinkPriceOf(cents)}`;
export const DEFAULT_MARK = 'Standard';
export const MAKE_DEFAULT_LABEL = 'Als Standard';
export const drinkStateLabelOf = (isDefault: boolean): string => (isDefault ? DEFAULT_MARK : '');
export const drinksContextOf = (count: number): string =>
  count === 1 ? '1 Getränk' : `${count} Getränke`;
export const deskStockNoteOf = (drinks: readonly BeerStockDrink[]): string => {
  const lead = leadDrinkOf(drinks);

  if (lead === null || listedDrinksOf(drinks).length < 2) {
    return `Bestand ${cratesLabel(lead?.crates ?? 0)}`;
  }

  return `${lead.name}: Bestand ${cratesLabel(lead.crates)}`;
};
export const retiredLineOf = (names: readonly string[]): string => names.join(' · ');
export const drinkChoiceLabelOf = (name: string, crates: number): string =>
  crates < 1 ? `${name} · leer` : `${name} · ${cratesLabel(crates)}`;
export const carriedDrinkLabelOf = (name: string, crates: number): string =>
  `${name} · ${cratesLabel(crates)}`;
export const retireConfirmOf = (name: string): KkHoldConfirm => ({
  eyebrow: DRINK_LABEL,
  question: `${name} auslisten?`,
  explanation: `${name} kann dann nicht mehr gebucht werden.`,
  confirmLabel: 'Auslisten',
  cancelLabel: CANCEL_LABEL,
  closeLabel: CLOSE_LABEL,
});
export const LINK_LABEL = 'PayPal-Link (optional)';
export const SAVE_LABEL = 'Speichern';
export const PRICE_INVALID = 'Bitte einen Preis wie 18,00 eingeben.';

export const payWaysOf = (owner: PersonRef | null, paymentLink: string | null): string =>
  payWaysLine(owner?.firstName ?? null, paymentLink !== null);

export const CODE_TITLE = 'Palettencode';
export const CODE_SHEET_TITLE = 'Kiste genommen?';
export const PRINT_LABEL = 'Drucken';

export const HANDOVER_TITLE = 'Übergabe';
export const SUCCESSOR_LABEL = 'Neue Inhaberin';
export const HANDOVER_LABEL = 'Bierliste übergeben';
export const handoverConfirmOf = (name: string, stock: number): KkHoldConfirm => ({
  eyebrow: HANDOVER_TITLE,
  question: `Bierliste an ${name} übergeben?`,
  explanation: `${cratesLabel(stock)} gehen mit. Die bisherige Liste wird geschlossen.`,
  confirmLabel: 'Übergeben',
  cancelLabel: CANCEL_LABEL,
  closeLabel: CLOSE_LABEL,
});

export const ENROLLMENTS_TITLE = 'Teilnahmen';
export const POTS_TITLE = 'Frühere Listen';
export const POTS_EMPTY = 'Es gibt keine früheren Listen.';
export const ALL_PAID = 'Auf dieser Liste ist alles bezahlt.';
export const potLabelOf = (
  owner: PersonRef | null,
  openedAt: string,
  closedAt: string | null,
): string =>
  `${fullNameOf(owner)} · ${shortDateOf(openedAt)}–${closedAt === null ? 'heute' : shortDateOf(closedAt)}`;
export const potFactsOf = (openTabs: number, openCents: number): string =>
  openTabs === 0 ? 'alles bezahlt' : `${personsOf(openTabs)} offen · ${euroOf(openCents)}`;

export const EMPTY_TITLE = 'Bierliste eröffnen';
export const OWNER_LABEL = 'Inhaberin';
export const OPEN_POT_LABEL = 'Bierliste eröffnen';

export const ownerContextOf = (owner: PersonRef | null, paymentLink: string | null): string =>
  `${fullNameOf(owner)} · ${payWaysOf(owner, paymentLink)}`;

export const clearPersonLabelOf = (name: string): string => `Nur ${name} · Filter aufheben`;
export const filterPersonLabelOf = (name: string): string => `Nur ${name} im Journal zeigen`;

export const ERROR_TITLE = 'BIERLISTE NICHT GELADEN';
export const HUB_ERROR_MESSAGES: Record<QueryErrorKind, string> = {
  unreachable: 'Keine Verbindung zum Server.',
  unexpected: 'Die Bierliste konnte nicht geladen werden.',
  rejected: 'Der Server hat die Anfrage abgelehnt.',
};
export const RETRY_LABEL = 'Erneut laden';

export const OPENED_NOTICE = 'Bierliste eröffnet';
export const DRINK_SAVED_NOTICE = 'Getränk gespeichert';
export const drinkAddedNoticeOf = (name: string): string => `${name} hinzugefügt`;
export const drinkDefaultNoticeOf = (name: string): string => `${name} ist Standard`;
export const drinkRetiredNoticeOf = (name: string): string => `${name} ausgelistet`;
export const SETTINGS_NOTICE = 'Einstellungen gespeichert';
export const UNDONE_CRATE_NOTICE = 'Kiste zurückgenommen';
export const PAYMENT_UNDONE_NOTICE = 'Zahlung zurückgenommen';
export const ENDED_NOTICE = 'Teilnahme beendet';

export const stockNoticeOf = (input: { change: BeerStockChange; drinkName: string }): string =>
  input.change.kind === 'delivery'
    ? `Lieferung ${input.drinkName} gebucht · ${signed(input.change.crates)}`
    : `Korrektur ${input.drinkName} gebucht · ${signed(input.change.crates)}`;

export const cratesNoticeOf = (input: {
  count: number;
  drinkName: string;
  name: string;
  paid: boolean;
}): string =>
  `${cratesOfDrink(input.count, input.drinkName)} für ${input.name} gebucht${input.paid ? ' · bezahlt' : ''}`;

export const paymentNoticeOf = (input: { crates: number; name: string }): string =>
  `Zahlung gebucht · ${input.name} · ${cratesLabel(input.crates)}`;

export const handoverNoticeOf = (carried: number): string =>
  `Bierliste übergeben · ${cratesLabel(carried)} mitgegeben`;

export const dayFactsOf = (entries: readonly BeerJournalEntry[]): string => {
  const crates = entries
    .filter((entry) => entry.kind === 'crate' && !entry.undone)
    .reduce((sum, entry) => sum + entry.count, 0);

  return crates === 0 ? '' : `${cratesLabel(crates)} gebucht`;
};

export const STOCK_CHANGE_MISSING = 'Bitte Kisten dazu (+) oder weg (−) angeben.';
export const STOCK_CEILING = `Höchstens ${STOCK_MAX_CRATES} Kisten auf einmal.`;
export const stockFloorOf = (stock: number): string =>
  `Es sind nur ${cratesLabel(stock)} da; weniger als null geht nicht.`;
export const PERSON_MISSING = 'Wähle die Person, für die gebucht wird.';
export const DRINK_MISSING = 'Wähle das Getränk.';
export const DRINKS_MISSING = 'Mindestens ein Getränk angeben.';
export const DRINK_NAME_MISSING = 'Bitte einen Namen eingeben.';
export const DRINK_NAME_TOO_LONG = `Höchstens ${DRINK_NAME_MAX} Zeichen.`;
export const DRINK_NAME_TWICE = 'Dieses Getränk steht schon in der Liste.';
export const OWNER_MISSING = 'Wähle die Inhaberin der Bierliste.';
export const SUCCESSOR_MISSING = 'Wähle die neue Inhaberin.';
export const PAYMENT_EMPTY = 'Wähle mindestens eine bezahlte Kiste.';

export const countRangeOf = (max: number): string =>
  max < 1 ? 'Gerade ist keine Kiste da.' : `Bitte zwischen 1 und ${cratesLabel(max)} angeben.`;

export const RUNNING_SECTION = 'Nehmen teil';
export const ENDED_SECTION = 'Beendet';
export const TAKEN_SECTION = 'Kisten';
export const SETUP_SWITCH_LABEL = 'Bierliste einrichten';
export const SETUP_SWITCH_LABELS = {
  settings: 'PayPal',
  drinks: 'Getränke',
  enrollments: 'Teilnahmen',
  code: 'Code',
  handover: 'Übergabe',
} as const;

export const enrollmentLineOf = (enrollment: BeerEnrollment | null): string => {
  if (enrollment === null) {
    return 'nimmt nicht teil';
  }

  const since = `nimmt teil seit ${shortDateOf(enrollment.startedAt)}`;

  if (enrollment.endedAt === null) {
    return since;
  }

  const by = enrollment.endedBy === null ? '' : ` von ${enrollment.endedBy.firstName}`;

  return `${since} · beendet am ${shortDateOf(enrollment.endedAt)}${by}`;
};

export const enrollmentSpanOf = (enrollment: BeerEnrollment): string =>
  enrollment.endedAt === null
    ? `seit ${shortDateOf(enrollment.startedAt)}`
    : `${shortDateOf(enrollment.startedAt)}–${shortDateOf(enrollment.endedAt)}`;

export const bookableLabelOf = (entry: BeerBookable): string =>
  entry.enrolled ? fullNameOf(entry.person) : `${fullNameOf(entry.person)} · Teilnahme beendet`;

export const crateNoteOf = (crate: BeerJournalCrate): string | null =>
  crate.enteredBy === null || crate.enteredBy.personId === crate.person?.personId
    ? null
    : `eingetragen von ${firstNameOf(crate.enteredBy)}`;

export const crateLineTextOf = (crate: BeerJournalCrate): string =>
  `${crate.drinkName} · ${clockOf(crate.bookedAt)}`;

export const paymentLineTextOf = (payment: BeerJournalPayment): string =>
  `zahlt ${paidDrinksTextOf(payment.drinks, payment.crates)} · ${clockOf(payment.bookedAt)}`;

export const paymentNoteOf = (payment: BeerJournalPayment): string | null =>
  payment.bookedBy === null ? null : `gebucht von ${firstNameOf(payment.bookedBy)}`;

export const openCountOf = (openCrates: number): string => `${cratesLabel(openCrates)} offen`;

export const openFactsOf = (count: number, cents: number): string =>
  `${cratesLabel(count)} · ${euroOf(cents)}`;

export const rosterTotalOf = (cents: number): string => (cents === 0 ? '' : euroOf(cents));

export const takenFactsOf = (count: number): string => (count === 0 ? '' : cratesLabel(count));

export const openTabsLabelOf = (openTabs: number): string => `${personsOf(openTabs)} ${OPEN_LABEL}`;

export const personContextOf = (row: BeerRosterRow | null): string =>
  row === null || row.openCrates === 0
    ? 'alles bezahlt'
    : `${openCountOf(row.openCrates)} · ${daysLabel(row.openDays ?? 0)}`;

export const personStateLabelOf = (row: BeerRosterRow | null): string =>
  row === null || row.openCrates === 0 ? 'bezahlt' : `${euroOf(row.openCents)} offen`;
