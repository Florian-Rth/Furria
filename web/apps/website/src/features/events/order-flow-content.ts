import { exchangeBandContent } from './exchange-content';
import type { OrderFlowStep } from './order-flow-steps';
import type { BlockedFaceKind } from './ticket-panel-display';

export const orderEntryCtaLabel = 'Karten wählen →';

export const orderFlowStepLabels: Record<OrderFlowStep, string> = {
  1: 'Kartenwahl',
  2: 'Deine Daten',
  3: 'Zahlung',
};

export const orderFlowDocumentTitlePrefix = 'Karten für';

export const orderFlowStepSummaryLabels = {
  prefix: 'Schritt',
  connector: 'von',
} as const;

export const orderFlowActionLabels: Record<OrderFlowStep, string> = {
  1: 'Weiter zum Kauf →',
  2: 'Weiter zur Zahlung →',
  3: 'Zur Bestätigung →',
};

export const orderFlowBackActionLabel = '← Zurück';

export const orderFlowMissingBuyerActionLabel = 'Zu deinen Daten →';

export const orderFlowPlaceholderKicker = 'PLATZHALTER';

type OrderFlowPlaceholderKind = 'selection' | 'tickets' | 'payment';

export interface OrderFlowPlaceholder {
  headline: string;
  body: string;
}

export const orderFlowPlaceholders: Record<OrderFlowPlaceholderKind, OrderFlowPlaceholder> = {
  selection: {
    headline: 'HIER WÄHLST DU DEINE KARTEN',
    body: 'Wie genau du sie wählst — fester Platz oder freie Wahl — entscheidet der Verein gerade. Sobald das feststeht, steht an dieser Stelle die echte Auswahl.',
  },
  tickets: {
    headline: 'HIER STEHEN DEINE KARTEN',
    body: 'Wie viele Karten es werden, steht hier, sobald die Kartenwahl im ersten Schritt fertig ist. Solange fehlt auch die Summe.',
  },
  payment: {
    headline: 'HIER WIRD BEZAHLT',
    body: 'Bezahlt wird direkt hier auf dieser Seite, ohne Umleitung auf eine fremde Seite. Der Teil dahinter wird gerade gebaut — bis er fertig ist, bewegt sich hier kein Geld.',
  },
};

export const orderBuyerHeadline = 'WER BESTELLT?';

export const orderBuyerNote =
  'Wir brauchen nur deinen Namen und deine E-Mail-Adresse — an diese Adresse geht deine Bestellung. Mehr wollen wir nicht von dir wissen.';

export const orderBuyerFieldLabels = {
  firstName: 'Vorname',
  lastName: 'Nachname',
  email: 'E-Mail-Adresse',
} as const;

export const orderWithdrawalNotice = {
  title: 'KEIN WIDERRUFSRECHT',
  body: 'Karten für einen Abend mit festem Termin sind vom Widerrufsrecht ausgenommen — so sieht es das Gesetz vor (§ 312g Abs. 2 Nr. 9 BGB). Eine bestellte Karte lässt sich also nicht widerrufen.',
} as const;

export const orderFlowMissingBuyerNotice = {
  headline: 'DEINE DATEN FEHLEN NOCH',
  body: 'Bevor es ans Bezahlen geht, brauchen wir deinen Namen und deine E-Mail-Adresse. Ein Schritt zurück, dann geht es hier weiter.',
} as const;

export const orderFlowHeadline = 'KARTEN BESTELLEN';

export const orderFlowNoticeSuffixes: Record<BlockedFaceKind, string> = {
  announced: 'Sobald der Termin steht, findest du ihn auf der Seite des Abends.',
  presale: 'Bis dahin lassen sich hier keine Karten bestellen.',
  soldOut: exchangeBandContent.note,
  closed: 'Hier lassen sich keine Karten mehr bestellen.',
  cancelled: 'Karten gibt es dafür keine.',
};
