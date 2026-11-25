export const RUNNING_ORDER_HELP_SPOTS = {
  modes: 'help-running-order-modes',
  list: 'help-running-order-list',
} as const;

export const RUNNING_ORDER_HELP_COPY = {
  modes: {
    title: 'In drei Schritten',
    text: 'Oben wechselst du zwischen Wählen, Ordnen und Prüfen. Unten geht es mit „Weiter“ zum nächsten Schritt – solange noch etwas fehlt, steht dort, was.',
    saving: 'Jede Änderung speichert sich von selbst. „Rückgängig“ oben nimmt die letzte zurück.',
  },
  pick: {
    title: 'Wählen',
    text: 'Tippe die Auftritte an, die an diesem Abend dabei sind. Die Knöpfe „Wie …“ übernehmen auf einmal die Auftritte eines anderen Abends.',
    newAct: 'Fehlt ein Auftritt, legst du ihn unten mit „Neuer Auftritt“ an.',
  },
  order: {
    title: 'Ordnen',
    text: 'Zieh einen Auftritt am Griff an seinen Platz. Nur er wandert – alle anderen behalten ihre Reihenfolge. Beim Ziehen siehst du schon, wie viele Konflikte der neue Platz hätte.',
    unplaced:
      'Neu gewählte Auftritte warten unter „Noch nicht eingeplant“. „Einplanen“ oder „Alle einplanen“ holt sie in den Abend.',
  },
  hold: {
    title: 'Festhalten und zusammenhalten',
    text: 'Die Nadel hält einen Auftritt auf seinem Platz fest. Zieh das Kettensymbol auf den Nachbarn, dann bleiben beide zusammen und wandern gemeinsam.',
    row: 'Tippe einen Auftritt an, um ihn zurückzustellen oder aus dem Abend zu nehmen.',
  },
  wishes: {
    title: 'Wünsche',
    text: 'Unter „Wünsche“ hältst du fest, was gelten soll – für einen Auftritt, etwa ganz am Anfang oder nach einem anderen, oder für den ganzen Abend.',
    strength: '„Muss“ ist fest, „Möglichst“ nur ein Wunsch.',
  },
  autoOrder: {
    title: 'Automatisch ordnen',
    text: '„Automatisch ordnen“ sucht die beste Reihenfolge. Feste Plätze, Zusammengehaltenes und Muss‑Wünsche bleiben dabei erhalten. Beim Prüfen heißt der Knopf „Vorschlag“.',
    proposal:
      'Du siehst, was sich ändert: einzeln mit „Übernehmen“, alles mit „Alle übernehmen“ – oder „Verwerfen“. Reicht die Zeit nicht, sucht „Weiter suchen“ länger.',
    holds:
      'Bleiben Konflikte, steht unter „Warum Konflikte bleiben“, welcher feste Platz oder Wunsch im Weg ist – lockern geht dort mit einem Tipp.',
  },
  marks: {
    title: 'Was die Zeichen heißen',
    conflict:
      'Rot ist ein Konflikt: Jemand steht in zwei Auftritten direkt nacheinander und kann sich nicht umziehen, oder ein Muss‑Wunsch ist verletzt.',
    hint: 'Gold ist ein Hinweis: Nur ein Auftritt liegt zum Umziehen dazwischen, ein Wunsch ist verfehlt oder zwei Reden folgen aufeinander.',
    fix: 'Was nicht passt, steht direkt zwischen den Auftritten – oft mit einem Knopf, der es behebt.',
  },
  confirm: {
    title: 'Ablauf steht',
    text: 'Ohne Konflikte hältst du beim Prüfen „Ablauf steht“ gedrückt und bestätigst. Alle sehen dann, dass der Ablauf steht; spätere Änderungen werden markiert.',
    reopen: '„Wieder öffnen“ hebt das auf.',
  },
} as const;
