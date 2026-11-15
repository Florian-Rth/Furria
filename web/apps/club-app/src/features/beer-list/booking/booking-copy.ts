import type { KkChoiceChip } from '@furria/ui/KkChoiceChips';
import type { KkHoldConfirm } from '@furria/ui/KkHoldButton';
import { formatEuroCents } from '@/lib/money';
import type { QueryErrorKind } from '@/lib/query-error';
import type { BeerPotDrink } from '../schemas';

export const cratesLabel = (count: number): string => (count === 1 ? '1 Kiste' : `${count} Kisten`);
export const drinkCratesLabel = (count: number, drinkName: string): string =>
  `${cratesLabel(count)} ${drinkName}`;

export const OPEN_TOTAL_LABEL = 'Offen';
export const discLabel = (openCount: number, paidCount: number): string =>
  `${cratesLabel(openCount)} offen, ${cratesLabel(paidCount)} bezahlt`;
export const COUNT_LABEL = 'Anzahl Kisten';
export const countCaption = (count: number): string => (count === 1 ? 'Kiste' : 'Kisten');
export const bookLabel = (count: number): string =>
  count === 1 ? 'Kiste buchen' : `${count} Kisten buchen`;
export const HOLD_HINT = 'Gedrückt halten zum Buchen';
export const PICK_DRINK_LABEL = 'Getränk wählen';
export const DRINK_LABEL = 'Getränk';

const drinkChipLabelOf = (drink: BeerPotDrink): string =>
  drink.hasStock
    ? `${drink.name} · ${formatEuroCents(drink.cratePriceCents)}`
    : `${drink.name} · leer`;

export const drinkChoicesOf = (drinks: readonly BeerPotDrink[]): readonly KkChoiceChip[] =>
  drinks.map((drink) => ({
    id: String(drink.beerDrinkId),
    label: drinkChipLabelOf(drink),
    disabled: !drink.hasStock,
  }));

const landsOnTab = (count: number): string =>
  count === 1 ? 'Die Kiste kommt auf deine Liste.' : 'Die Kisten kommen auf deine Liste.';

export const bookConfirm = (count: number, drinkName: string): KkHoldConfirm => ({
  eyebrow: 'Bierliste',
  question: `${drinkCratesLabel(count, drinkName)} buchen?`,
  explanation: landsOnTab(count),
  confirmLabel: bookLabel(count),
  cancelLabel: 'Abbrechen',
  closeLabel: 'Schließen',
});

export const EMPTY_STOCK_NOTE = 'Bestand leer.';

export const bookedTitle = (count: number, drinkName: string): string =>
  `${drinkCratesLabel(count, drinkName)} gebucht`;
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
