export interface JoinFaqEntry {
  id: string;
  question: string;
  answer: string;
}

export const joinFaqKicker = 'EHRLICH GESAGT';

export const joinFaqTitle = 'DIE FRAGEN, DIE KEINER STELLT.';

export const joinFaqIntro =
  'Ehrlich beantwortet, auch da, wo die Antwort unbequem ist. Was hier nicht steht, beantwortet eine Mail.';

export const buildFaqQuestionId = (id: string): string => `join-faq-${id}-question`;

export const buildFaqPanelId = (id: string): string => `join-faq-${id}-panel`;

const DANCING_ENTRY: JoinFaqEntry = {
  id: 'dancing',
  question: 'Muss ich tanzen können?',
  answer:
    'Nein. Wer nicht tanzen will, muss auch nicht. Und wer will, braucht keine Vorkenntnisse — nur die Bereitschaft, sich am Anfang öfter in die falsche Richtung zu drehen als die anderen.',
};

const GROUP_ENTRY: JoinFaqEntry = {
  id: 'group',
  question: 'Muss ich in eine Gruppe?',
  answer:
    'Nein. Mitglied sein und in einer Gruppe sein sind zwei verschiedene Dinge. Keine Gruppe, eine oder gleich mehrere: Das entscheidest du, und du kannst es jederzeit ändern. Viele sind einfach dabei, weil sie den Verein mögen — das reicht völlig.',
};

const COST_ENTRY: JoinFaqEntry = {
  id: 'cost',
  question: 'Was kostet mich das wirklich?',
  answer:
    '30 € im Jahr. Wer unter 18 ist, zur Schule geht, eine Ausbildung macht oder studiert, zahlt 15 €. Dazu kommen je nach Gruppe Kostüme oder Ausflüge — beides freiwillig und von Gruppe zu Gruppe verschieden. Und deine Zeit: erfahrungsgemäß der teuerste Posten, aber auch der, den hinterher keiner bereut.',
};

const TIME_ENTRY: JoinFaqEntry = {
  id: 'time',
  question: 'Ich habe kaum Zeit.',
  answer:
    'Kein Problem. Komm zu einer unserer Veranstaltungen und sprich uns an. Meistens finden wir etwas, das zu dir passt — notfalls zwischen zwei Bierbänken.',
};

const LOCAL_ENTRY: JoinFaqEntry = {
  id: 'local',
  question: 'Ich bin nicht von hier.',
  answer:
    'Macht nichts — dein Wohnort spielt keine Rolle. Einige von uns fahren aus den Nachbardörfern nach Großfurra. Die Anfahrt regelst du, den Rest regeln wir zusammen.',
};

const FIT_ENTRY: JoinFaqEntry = {
  id: 'fit',
  question: 'Und wenn es doch nicht passt?',
  answer:
    'Dann sag es einfach. Eine Gruppe kannst du jederzeit wechseln oder verlassen, und die Mitgliedschaft läuft pro Session — gekündigt wird zum Ende der Session. Festgehalten wird hier niemand, auch nicht nach dem dritten Schunkeln.',
};

const CHILD_ENTRY_ID = 'child';

const CHILD_QUESTION = 'Mein Kind möchte mitmachen.';

const buildOnlineApplicantLine = (ageOfConsent: number | null): string =>
  ageOfConsent === null
    ? 'Den Antrag hier auf der Website stellen Jugendliche selbst, für sich allein. Für jüngere Kinder schreibt ihr uns — dann nehmen wir euer Kind direkt auf.'
    : `Den Antrag hier auf der Website stellt, wer mindestens ${ageOfConsent} ist — selbst und für sich allein. Ist euer Kind jünger, schreibt uns: Dann nehmen wir es direkt auf.`;

export const buildChildFaqAnswer = (ageOfConsent: number | null): string =>
  `Sehr gern — für die Kleinsten haben wir gleich mehrere Gruppen. Sprecht uns an, dann finden wir zusammen die passende. ${buildOnlineApplicantLine(ageOfConsent)} Wer noch nicht 18 ist, braucht für die Aufnahme das Einverständnis der Eltern; das klären wir mit euch, bevor wir aufnehmen.`;

export const buildJoinFaq = (ageOfConsent: number | null): JoinFaqEntry[] => [
  DANCING_ENTRY,
  GROUP_ENTRY,
  COST_ENTRY,
  TIME_ENTRY,
  LOCAL_ENTRY,
  { id: CHILD_ENTRY_ID, question: CHILD_QUESTION, answer: buildChildFaqAnswer(ageOfConsent) },
  FIT_ENTRY,
];
