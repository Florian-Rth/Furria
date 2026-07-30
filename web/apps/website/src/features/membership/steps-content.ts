export interface JoinStep {
  title: string;
  description: string;
}

export const joinStepsKicker = 'SO WIRD MAN MITGLIED';

export const joinStepsTitle = 'VIER SCHRITTE.';

export const joinStepsIntro =
  'Vom ersten Gedanken bis zur Aufnahme sind es vier Schritte. Der erste kostet nichts als ein paar Minuten Neugier, und keiner davon verpflichtet dich zu etwas.';

export const buildJoinStepNumeral = (index: number): string => String(index + 1).padStart(2, '0');

export const JOIN_STEPS: JoinStep[] = [
  {
    title: 'Gruppe finden',
    description:
      'Der Konfetti-Kompass zeigt dir, wo du hinpassen könntest. Und wenn dir nichts davon zusagt: ohne Gruppe zu starten ist genauso normal, dazustoßen kannst du später jederzeit.',
  },
  {
    title: 'Antrag stellen',
    description:
      'Ein Formular, zwei Minuten, online. Kein PDF zum Ausdrucken, keine Unterschrift per Post — und abgebucht wird dabei nichts.',
  },
  {
    title: 'Aufnahme',
    description:
      'Wir entscheiden in der nächsten Sitzung über deinen Antrag und melden uns danach per Mail bei dir. Bis dahin bindet dich nichts.',
  },
  {
    title: 'Willkommen',
    description:
      'Du bist Mitglied: Training in deiner Gruppe, Auftritte in der Session, dein Orden beim Ordensfest — und der Zugang zur Club-App.',
  },
];
