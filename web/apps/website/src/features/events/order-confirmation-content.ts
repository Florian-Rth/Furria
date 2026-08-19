import { CLUB_CONTACT_EMAIL } from '@/lib/club';
import type { PaymentStatus } from '@/lib/seed/orders';

export const orderConfirmationDocumentTitle = 'Deine Bestellung';

export interface OrderStateHero {
  kicker: string;
  headline: string;
  body: string;
}

export const orderStateHeroes: Record<PaymentStatus, OrderStateHero> = {
  paid: {
    kicker: 'BEZAHLT',
    headline: 'DEINE KARTEN SIND DIR SICHER.',
    body: 'Alles hat geklappt. Eine Mail mit dem Link zu dieser Seite ist unterwegs — leg sie dir gut ab, dann findest du deine Bestellung jederzeit wieder.',
  },
  processing: {
    kicker: 'ZAHLUNG IN BEARBEITUNG',
    headline: 'WIR WARTEN NOCH AUF DEINE ZAHLUNG.',
    body: 'Deine Bestellung ist bei uns angekommen, die Zahlung ist noch unterwegs — manche Zahlungswege brauchen dafür etwas länger. Sobald sie durch ist, steht es hier. Eine Mail mit dem Link zu dieser Seite ist unterwegs.',
  },
};

export const orderSummaryKicker = 'ALLES AUF EINEN BLICK';

export const orderDemoNotice = {
  title: 'BEISPIELBESTELLUNG',
  body: 'Diese Bestellung ist erfunden — sie zeigt nur, wie diese Seite später aussieht. Es ist kein Geld geflossen, und die Karten darin gehören niemandem.',
} as const;

export const orderTicketCountLabels = { one: 'Karte', many: 'Karten' } as const;

export const orderCrossSellContent = {
  kicker: 'NOCH EIN ABEND',
  title: 'DA GEHT NOCH EINER.',
  note: 'An diesem Abend gibt es auch noch Karten — falls du gleich weiterplanen willst.',
} as const;

export const orderErrorContent = {
  kicker: 'DA STIMMT WAS NICHT',
  headline: 'WIR FINDEN ZU DIESEM LINK KEINE BESTELLUNG.',
  body: 'Vielleicht ist der Link beim Kopieren zerbrochen — nimm ihn am besten direkt aus deiner Bestellmail. Wenn das auch nicht hilft, schreib uns: es antwortet ein Mensch.',
  eventsCtaLabel: 'Zu den Veranstaltungen →',
} as const;

export const orderErrorMailHref = `mailto:${CLUB_CONTACT_EMAIL}`;

export const orderErrorMailLabel = CLUB_CONTACT_EMAIL;

export const orderLoadingLabel = 'Bestellung wird geladen';
