export const SECURITY_HELP_SPOTS = {
  loginEmail: 'help-security-login-email',
  password: 'help-security-password',
  passkeys: 'help-security-passkeys',
  devices: 'help-security-devices',
  newAddress: 'help-security-new-address',
  newPassword: 'help-security-new-password',
  passkey: 'help-security-passkey',
} as const;

export const SECURITY_HELP_COPY = {
  loginEmail: {
    title: 'Anmelde-E-Mail',
    text: 'Mit dieser Adresse meldest du dich an. Über „Bearbeiten“ änderst du sie.',
  },
  password: {
    title: 'Passwort',
    text: 'Über „Bearbeiten“ legst du ein neues Passwort fest. Auf deinen anderen Geräten bist du danach abgemeldet.',
  },
  passkeys: {
    title: 'Passkeys',
    text: 'Mit einem Passkey meldest du dich auf einem Gerät ohne Passwort an.',
    add: 'Mit „+ Passkey“ richtest du einen für dieses Gerät ein.',
    unavailable: 'Auf diesem Gerät kannst du keinen Passkey einrichten.',
    open: 'Tippe einen Passkey an, um ihn zu entfernen.',
  },
  devices: {
    title: 'Überall abmelden',
    text: '„Überall abmelden“ meldet dich auf allen Geräten ab, auch auf diesem.',
  },
  deletion: {
    title: 'Account löschen',
    text: 'Ganz unten löschst du mit „Account löschen“ deinen Zugang zur App. Einen neuen gibt es nur über eine neue Einladung.',
  },
  newAddress: {
    title: 'Neue Adresse eingeben',
    text: 'Gib deine neue Anmelde-E-Mail ein und tippe auf „Code senden“.',
    contact:
      'Hakst du „Kontakt-E-Mail ebenfalls ändern“ an, ändert sich auch die E-Mail in deinen Kontaktdaten.',
  },
  code: {
    title: 'Code eingeben',
    text: 'Wir schicken dir einen Code an die neue Adresse. Gib ihn ein und tippe auf „Speichern“.',
    resend: 'Ist der Code abgelaufen oder nicht angekommen, tippe auf „Neuen Code senden“.',
  },
  newPassword: {
    title: 'Neues Passwort',
    text: 'Gib zuerst dein jetziges Passwort ein, dann das neue. Mit „Speichern“ übernimmst du es.',
    after: 'Auf deinen anderen Geräten bist du danach abgemeldet.',
  },
  passkey: {
    title: 'Dein Passkey',
    text: 'Hier siehst du, wie der Passkey heißt und wann du ihn hinzugefügt hast.',
  },
  passkeyRemoval: {
    title: 'Passkey entfernen',
    text: 'Mit „Passkey entfernen“ löschst du ihn. Danach meldest du dich mit ihm nicht mehr an.',
  },
} as const;
