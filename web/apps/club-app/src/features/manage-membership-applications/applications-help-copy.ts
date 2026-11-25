export const APPLICATIONS_HELP_SPOTS = {
  list: 'help-applications-list',
} as const;

export const APPLICATIONS_HELP_COPY = {
  what: {
    title: 'Beitrittsanträge',
    text: 'Hier landen Anträge von der Website, sobald die Absenderin sie per Mail bestätigt hat. Unbestätigte verschwinden nach 48 Stunden von selbst.',
    notYet:
      'Wer einen Antrag stellt, ist noch kein Mitglied. Das wird sie erst, wenn du sie aufnimmst.',
  },
  list: {
    title: 'Die Liste',
    text: 'Jede Zeile zeigt Alter, Wohnort und wie lange der Antrag schon wartet. Tippe auf einen Antrag, um aufzunehmen oder abzulehnen.',
    minor:
      '„minderjährig“ heißt: Vor der Aufnahme muss die Einwilligung der gesetzlichen Vertretung vorliegen.',
  },
} as const;

export const APPLICATION_HELP_SPOTS = {
  applicant: 'help-application-applicant',
} as const;

export const APPLICATION_HELP_COPY = {
  details: {
    title: 'Angaben',
    text: 'Du siehst, was sie im Antrag angegeben hat, und wann er eingegangen und bestätigt ist.',
  },
  admit: {
    title: 'Aufnehmen',
    text: 'Über dem Knopf „Aufnehmen“ steht, wie viele Personen im Register zu ihr passen. Der Knopf führt zur Aufnahme, dort entscheidest du.',
  },
  decline: {
    title: 'Ablehnen',
    text: '„Antrag ablehnen“ ganz unten löscht den Antrag sofort mit allen Angaben. Es geht keine Mail raus.',
    spam: 'So räumst du auch Spam und zurückgezogene Anträge weg.',
  },
} as const;

export const ADMISSION_HELP_SPOTS = {
  candidates: 'help-admission-candidates',
  admission: 'help-admission-date',
} as const;

export const ADMISSION_HELP_COPY = {
  candidates: {
    title: 'Im Register',
    text: 'Gibt es Personen mit ihrer E‑Mail oder ihrem Namen und Geburtsdatum, stehen sie hier. Wähle die passende oder „Neue Person“. Wer schon Mitglied ist, lässt sich nicht wählen.',
    fill: 'Bei einer bestehenden Person ergänzt der Antrag nur, was fehlt. Wer früher Mitglied war, behält sein „Mitglied seit“.',
  },
  date: {
    title: 'Aufnahmedatum',
    text: 'Ab diesem Tag ist sie Mitglied. Frühestens der Tag ihres Antrags, ein Tag in der Zukunft geht auch.',
    minor:
      'Ist sie an dem Tag unter 18, bestätigst du, dass die Einwilligung der gesetzlichen Vertretung vorliegt. Das wird mit deinem Namen gespeichert.',
  },
  save: {
    title: 'Mitglied aufnehmen',
    text: 'Über dem Knopf steht, was passiert. Ist sie ab heute Mitglied und alt genug für die App, geht die Einladung gleich mit raus.',
    gone: 'Danach wird der Antrag gelöscht, seine Angaben stehen dann bei der Person.',
    leave: 'Gehst du vorher weg, fragt die App, ob deine Eingaben verworfen werden sollen.',
  },
} as const;
