export const TABLE_PLAN_HELP_SPOTS = {
  tools: 'help-table-plan-tools',
  status: 'help-table-plan-status',
} as const;

export const TABLE_PLAN_HELP_COPY = {
  start: {
    title: 'Saal wählen',
    text: 'Wähle den Saal, in dem der Abend stattfindet, oder übernimm unter „Übernehmen von“ den Tischplan eines anderen Abends.',
    draw: 'Gibt es noch keinen passenden Saal, legst du mit „Saal zeichnen“ einen an – dafür braucht der Abend einen Ort.',
  },
  view: {
    title: 'Im Saal bewegen',
    touch:
      'Mit einem Finger verschiebst du den Saal, mit zwei Fingern zoomst du. Doppeltippen zoomt heran.',
    desk: 'Das Mausrad zoomt. Mit gedrückter Leertaste oder mittlerer Maustaste verschiebst du den Saal, „Einpassen“ zeigt wieder alles.',
    measure: 'Mit „Messen“ ziehst du eine Strecke auf und siehst ihre Länge.',
  },
  add: {
    title: 'Tische hinstellen',
    touch:
      '„Hinzufügen“ zeigt die Tischarten und drei Wege: „Tisch“ setzt einen Tisch per Tipp, „Tischreihe“ ziehst du in der gewünschten Länge auf.',
    desk: 'Wähle Tischart und Werkzeug: „Tisch stellen“ setzt einen Tisch per Klick, „Tischreihe ziehen“ zieht eine Reihe in der gewünschten Länge auf.',
    seats:
      '„Für X Personen“ rechnet aus, wie viele Tische du für eine Zahl an Stühlen brauchst – als Reihe oder als Block. Eine Vorschau zeigt, wo sie stehen.',
  },
  select: {
    title: 'Auswählen und ändern',
    touch:
      'Tippe einen Tisch an: Die Leiste darüber macht die Reihe länger oder kürzer, dupliziert oder löscht sie. Unter „Mehr“ stehen Drehung, Nummer, Notiz und die Stuhlseiten. Zum Verschieben ziehst du den gewählten Tisch – er richtet sich dabei an den anderen aus.',
    touchMany:
      'Lange drücken nimmt weitere Tische dazu. „Gruppieren“ fasst sie zu einer Tischgruppe zusammen, die sich gemeinsam bewegt – ein zweiter Tipp wählt darin einen einzelnen Tisch.',
    desk: 'Klick wählt einen Tisch, mit Umschalt nimmst du weitere dazu, auf freier Fläche ziehst du einen Rahmen auf. Daneben änderst du Länge, Drehung, Nummer und Notiz der Auswahl.',
  },
  chairs: {
    title: 'Stühle',
    text: 'Die Stühle stellt die App selbst um jeden Tisch. Wo sie keinen Platz haben, lässt sie sie weg.',
    seating: '„Bequem“ oder „Maximal“ legt fest, wie eng die Stühle nebeneinander stehen.',
    setup:
      'In der Ansicht „Aufbau“ tippst du einzelne Stühle an: „Trotzdem hinstellen“, „Stuhl entfernen“, Nummer oder Notiz.',
  },
  findings: {
    title: 'Abstände',
    text: 'Oben siehst du, ob die Abstände passen. Eine Engstelle ist ein Gang, der schmaler ist als der Mindestgang. Eine Überschneidung heißt: Tische oder Stühle stoßen aneinander, an den Saal oder stehen vor einem Notausgang.',
    show: 'Tippe darauf, um alle Stellen zu sehen – „Zeigen“ springt hin.',
  },
  settings: {
    title: 'Nummern und Tischarten',
    text: '„Nummern vergeben“ nummeriert Tische und Stühle der Reihe nach durch. Unter „Tische & Stühle“ stellst du Abstände und Tischarten für alle Tischpläne ein.',
    touch: 'Beides und die Bestuhlung findest du unter „Plan“ oben.',
    hall: '„Saal bearbeiten“ oben öffnet den Saal dieses Plans.',
    saving:
      'Alles speichert sich von selbst – Rückgängig und Wiederholen findest du in der Leiste.',
  },
} as const;
