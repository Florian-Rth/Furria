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

export const orderFlowPlaceholderKicker = 'PLATZHALTER';

export interface OrderFlowPlaceholder {
  headline: string;
  body: string;
}

export const orderFlowStepPlaceholders: Record<OrderFlowStep, OrderFlowPlaceholder> = {
  1: {
    headline: 'HIER WÄHLST DU DEINE KARTEN',
    body: 'Wie genau du sie wählst — fester Platz oder freie Wahl — entscheidet der Verein gerade. Sobald das feststeht, steht an dieser Stelle die echte Auswahl.',
  },
  2: {
    headline: 'HIER KOMMEN DEINE DATEN HIN',
    body: 'Name und E-Mail-Adresse, damit deine Bestellung bei dir ankommt. Das Formular entsteht, sobald die Kartenwahl steht.',
  },
  3: {
    headline: 'HIER WIRD BEZAHLT',
    body: 'Womit du bezahlen kannst, legt der Verein noch fest. Bis dahin bewegt sich an dieser Stelle kein Geld.',
  },
};

export const orderFlowHeadlines = {
  onSale: 'KARTEN FÜR DIESEN ABEND.',
  scarcePrefix: 'DIE LETZTEN',
  scarceSuffix: 'KARTEN.',
  announced: 'DER VORVERKAUF WIRD NOCH ANGEKÜNDIGT.',
  presale: 'DER VORVERKAUF HAT NOCH NICHT BEGONNEN.',
  soldOut: 'DIESER ABEND IST AUSVERKAUFT.',
  closed: 'DER VORVERKAUF IST BEENDET.',
  cancelled: 'DIESER ABEND FÄLLT AUS.',
} as const;

export const orderFlowNoticeSuffixes: Record<BlockedFaceKind, string> = {
  announced: 'Sobald der Termin steht, findest du ihn auf der Seite des Abends.',
  presale: 'Bis dahin lassen sich hier keine Karten bestellen.',
  soldOut: exchangeBandContent.note,
  closed: 'Hier lassen sich keine Karten mehr bestellen.',
  cancelled: 'Karten gibt es dafür keine.',
};
