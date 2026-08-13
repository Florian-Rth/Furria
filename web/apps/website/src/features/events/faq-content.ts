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
      'Gern gesehen, aber kein Muss. Wer mag, kommt im Kostüm — wer nicht, feiert genauso mit.',
  },
  {
    id: 'food',
    question: 'Gibt es Essen und Trinken?',
    answer:
      'Der Verein verkauft Bier, Wein, Sekt, Softdrinks und Bratwurst. Bitte Bargeld mitbringen — Kartenzahlung gibt es nicht.',
  },
  {
    id: 'age',
    question: 'Ab welchem Alter dürfen Kinder und Jugendliche mit?',
    answer:
      'Jeder Abend hat seinen eigenen Rahmen — die Empfehlung steht am jeweiligen Termin. Die endgültigen Altersregeln stimmt der Verein noch ab.',
  },
  {
    id: 'price',
    question: 'Was kostet eine Karte?',
    answer:
      'Der Preis unterscheidet sich von Abend zu Abend und steht am jeweiligen Termin, sobald er feststeht.',
  },
];

export const buildEventsFaqQuestionId = (entryId: string): string =>
  `events-faq-question-${entryId}`;

export const buildEventsFaqPanelId = (entryId: string): string => `events-faq-panel-${entryId}`;
