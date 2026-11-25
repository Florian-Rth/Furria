export const PERSONS_HELP_SPOTS = {
  register: 'help-persons-register',
  intakes: 'help-persons-intakes',
} as const;

export const PERSONS_HELP_COPY = {
  find: {
    title: 'Personen finden',
    text: 'Über die Suche oben findest du Personen nach Name, Adresse oder E‑Mail. Mit den Buchstaben springst du direkt zu einem Nachnamen.',
    filter:
      'Die Filter grenzen nach Mitgliedschaft ein, etwa „aktiv“ oder „ruht“. Unter „App“ filterst du nach dem Stand in der App, unter „archiviert“ stehen abgelegte Personen.',
  },
  rows: {
    title: 'Das Register',
    text: 'Jede Zeile zeigt Gruppen und Rollen, rechts den Stand der Mitgliedschaft und der App. Tippe auf eine Person, um sie zu öffnen.',
    withheld: '„nicht freigegeben“ heißt: Ihre Kontaktdaten sehen andere Mitglieder nicht.',
  },
  add: {
    title: 'Person anlegen',
    text: '„+ Person“ legt eine neue Person an, du trägst ihre Daten selbst ein.',
    intakes:
      'Steht sie neben dir, geht es mit „QR‑Anmeldungen“ schneller: Sie scannt einen QR‑Code und trägt ihre Angaben selbst ein.',
  },
  rounds: {
    title: 'Alle einladen und Erinnern',
    invite:
      '„Alle einladen“ schickt jedem, der die App haben kann und noch nie eingeladen wurde, eine Mail mit persönlichem Link. Der Link gilt 14 Tage.',
    remind:
      '„Erinnern“ schickt allen, die seit über drei Tagen eingeladen sind, einen neuen Link. Der alte gilt dann nicht mehr.',
    noMail: 'Wer keine E‑Mail-Adresse hat, bekommt nichts und kann nur vor Ort eingeladen werden.',
  },
  stats: {
    title: 'Das Register in Zahlen',
    text: 'Ganz unten siehst du, wie viele Personen aktiv sind, ruhen oder die App schon nutzen.',
  },
} as const;
