export const HUB_HELP_SPOTS = {
  usualTimes: 'help-usual-times',
  calendar: 'help-calendar',
  acts: 'help-acts',
  people: 'help-people',
  history: 'help-history',
} as const;

export const HUB_HELP_ADMIN_CHIP = 'Gruppen-Admin';

export const HUB_HELP_COPY = {
  usualTimes: {
    title: 'Wann ihr trainiert',
    text: 'Die Wochenleiste zeigt eure festen Trainingstage, darunter stehen Uhrzeit, Dauer und Ort.',
    manage:
      'Mit „+ Trainingszeit“ legst du einen neuen Wochentermin an. Tippe eine Zeit an, um sie zu ändern.',
  },
  calendar: {
    title: 'Eure nächsten Termine',
    text: 'Trainings und Termine der Gruppe. Sag direkt in der Zeile zu oder ab – über „Alle Termine“ geht es in den Kalender.',
    manage:
      'Mit „+ Training“ setzt du einen Termin an. Tag und Uhrzeit aus euren festen Zeiten sind schon eingetragen.',
  },
  acts: {
    title: 'Eure Auftritte',
    text: 'Jede Karte ist ein Auftritt dieser Session: wann ihr dran seid, das nächste Training und ob die Musik zum Üben bereitliegt. Antippen öffnet Musik, Schritte und Video.',
    manage: 'Mit „+ Neu“ legst du einen Sessionsauftritt an.',
  },
  people: {
    title: 'Wer dabei ist',
    text: 'Alle in der Gruppe, mit den Gruppen-Admins vorne. Tippe ein Bild an, um mehr über die Person zu sehen.',
    manage:
      'Mit „+ Mitglied“ nimmst du jemanden in die Gruppe auf – auch Leute, die nicht Mitglied im Verein sind.',
    intake:
      'Wer noch gar nicht in der App ist, trägt sich über „QR‑Code erstellen“ per Handy selbst ein und landet direkt in eurer Gruppe.',
  },
  settings: {
    title: 'Bild, Farbe und Beschreibung',
    text: 'Über das Zahnrad oben änderst du Bild, Farbe und Beschreibung der Gruppe.',
  },
  history: {
    title: 'Geschichte',
    text: 'Ganz unten steht, wer früher in der Gruppe war und wer sie geleitet hat.',
  },
} as const;
