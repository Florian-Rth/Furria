import type { KkHoldConfirm } from '@furria/ui/KkHoldButton';
import type { KkPourQuickItem } from '@furria/ui/KkPourQuickBar';
import type { KkSegmentSwitchItem } from '@furria/ui/KkSegmentSwitch';
import { labBeerPersonOf } from '@/features/lab-beer/beer-lab-fixture';
import { euroOf } from '@/features/lab-beer/beer-lab-ledger';
import type { LabBeerForecast } from '@/features/lab-beer/beer-lab-types';
import type { PourNotice } from './hooks/use-pour-hub';
import {
  CANCEL_LABEL,
  CLOSE_LABEL,
  cratesLabel,
  daysLabel,
  firstNameOf,
  REASON_LABELS,
} from './pour-copy';
import type { PourRosterRow } from './pour-hub';
import type { PourJournalEntry, PourKindFilter } from './pour-journal';
import { dayKeyOf, weekdayDateOf } from './pour-time';

export const HEAD_LABEL = 'Lage der Bierliste';
export const STOCK_LABEL = 'Bestand';
export const STOCK_UNIT = 'Kisten';
export const COUNTERS_LABEL = 'Deckel filtern';
export const OPEN_LABEL = 'Deckel offen';
export const OVERDUE_LABEL = 'über 7 Tage';
export const PEOPLE_LABEL = 'nehmen teil';
export const QUICK_LABEL = 'Schnell eintragen';
export const KIND_FILTER_LABEL = 'Art';
export const PERSON_FILTER_LABEL = 'Person';
export const PERSON_FILTER_ALL = 'Alle Personen';
export const JOURNAL_EMPTY = 'Keine Einträge.';
export const ROSTER_LABEL = 'Deckel';
export const CODE_ACTION = 'Palettencode';
export const SETTINGS_ACTION = 'Einstellungen';

export const QUICK_ITEMS: readonly KkPourQuickItem[] = [
  { id: 'payment', label: 'Zahlung', icon: 'fees', lead: true },
  { id: 'crate', label: 'Kiste', icon: 'crate' },
  { id: 'delivery', label: 'Lieferung', icon: 'download' },
  { id: 'correction', label: 'Korrektur', icon: 'edit' },
];

export const KIND_LABELS: Record<PourKindFilter, string> = {
  all: 'Alles',
  crate: 'Kisten',
  payment: 'Zahlung',
  stock: 'Bestand',
  enrollment: 'Teilnahme',
};

export const KIND_ORDER: readonly PourKindFilter[] = ['all', 'crate', 'payment', 'enrollment'];

export const SETTINGS_TABS: readonly KkSegmentSwitchItem[] = [
  { id: 'settings', label: 'Einstellungen', icon: 'settings', count: null, countLabel: '' },
  { id: 'code', label: 'Palettencode', icon: 'qr', count: null, countLabel: '' },
  { id: 'handover', label: 'Übergabe', icon: 'handshake', count: null, countLabel: '' },
];

export const stockCaptionOf = (forecast: LabBeerForecast, daysLeft: number | null): string => {
  if (forecast.emptyOn === null || daysLeft === null) {
    return 'kein Verbrauch in 21 Tagen';
  }

  const day = weekdayDateOf(dayKeyOf(forecast.emptyOn));
  const rounded = Math.round(daysLeft);

  return forecast.warns ? `leer ≈ ${day} · in ${rounded} T.` : `reicht bis ≈ ${day}`;
};

export const nameOf = (personId: number | null): string =>
  firstNameOf(personId === null ? null : labBeerPersonOf(personId));

const actorNote = (entry: PourJournalEntry, verb: string): string | null =>
  entry.actorId === null || entry.actorId === entry.personId
    ? null
    : `${verb} ${nameOf(entry.actorId)}`;

export interface PourJournalCopy {
  text: string;
  note: string | null;
  amount: string | null;
  delta: string | null;
}

const signed = (value: number): string => (value > 0 ? `+${value}` : `−${Math.abs(value)}`);

