export const eventsFaqKicker = 'GUT ZU WISSEN';

export const eventsFaqTitle = 'ALLES, WAS DU WISSEN MUSST';

export interface EventsFaqEntry {
  id: string;
  question: string;
  answer: string;
}

export const EVENTS_FAQ: EventsFaqEntry[] = [
  {
    id: 'costume',
    question: 'Muss ich kostümiert kommen?',
    answer:
      'Nein. Schön ist es natürlich, aber niemand fragt dich, warum du keins trägst. Einzige Ausnahme: Weiberfastnacht. An diesem Abend haben nur Frauen Zutritt — Männer kommen also als Frau verkleidet oder gar nicht. Wie überzeugend, bleibt jedem selbst überlassen.',
  },
  {
    id: 'food',
    question: 'Gibt es Essen und Trinken?',
    answer:
      'Ja. Getränke gibt es den ganzen Abend, dazu eine kleine Auswahl zum Essen, von Pommes bis Hackfleischbrötchen. Bring Bargeld mit, Kartenzahlung gibt es nicht. Der Geldautomat ist erfahrungsgemäß immer dann am weitesten weg, wenn man ihn braucht.',
  },
  {
    id: 'age',
    question: 'Ab welchem Alter dürfen Kinder und Jugendliche mit?',
    answer:
      'Die Altersempfehlung steht bei jeder Veranstaltung. Manche Abende sind für die ganze Familie gemacht, andere eher für alle, die nach Mitternacht noch stehen.',
  },
  {
    id: 'price',
    question: 'Was kostet eine Karte?',
    answer:
      'Der Preis steht bei jeder Veranstaltung. Karten gibt es im Vorverkauf und an der Abendkasse, solange noch Plätze frei sind. Die Abendkasse ist also ein kleines Glücksspiel — der Vorverkauf nicht.',
  },
];

export const buildEventsFaqQuestionId = (entryId: string): string =>
  `events-faq-question-${entryId}`;

export const buildEventsFaqPanelId = (entryId: string): string => `events-faq-panel-${entryId}`;
