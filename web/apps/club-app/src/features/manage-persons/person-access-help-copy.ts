export const MAIL_INVITATION_HELP_COPY = {
  mail: {
    title: 'Einladung per Mail',
    text: 'Sie bekommt eine Mail an die Adresse bei „An“. Mit dem Link darin richtet sie ihren Zugang zur App ein, er gilt 14 Tage.',
    address: 'Stimmt die Adresse nicht, ändere sie zuerst in den Stammdaten.',
  },
  single: {
    title: 'Immer nur eine Einladung',
    text: 'Eine neue Einladung macht die vorige ungültig, egal ob per Mail oder vor Ort. Die bisherige steht oben.',
  },
  send: {
    title: 'Senden',
    text: 'Der Knopf unten verschickt die Mail sofort. Darüber steht, wer sie bekommt.',
  },
} as const;

export const IN_PERSON_HELP_COPY = {
  recovery: {
    title: 'Wann das hilft',
    text: 'Wenn sie Passwort und Zugang zum E‑Mail-Postfach verloren hat. Hat sie nur das Passwort vergessen, setzt sie es beim Anmelden mit „Passwort vergessen“ selbst zurück.',
    inPerson: 'Wiederherstellen geht nur hier vor Ort, nie per Mail.',
  },
  code: {
    title: 'QR-Code zeigen',
    text: 'Zeig ihr deinen Bildschirm. Sie scannt den QR‑Code mit der Handykamera oder tippt in der App auf „Code eingeben“ und tippt den Code ab.',
    expiry: 'Der Code gilt 15 Minuten. Ist er abgelaufen, holst du mit „Neuer Code“ einen neuen.',
  },
  onboarding: {
    title: 'Danach',
    text: 'Sobald sie ihren Zugang eingerichtet hat, steht es hier. „Fertig“ bringt dich zurück zur Person.',
    single: 'Eine offene Einladung per Mail gilt dann nicht mehr.',
  },
  recovered: {
    title: 'Danach',
    text: 'Sie legt ein neues Passwort fest, alle anderen Geräte werden abgemeldet. Ihre bisherige Login-Adresse bekommt Bescheid.',
    finish: '„Fertig“ bringt dich zurück zur Person.',
  },
} as const;
