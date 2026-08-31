import type { LinkProps } from '@tanstack/react-router';

export interface ExchangeBandContent {
  kicker: string;
  headline: string;
  note: string;
  ctaLabel: string;
  ctaTo: LinkProps['to'];
}

export const exchangeBandContent: ExchangeBandContent = {
  kicker: 'KARTENBÖRSE',
  headline: 'AUSVERKAUFT IST NICHT DAS ENDE',
  note: 'Für ausverkaufte Abende planen wir eine Kartenbörse — wie sie genau funktioniert, arbeiten wir gerade sorgfältig aus.',
  ctaLabel: 'Zur Kartenbörse →',
  ctaTo: '/events/exchange',
};

export interface ExchangeHeroContent {
  eyebrow: string;
  planningMarker: string;
  title: string;
  description: string;
}

export const exchangeHeroContent: ExchangeHeroContent = {
  eyebrow: 'KARTENBÖRSE',
  planningMarker: 'IN PLANUNG',
  title: 'AUSVERKAUFT IST NICHT DAS ENDE',
  description:
    'Wer nicht kommen kann, soll seine Karte zurückgeben können — und wer keine mehr bekommen hat, soll noch eine Chance haben. Hier zeigen wir, wie wir uns die Kartenbörse vorstellen. Entschieden ist davon noch nichts.',
};

export interface ExchangeIdeaItem {
  title: string;
  description: string;
}

export interface ExchangeCoreLoopContent {
  kicker: string;
  title: string;
  steps: ExchangeIdeaItem[];
  note: string;
}

export const exchangeCoreLoopContent: ExchangeCoreLoopContent = {
  kicker: 'DIE IDEE',
  title: 'SO STELLEN WIR UNS DAS VOR.',
  steps: [
    {
      title: 'Karte zurückgeben',
      description:
        'Du kannst doch nicht kommen? Dann gibst du deine Karte über die Kartenbörse zurück — ohne Risiko.',
    },
    {
      title: 'Jemand anderes kauft sie',
      description:
        'Deine Karte wird wieder angeboten — zum normalen Preis, direkt über den Verein.',
    },
    {
      title: 'Geld zurück, die Warteliste rückt nach',
      description:
        'Erst wenn deine Karte wirklich neu gekauft wurde, bekommst du dein Geld zurück — und wer gewartet hat, ist dabei.',
    },
  ],
  note: 'Bis dahin bleibt die Karte deine: Wird sie nicht gekauft, gehst du einfach ganz normal hin.',
};

export interface ExchangePrinciplesContent {
  kicker: string;
  title: string;
  intro: string;
  principles: ExchangeIdeaItem[];
}

export const exchangePrinciplesContent: ExchangePrinciplesContent = {
  kicker: 'GRUNDSÄTZE DER PLANUNG',
  title: 'WAS UNS DABEI WICHTIG IST.',
  intro:
    'Drei Grundsätze leiten die Planung. Versprochen ist damit noch nichts — aber daran richten wir alles aus.',
  principles: [
    {
      title: 'Preis bleibt Preis',
      description:
        'Kein Aufpreis, kein Gewinn: Eine Karte kostet beim zweiten Mal genau das, was sie beim ersten Mal gekostet hat.',
    },
    {
      title: 'Über den Verein',
      description:
        'Rückgabe und Neukauf laufen über den Club — nicht privat und nicht am Verein vorbei.',
    },
    {
      title: 'Kein Stuhl bleibt leer',
      description:
        'Ein ausverkaufter Abend soll auch ein voller Abend sein — Karten, die niemand nutzt, helfen niemandem.',
    },
  ],
};

export interface ExchangeIdeasContent {
  kicker: string;
  title: string;
  ideas: ExchangeIdeaItem[];
}

export const exchangeIdeasContent: ExchangeIdeasContent = {
  kicker: 'NOCH NICHT ENTSCHIEDEN',
  title: 'IDEEN, ÜBER DIE WIR NACHDENKEN.',
  ideas: [
    {
      title: 'Warteliste ohne Vorkasse',
      description:
        'Für ausverkaufte Abende könnte es eine Warteliste geben: Eintragen kostet nichts, bezahlt wird erst, wenn wirklich eine Karte frei wird.',
    },
    {
      title: 'Abend tauschen',
      description:
        'Wer doch an einem anderen Abend kann, könnte seine Karte kostenlos tauschen — z. B. bis eine Woche vor dem Abend, solange dort noch etwas frei ist.',
    },
  ],
};

export interface ExchangeOpenQuestionsContent {
  kicker: string;
  title: string;
  intro: string;
  questions: ExchangeIdeaItem[];
}

export const exchangeOpenQuestionsContent: ExchangeOpenQuestionsContent = {
  kicker: 'OFFEN GESAGT',
  title: 'WAS WIR NOCH KLÄREN.',
  intro:
    'Diese Fragen beantworten wir erst, wenn der Verein sie entschieden hat — bis dahin stehen sie hier, statt dass wir so tun, als wüssten wir es schon.',
  questions: [
    {
      title: 'Wer zuerst dran ist',
      description:
        'Wer eine zurückgegebene Karte zuerst angeboten bekommt — und wann sie für alle frei wird.',
    },
    {
      title: 'Wie die Rückgabe genau abläuft',
      description:
        'Wie du eine Karte zurückgibst, was du dafür brauchst und wie das Geld zurück zu dir kommt.',
    },
    {
      title: 'Fristen',
      description:
        'Bis wann Rückgabe und Tausch möglich sind — und was ganz kurz vor dem Abend gilt.',
    },
  ],
};

export interface ExchangeClosingContent {
  kicker: string;
  headline: string;
  lead: string;
  ctaLabel: string;
  ctaTo: LinkProps['to'];
}

export const exchangeClosingContent: ExchangeClosingContent = {
  kicker: 'BIS ES SO WEIT IST',
  headline: 'DER VORVERKAUF LÄUFT GANZ NORMAL.',
  lead: 'Alle Abende der Session und ihre Karten findest du bei den Veranstaltungen.',
  ctaLabel: 'Zu den Veranstaltungen →',
  ctaTo: '/events',
};