export const journalCopyOf = (entry: PourJournalEntry): PourJournalCopy => {
  const amount = entry.cents === null ? null : euroOf(entry.cents);
  const delta = entry.stockDelta === 0 ? null : signed(entry.stockDelta);

  switch (entry.kind) {
    case 'crate':
      return {
        text: cratesLabel(entry.count),
        note: entry.undone ? 'zurückgenommen' : actorNote(entry, 'eingetragen von'),
        amount,
        delta,
      };
    case 'payment':
      return {
        text: `zahlt ${cratesLabel(entry.count)}`,
        note: actorNote(entry, 'gebucht von'),
        amount,
        delta,
      };
    case 'delivery':
      return {
        text: `Lieferung · ${cratesLabel(entry.count)}`,
        note: actorNote(entry, 'von'),
        amount,
        delta,
      };
    case 'correction':
      return {
        text: `Korrektur · ${entry.reason === null ? '' : REASON_LABELS[entry.reason]}`,
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

export const rosterFactsOf = (row: PourRosterRow): string => {
  const ended = row.enrolled ? '' : 'Teilnahme beendet · ';

  if (row.tab.openCount > 0) {
    return `${ended}${daysLabel(row.openDays ?? 0)} · ${cratesLabel(row.tab.paidCount)} bezahlt`;
  }

  return row.tab.paidCount > 0
    ? `${ended}alles bezahlt · ${cratesLabel(row.tab.paidCount)}`
    : `${ended}noch keine Kiste`;
};

export const noticeTextOf = (notice: PourNotice): string => {
  const name = nameOf(notice.personId);

  switch (notice.kind) {
    case 'payment':
      return `Zahlung gebucht · ${name} · ${cratesLabel(notice.count)}`;
    case 'crate':
      return `${cratesLabel(notice.count)} für ${name} gebucht`;
    case 'delivery':
      return `Lieferung gebucht · +${notice.count}`;
    case 'correction':
      return `Korrektur gebucht · ${signed(notice.count)}`;
    case 'ended':
      return `Teilnahme von ${name} beendet`;
    default:
      return 'Einstellungen gespeichert';
  }
};

export const endConfirmOf = (name: string): KkHoldConfirm => ({
  eyebrow: 'Teilnahme',
  question: `Teilnahme von ${name} beenden?`,
  explanation: `${name} kann dann keine Kisten mehr buchen. Offene Kisten bleiben auf dem Deckel und werden weiter bezahlt.`,
  confirmLabel: 'Beenden',
  cancelLabel: CANCEL_LABEL,
  closeLabel: CLOSE_LABEL,
});

export const END_LABEL = 'Teilnahme beenden';
export const END_HINT = 'Zum Beenden halten';
export const PAY_SECTION = 'Zahlung buchen';
export const OPEN_SECTION = 'Offen';
export const PAID_SECTION = 'Bezahlt';
export const ENROLL_SECTION = 'Teilnahme';
export const PAY_COUNT_LABEL = 'Bezahlte Kisten';
export const STEP_LABELS = { less: 'Eine weniger', more: 'Eine mehr' } as const;
export const PERSON_LABEL = 'Person';
export const COUNT_FIELD_LABEL = 'Anzahl Kisten';
export const REASON_LABEL = 'Grund';
export const DIRECTION_LABEL = 'Richtung';
export const DIRECTION_LESS = 'weniger da';
export const DIRECTION_MORE = 'mehr da';
export const PAY_OLDEST_NOTE = 'Bezahlt werden immer die ältesten offenen Kisten zuerst.';
export const NO_OPEN_TABS = 'Gerade ist kein Deckel offen.';

export const paymentButtonOf = (count: number, cents: number): string =>
  `${cratesLabel(count)} bezahlt · ${euroOf(cents)}`;

export const crateButtonOf = (count: number, name: string): string =>
  `${cratesLabel(count)} für ${name} buchen`;

export const deliveryButtonOf = (count: number): string =>
  count === 0 ? 'Lieferung buchen' : `Lieferung buchen · +${count}`;

export const correctionButtonOf = (delta: number): string =>
  delta === 0 ? 'Korrektur buchen' : `Korrektur buchen · ${signed(delta)}`;

export const stockAfterOf = (stock: number, delta: number): string =>
  `Bestand danach: ${stock + delta} Kisten`;

export const personOptionLabelOf = (row: PourRosterRow): string =>
  row.tab.openCount > 0
    ? `${nameOf(row.personId)} · ${cratesLabel(row.tab.openCount)} offen`
    : nameOf(row.personId);

export const FORM_TITLES = {
  payment: 'Zahlung buchen',
  crate: 'Kiste eintragen',
  delivery: 'Lieferung buchen',
  correction: 'Bestand korrigieren',
} as const;

export const FORM_CONTEXTS = {
  payment: 'ganze Kisten · älteste zuerst',
  crate: 'für eine Person, die teilnimmt',
  delivery: 'neue Kisten auf die Palette',
  correction: 'Schwund · Bruch · Zählfehler',
} as const;

export const SETTINGS_TITLE = 'Bierliste';
export const PRICE_LABEL = 'Preis je Kiste';
export const PRICE_HINT = 'Gilt für neue Kisten; gebuchte behalten ihren Preis.';
export const LINK_LABEL = 'PayPal-Link';
export const NOTE_LABEL = 'Zahlungshinweis (z. B. IBAN)';
export const SAVE_LABEL = 'Speichern';
export const PRICE_INVALID = 'Bitte einen Preis wie 18,00 eingeben.';
export const CODE_LEAD =
  'Hängt an der Palette. Wer ihn scannt, landet direkt beim Buchen – ohne Menü, ohne Umweg.';
export const PRINT_LABEL = 'Drucken';
export const HANDOVER_LEAD =
  'Die Bierliste an eine andere Person übergeben – mit Bestand, offenen Deckeln und Zahlungsdaten.';
export const HANDOVER_SOON = 'kommt noch';
export const ownerContextOf = (owner: string): string => `privater Topf von ${owner}`;

export const clearPersonLabelOf = (name: string): string => `Nur ${name} · Filter aufheben`;

export const filterPersonLabelOf = (name: string): string => `Nur ${name} im Journal zeigen`;
