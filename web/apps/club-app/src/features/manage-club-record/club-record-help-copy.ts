import type { ClubRecordSection } from './club-record-labels';

export const CLUB_RECORD_HELP_SPOTS: Record<ClubRecordSection, string> = {
  identity: 'help-club-identity',
  contact: 'help-club-contact',
  access: 'help-club-access',
  stage: 'help-club-stage',
};

export const CLUB_EDITOR_HELP_SPOTS = {
  identity: 'help-club-identity-form',
  address: 'help-club-address',
  reach: 'help-club-reach',
  web: 'help-club-web',
  age: 'help-club-age',
  stageSize: 'help-club-stage-size',
  stageArtwork: 'help-club-stage-artwork',
} as const;

export const CLUB_RECORD_HELP_COPY = {
  identity: {
    title: 'Name & Gründung',
    text: 'Der offizielle Vereinsname, der Kurzname und das Gründungsjahr.',
  },
  contact: {
    title: 'Anschrift & Kontakt',
    text: 'Anschrift, E‑Mail, Telefon und die Links zu Website, Instagram und Facebook.',
  },
  access: {
    title: 'Zugang zur App',
    text: 'Ab welchem Alter jemand die App bekommt und online einen Beitrittsantrag stellen kann.',
  },
  stage: {
    title: 'Bühne',
    text: 'Breite, Tiefe und eine Zeichnung eurer Bühne. Darauf planen die Gruppen ihre Aufstellungen.',
  },
  editing: {
    title: 'Ändern',
    text: 'Jeder Bereich hat oben rechts „Bearbeiten“ und wird für sich gespeichert. Was fehlt, steht als „nicht hinterlegt“ da.',
  },
} as const;

export const CLUB_IDENTITY_HELP_COPY = {
  fields: {
    title: 'Name, Kurzname, Gründungsjahr',
    text: 'Den Vereinsnamen trägst du so ein wie im Vereinsregister, mit „e.V.“. Der Kurzname ist die kurze Form, etwa „GCC“.',
    optional: 'Jedes Feld darf leer bleiben.',
  },
  save: {
    title: 'Speichern',
    text: '„Speichern“ übernimmt die Angaben und bringt dich zurück zu den Vereinsdaten.',
  },
} as const;

export const CLUB_CONTACT_HELP_COPY = {
  address: {
    title: 'Anschrift',
    text: 'Straße mit Hausnummer, PLZ und Ort des Vereins.',
  },
  reach: {
    title: 'Erreichbarkeit',
    text: 'E‑Mail und Telefon, unter denen der Verein erreichbar ist.',
  },
  web: {
    title: 'Im Netz',
    text: 'Website, Instagram und Facebook trägst du als ganze Adresse ein, mit https://.',
  },
  save: {
    title: 'Speichern',
    text: 'Leere Felder sind erlaubt. „Speichern“ übernimmt alles auf einmal.',
  },
} as const;

export const CLUB_ACCESS_HELP_COPY = {
  age: {
    title: 'Mindestalter',
    text: 'Wer jünger ist als dieses Alter, wird nicht in die App eingeladen und kann sich nicht online bewerben.',
    change:
      'Unter der Auswahl steht, was das gewählte Alter bedeutet. Erst „Speichern“ macht es gültig.',
  },
} as const;

export const CLUB_STAGE_HELP_COPY = {
  size: {
    title: 'Maße',
    text: 'Die Breite misst du entlang der Bühnenkante von links nach rechts, die Tiefe von der Kante nach hinten. Beides in Metern.',
  },
  artwork: {
    title: 'Bühnenzeichnung',
    text: 'Mit „SVG‑Datei wählen“ legst du eine Zeichnung als Hintergrund der Bühne fest. Es geht nur eine SVG‑Datei.',
    preview:
      'Die Vorschau zeigt die Bühne, sobald Breite und Tiefe stimmen. Passt das Seitenverhältnis der Zeichnung nicht, erscheint ein Hinweis, weil sie verzerrt wird.',
  },
  use: {
    title: 'Wofür',
    text: 'Auf dieser Bühne planen die Gruppen ihre Aufstellungen.',
  },
} as const;
