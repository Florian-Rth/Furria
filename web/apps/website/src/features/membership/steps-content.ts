export interface JoinStep {
  title: string;
  description: string;
}

export const joinStepsKicker = 'SO WIRD MAN MITGLIED';

export const joinStepsTitle = 'VIER SCHRITTE.';

export const joinStepsIntro =
  'Vom ersten Gedanken bis zur Aufnahme sind es vier Schritte. Der erste braucht nur ein paar Minuten Neugier, und keiner davon verpflichtet dich zu etwas.';

export const buildJoinStepNumeral = (index: number): string => String(index + 1).padStart(2, '0');

const groupStepWithMatcher =
  'Der Jeck-Check zeigt dir, wo du hinpassen könntest. Und wenn dir nichts davon zusagt: ohne Gruppe zu starten ist genauso normal, dazustoßen kannst du später jederzeit.';

const groupStepWithoutMatcher =
  'Frag uns, welche Gruppe zu dir passen könnte. Und wenn dir keine zusagt: ohne Gruppe zu starten ist genauso normal, dazustoßen kannst du später jederzeit.';

const LATER_JOIN_STEPS: JoinStep[] = [
  {
    title: 'Antrag stellen',
    description:
      'Ein Formular, zwei Minuten, online — danach bestätigst du ihn mit einem Klick in der Mail. Kein PDF zum Ausdrucken, keine Unterschrift per Post.',
  },
  {
    title: 'Aufnahme',
    description:
      'Wir entscheiden in der nächsten Sitzung über deinen Antrag und melden uns danach persönlich bei dir. Bis dahin bindet dich nichts.',
  },
  {
    title: 'Willkommen',
    description:
      'Du bist Mitglied: Training in deiner Gruppe, Auftritte in der Session — und der Zugang zur Club-App mit allen Terminen und Neuigkeiten aus dem Verein.',
  },
];

export const buildJoinSteps = (hasGroupMatcher: boolean): JoinStep[] => [
  {
    title: 'Gruppe finden',
    description: hasGroupMatcher ? groupStepWithMatcher : groupStepWithoutMatcher,
  },
  ...LATER_JOIN_STEPS,
];
