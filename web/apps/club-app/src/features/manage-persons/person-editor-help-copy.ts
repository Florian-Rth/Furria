export const PERSON_EDITOR_HELP_SPOTS = {
  name: 'help-person-editor-name',
  personal: 'help-person-editor-personal',
  portrait: 'help-person-editor-portrait',
} as const;

export const PERSON_EDITOR_HELP_COPY = {
  name: {
    title: 'Name, Kontakt, Anschrift',
    text: 'Pflicht sind nur Vor- und Nachname. Alles andere kannst du später ergänzen.',
  },
  adoption: {
    title: 'Schon da?',
    text: 'Gehört die E‑Mail-Adresse schon zu einer Person, die nicht im Verein aktiv ist, schlägt die App „Diese Person übernehmen“ vor. Dann öffnest du sie, statt sie doppelt anzulegen.',
  },
  personal: {
    title: 'Geburtsdatum',
    text: 'Am Geburtsdatum sieht die App, ob sie alt genug für einen eigenen Zugang ist. Kennst du es nicht, lass es leer.',
  },
  portrait: {
    title: 'Porträt',
    text: 'Ein Porträt wird gleich beim Hochladen gespeichert, dafür braucht es kein „Speichern“.',
  },
  save: {
    title: 'Fertig',
    create: 'Unten „Hinzufügen“ legt die Person an.',
    edit: 'Unten „Speichern“ übernimmt deine Änderungen.',
    leave: 'Gehst du vorher weg, fragt die App, ob deine Eingaben verworfen werden sollen.',
  },
} as const;
