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

export const JOIN_FAQ: JoinFaqEntry[] = [
  {
    id: 'dancing',
    question: 'Muss ich tanzen können?',
    answer:
      'Nein. Drei unserer sechs Gruppen tanzen überhaupt nicht: der Elferrat trägt die Prunksitzung, in der Büttenrede steht man am Mikrofon, und die Organisation hält den Abend hinter der Bühne zusammen. In der Tanzgarde und im Männerballett fängt außerdem jede und jeder bei null an — eine Choreografie lernt hier niemand allein.',
  },
  {
    id: 'group',
    question: 'Muss ich in eine Gruppe?',
    answer:
      'Nein. Mitglied sein und in einer Gruppe sein sind zwei verschiedene Dinge. Ob du in keine Gruppe gehst, in eine oder in mehrere, ist deine Sache — und du kannst es jederzeit ändern. Viele sind einfach dabei, weil sie den Verein gut finden.',
  },
  {
    id: 'cost',
    question: 'Was kostet mich das wirklich?',
    answer:
      '30 € im Jahr, bis 17 Jahre 15 €. Keine Aufnahmegebühr, keine Umlage. Beim Antrag wird nichts abgebucht — der Beitrag wird erst fällig, wenn wir dich aufgenommen haben. Und wenn das Geld gerade nicht da ist: schreib uns, wir finden eine Lösung, und das bleibt unter uns.',
  },
  {
    id: 'time',
    question: 'Ich habe kaum Zeit.',
    answer:
      'Dann fang bei der Organisation an: Aufbau, Getränke, Kasse — dort zählt, dass du da bist, wenn du kannst. Regelmäßige Proben durch die Session brauchen nur die Gruppen, die auftreten, also Tanzgarde, Männerballett und Kindergarde.',
  },
  {
    id: 'local',
    question: 'Ich bin nicht von hier.',
    answer:
      'Dein Wohnort spielt für die Mitgliedschaft keine Rolle, und niemand fragt dich nach einer Postleitzahl. Ein Teil von uns fährt aus den Nachbardörfern nach Großbesenstadt zur Probe — das ist der Normalfall, kein Sonderfall.',
  },
  {
    id: 'pause',
    question: 'Ein Jahr keine Zeit — muss ich kündigen?',
    answer:
      'Nein. Dann ruht deine Mitgliedschaft: Du bleibst Mitglied, setzt eine Session aus und steigst danach wieder ein, ohne neuen Antrag. Eine kurze Mail an uns genügt.',
  },
  {
    id: 'child',
    question: 'Mein Kind möchte mitmachen.',
    answer:
      'Ab sechs Jahren geht das: Die Kindergarde ist die Gruppe für die Kleinsten, ab zwölf tanzt man in der Tanzgarde. Den Antrag füllt ihr gemeinsam aus — bei unter 18-Jährigen fragen wir im Formular nach den Kontaktdaten und der Einwilligung eines Elternteils. Alles Weitere, von Proben bis Auftritten, klärt ihr direkt mit der Gruppe.',
  },
  {
    id: 'fit',
    question: 'Und wenn es doch nicht passt?',
    answer:
      'Dann sagst du das. Eine Gruppe kannst du jederzeit wechseln oder wieder verlassen, und die Mitgliedschaft läuft pro Session — gekündigt wird zum Ende der Session. Festgehalten wird hier niemand.',
  },
];
