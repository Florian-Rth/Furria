export const PROFILE_HELP_SPOTS = {
  contact: 'help-profile-contact',
  visibility: 'help-profile-visibility',
  clubGroup: 'help-profile-club-group',
  signIn: 'help-profile-sign-in',
  push: 'help-profile-push',
  contactFields: 'help-profile-contact-fields',
} as const;

export const PROFILE_HELP_COPY = {
  contact: {
    title: 'Kontaktdaten',
    text: 'Hier stehen deine Telefonnummer, E-Mail und Adresse. Mit „Bearbeiten“ änderst du sie und dein Porträt.',
  },
  visibility: {
    title: 'Wer deine Kontaktdaten sieht',
    text: 'Mit „Meine Kontaktdaten für Mitglieder sichtbar“ entscheidest du, ob andere Mitglieder deine Kontaktdaten sehen.',
  },
  clubGroup: {
    title: 'WhatsApp-Vereinsgruppe',
    text: 'Schaltest du „In die Vereinsgruppe aufnehmen“ ein, darf dich der Vereins-Bot mit deiner Handynummer zur WhatsApp-Gruppe des Vereins hinzufügen.',
  },
  club: {
    title: 'Du im Verein',
    text: 'Unter „Im Verein“ siehst du deine Mitgliedschaft, unter „Deine Gruppen“ deine Gruppen. Tippe eine Gruppe an, um sie zu öffnen.',
  },
  signIn: {
    title: 'Anmeldung',
    text: '„Anmeldung & Sicherheit“ führt zu deiner Anmelde-E-Mail, deinem Passwort und deinen Passkeys.',
  },
  beerList: {
    title: 'Bierliste',
    text: 'Unter „Bierliste“ trägst du dich mit „Eintragen“ ein oder mit „Austragen“ wieder aus.',
  },
  appearance: {
    title: 'Darstellung',
    text: 'Unter „Darstellung“ wählst du, ob die App hell, dunkel oder wie dein Gerät aussieht.',
  },
  push: {
    title: 'Benachrichtigungen',
    text: 'Mit „Auf diesem Gerät benachrichtigen“ bekommst du Push‑Mitteilungen auf dieses Gerät.',
    topics:
      'Über „Auswählen“ bei „Themen“ legst du fest, worüber du benachrichtigt wirst, etwa neue Termine oder Aushänge.',
  },
  signOut: {
    title: 'Abmelden',
    text: 'Mit „Abmelden“ ganz unten meldest du dich auf diesem Gerät ab.',
  },
  edit: {
    title: 'Kontaktdaten ändern',
    text: 'Trag deine E-Mail, Telefonnummer und Anschrift ein und tippe unten auf „Speichern“.',
    phone: 'Deine Telefonnummer wird mit WhatsApp abgeglichen.',
  },
  portrait: {
    title: 'Porträt',
    text: 'Unter „Porträt“ lädst du mit „Hochladen“ ein Foto von dir hoch. Mit „Zuschnitt“ legst du den Ausschnitt fest.',
  },
} as const;
