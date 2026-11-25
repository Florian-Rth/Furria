export const VENUES_HELP_SPOTS = {
  list: 'help-venues-list',
  archived: 'help-venues-archived',
} as const;

export const VENUE_HELP_SPOTS = {
  address: 'help-venue-address',
  openingHours: 'help-venue-opening-hours',
} as const;

export const VENUE_EDITOR_HELP_SPOTS = {
  place: 'help-venue-place',
  address: 'help-venue-address-form',
  openingHours: 'help-venue-opening-form',
} as const;

export const VENUES_HELP_COPY = {
  list: {
    title: 'Im Verzeichnis',
    text: 'Die Orte, die der Verein nutzt – Halle, Vereinsheim, Lager und die Geschäfte, die Karten verkaufen. Jede Karte zeigt Anschrift, Öffnungszeiten und Hinweise zur Anfahrt.',
    open: 'Antippen öffnet den Ort. Mit „+ Ort“ legst du einen neuen an.',
  },
  usage: {
    title: 'Wo Orte vorkommen',
    text: 'Kalendereinträge finden an einem Ort statt, und Schlüssel werden für einen Ort ausgegeben. Anschrift und Öffnungszeiten schreibst du nur hier.',
  },
  archived: {
    title: 'Archiviert',
    text: 'Archivierte Orte stehen nicht mehr zur Auswahl. Was dort schon stattfand, bleibt erhalten.',
    restore: '„Aktivieren“ macht einen Ort wieder auswählbar.',
  },
} as const;

export const VENUE_HELP_COPY = {
  address: {
    title: 'Anschrift',
    text: 'Anschrift und der Hinweis zu Anfahrt und Zugang.',
    edit: '„Bearbeiten“ öffnet Name, Anschrift und Öffnungszeiten zum Ändern.',
  },
  openingHours: {
    title: 'Öffnungszeiten',
    text: 'Sie erscheinen überall, wo dieser Ort eine Vorverkaufsstelle ist.',
  },
  halls: {
    title: 'Säle',
    text: 'Ein Saal ist ein gezeichneter Raum dieses Ortes mit Wänden, Türen und Bühne. „+ Saal zeichnen“ legt sofort einen neuen Saal an und öffnet ihn zum Zeichnen.',
  },
  archive: {
    title: 'Ort archivieren',
    text: '„Ort archivieren“ ganz unten nimmt den Ort aus der Auswahl. In der Liste kannst du ihn unter „Archiviert“ wieder aktivieren.',
  },
} as const;

export const VENUE_EDITOR_HELP_COPY = {
  place: {
    title: 'Name',
    text: 'So, wie ihr den Ort nennt – etwa Bürgerhaus, Vereinsheim oder Bäckerei.',
  },
  address: {
    title: 'Anschrift',
    text: 'Straße, PLZ und Stadt sind Pflicht.',
    hint: 'Unter „Anfahrt & Zugang“ steht, was die Anschrift nicht sagt: Parken, Eingang, Haltestelle.',
  },
  openingHours: {
    title: 'Öffnungszeiten',
    text: '„Zeit hinzufügen“ ergänzt eine Zeile mit Tag, Von und Bis. Für geteilte Zeiten trägst du denselben Tag zweimal ein.',
    rules:
      '„Bis“ muss nach „Von“ liegen, und Zeiten eines Tages dürfen sich nicht überschneiden. „Entfernen“ löscht eine Zeile.',
  },
  save: {
    title: 'Speichern',
    create: '„Hinzufügen“ trägt den Ort ins Verzeichnis ein.',
    edit: '„Speichern“ übernimmt deine Änderungen überall, wo der Ort vorkommt.',
  },
} as const;
