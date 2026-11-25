export const INTAKES_HELP_SPOTS = {
  list: 'help-intakes-list',
} as const;

export const INTAKES_HELP_COPY = {
  what: {
    title: 'QR‑Anmeldung',
    text: 'So kommt jemand Neues ins Register: Du legst fest, ob sie Mitglied wird und in welche Gruppen sie kommt. Ihre Daten trägt sie über einen QR‑Code selbst ein.',
    create: '„+ QR‑Code erstellen“ legt eine neue an. Der Link dazu gilt 7 Tage und nur einmal.',
  },
  list: {
    title: 'Die Liste',
    text: 'Oben steht, was „zu prüfen“ ist, dann „offen“, „abgelaufen“ und zuletzt Erledigtes. Tippe auf eine, um sie zu öffnen.',
    review:
      '„zu prüfen“ heißt: Im Register steht vielleicht schon jemand mit ihrer E‑Mail oder ihrem Namen und Geburtsdatum. Du entscheidest, ob sie das ist.',
  },
  groupAdmin: {
    title: 'Für deine Gruppen',
    chip: 'Gruppen-Admin',
    text: 'Du siehst die QR‑Anmeldungen deiner Gruppen und legst neue nur für Gruppen an, die du leitest. Über eine Mitgliedschaft entscheidet der Verein.',
  },
} as const;
