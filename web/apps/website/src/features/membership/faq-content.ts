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
    'Nein. Drei unserer sechs Gruppen tanzen überhaupt nicht: der Elferrat trägt die Prunksitzung, in der Büttenrede steht man am Mikrofon, und die Organisation hält den Abend hinter der Bühne zusammen. In der Tanzgarde und im Männerballett fängt außerdem jede und jeder bei null an — eine Choreografie lernt hier niemand allein.',
};

const GROUP_ENTRY: JoinFaqEntry = {
  id: 'group',
  question: 'Muss ich in eine Gruppe?',
  answer:
    'Nein. Mitglied sein und in einer Gruppe sein sind zwei verschiedene Dinge. Ob du in keine Gruppe gehst, in eine oder in mehrere, ist deine Sache — und du kannst es jederzeit ändern. Viele sind einfach dabei, weil sie den Verein gut finden.',
};

const COST_ENTRY: JoinFaqEntry = {
  id: 'cost',
  question: 'Was kostet mich das wirklich?',
  answer:
    '30 € im Jahr, bis 17 Jahre 15 €. Keine Aufnahmegebühr, keine Umlage. Beim Antrag wird nichts abgebucht — der Beitrag wird erst fällig, wenn wir dich aufgenommen haben.',
};

const TIME_ENTRY: JoinFaqEntry = {
  id: 'time',
  question: 'Ich habe kaum Zeit.',
  answer:
    'Dann fang bei der Organisation an: Aufbau, Getränke, Kasse — dort zählt, dass du da bist, wenn du kannst. Regelmäßige Proben durch die Session brauchen nur die Gruppen, die auftreten, also Tanzgarde, Männerballett und Kindergarde.',
};

const LOCAL_ENTRY: JoinFaqEntry = {
  id: 'local',
  question: 'Ich bin nicht von hier.',
  answer:
    'Dein Wohnort spielt für die Mitgliedschaft keine Rolle. Es gibt Mitglieder, die aus den Nachbardörfern nach Großfurra zur Probe fahren — die Anfahrt ist das Einzige, was du dabei selbst regeln musst.',
};

const PAUSE_ENTRY: JoinFaqEntry = {
  id: 'pause',
  question: 'Ein Jahr keine Zeit — muss ich kündigen?',
  answer:
    'Nein. Dann ruht deine Mitgliedschaft: Du bleibst Mitglied, setzt eine Session aus und steigst danach wieder ein, ohne neuen Antrag. Eine kurze Mail an uns genügt.',
};

const FIT_ENTRY: JoinFaqEntry = {
  id: 'fit',
  question: 'Und wenn es doch nicht passt?',
  answer:
    'Dann sagst du das. Eine Gruppe kannst du jederzeit wechseln oder wieder verlassen, und die Mitgliedschaft läuft pro Session — gekündigt wird zum Ende der Session. Festgehalten wird hier niemand.',
};

const CHILD_ENTRY_ID = 'child';

const CHILD_QUESTION = 'Mein Kind möchte mitmachen.';

const buildOnlineApplicantLine = (ageOfConsent: number | null): string =>
  ageOfConsent === null
    ? 'Den Antrag hier auf der Website stellen Jugendliche selbst, für sich allein. Für jüngere Kinder schreibt ihr uns — dann nehmen wir euer Kind direkt auf.'
    : `Den Antrag hier auf der Website stellt, wer mindestens ${ageOfConsent} ist — selbst und für sich allein. Ist euer Kind jünger, schreibt uns: Dann nehmen wir es direkt auf.`;

export const buildChildFaqAnswer = (ageOfConsent: number | null): string =>
  `Kinder können mitmachen: Die Kindergarde ist die Gruppe für die Kleinsten, später wechselt man in die Tanzgarde. ${buildOnlineApplicantLine(ageOfConsent)} Wer noch nicht 18 ist, braucht für die Aufnahme das Einverständnis der Eltern; das klären wir mit euch, bevor wir aufnehmen. Ab welchem Alter welche Gruppe passt und alles von Proben bis Auftritten besprecht ihr direkt mit der Gruppe.`;

export const buildJoinFaq = (ageOfConsent: number | null): JoinFaqEntry[] => [
  DANCING_ENTRY,
  GROUP_ENTRY,
  COST_ENTRY,
  TIME_ENTRY,
  LOCAL_ENTRY,
  PAUSE_ENTRY,
  { id: CHILD_ENTRY_ID, question: CHILD_QUESTION, answer: buildChildFaqAnswer(ageOfConsent) },
  FIT_ENTRY,
];
