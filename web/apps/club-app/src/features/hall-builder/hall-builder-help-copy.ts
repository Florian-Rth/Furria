export const HALL_BUILDER_HELP_SPOTS = {
  tools: 'help-hall-tools',
  status: 'help-hall-status',
} as const;

export const HALL_BUILDER_HELP_COPY = {
  view: {
    title: 'Im Saal bewegen',
    touch:
      'Mit einem Finger verschiebst du den Saal, mit zwei Fingern zoomst du. Doppeltippen zoomt heran.',
    desk: 'Das Mausrad zoomt. Mit gedrückter Leertaste oder mittlerer Maustaste verschiebst du den Saal, „Einpassen“ zeigt wieder alles.',
    measure: 'Mit „Messen“ ziehst du eine Strecke auf und siehst ihre Länge.',
  },
  draw: {
    title: 'Zeichnen',
    touch: '„Hinzufügen“ bietet Wand, Tür, Fläche, Säule, Linie und Text.',
    desk: 'In der Werkzeugleiste wählst du Wand, Tür, Fläche, Säule, Linie oder Text – oder per Taste: W, D, F, S, L, T, zurück zur Auswahl mit V.',
    polylineTouch:
      'Wände und Linien setzt du Punkt für Punkt per Tipp. „Letzten Punkt weg“ nimmt einen zurück, „Fertig“ schließt ab.',
    polylineDesk: 'Wände und Linien klickst du Punkt für Punkt, ein Doppelklick schließt ab.',
    shapes:
      'Türen und Flächen ziehst du auf, Säulen und Texte setzt du an die Stelle. Punkte rasten an Ecken und Wänden ein.',
  },
  select: {
    title: 'Auswählen und ändern',
    touch:
      'Tippe ein Element an: Die Leiste darüber dupliziert oder löscht es. Unter „Mehr“ stellst du Art, Maße und Drehung ein. Zum Verschieben ziehst du das gewählte Element.',
    touchMany: 'Lange drücken nimmt weitere Elemente dazu.',
    desk: 'Klick wählt ein Element, mit Umschalt nimmst du weitere dazu, auf freier Fläche ziehst du einen Rahmen auf. Daneben stellst du Art, Maße und Drehung ein.',
    merge: 'Zwei Flächen, die sich berühren, fügst du mit „Zusammenfügen“ zu einer zusammen.',
  },
  exits: {
    title: 'Notausgänge',
    text: 'Stell bei Türen ein, ob sie Notausgang sind. Im Tischplan bleibt davor Platz frei – ein Tisch dort zählt als Überschneidung.',
  },
  hall: {
    title: 'Name, Ort und Speichern',
    text: 'Unter „Saal‑Angaben“ änderst du Name und Ort. Dort kannst du den Saal auch löschen – einen Saal, den ein Tischplan nutzt, aber nicht.',
    saving: 'Alles speichert sich von selbst; oben siehst du, ob es gespeichert ist.',
  },
} as const;
