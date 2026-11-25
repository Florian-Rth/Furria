import type { SystemArea } from './types';

export const SYSTEM_HELP_SPOTS = {
  board: 'help-system-board',
  areas: 'help-system-areas',
  claimWindow: 'help-system-claim-window',
  whatsApp: 'help-system-whatsapp',
  program: 'help-system-program',
  area: 'help-system-area',
  testPush: 'help-system-test-push',
} as const;

export const SYSTEM_HELP_COPY = {
  board: {
    title: 'Der Gesamtzustand',
    text: 'Die Tafel zeigt je Bereich einen Messwert und ein Wort: OK, HINWEIS oder STÖRUNG. Darunter stehen das Gesamturteil und die Gründe dafür.',
    open: 'Tippe eine Zeile oder einen Grund an, um den Bereich zu öffnen.',
    live: 'Der Stand lädt alle zehn Sekunden neu. Reißt die Verbindung ab, wird die Tafel blass und zeigt, seit wann sie keine Verbindung hat.',
  },
  areas: {
    title: 'Die Bereiche',
    text: 'Unter „Bereiche“ steht jeder Bereich mit einer kurzen Zusammenfassung. Ein Hinweis oder eine Störung ist farbig markiert.',
    open: 'Antippen öffnet die Einzelheiten, etwa die Warteschlange der Medien oder das Protokoll.',
  },
  claimWindow: {
    title: 'Anmeldefenster',
    text: 'Unter „Zugang“ öffnest du das Anmeldefenster. Darüber richten Personen ohne hinterlegte E‑Mail-Adresse ihren Zugang mit Name und Geburtsdatum ein.',
  },
  whatsApp: {
    title: 'WhatsApp',
    text: 'Unter „Anbindungen“ verknüpfst du den WhatsApp-Bot und wählst die Vereinsgruppe, in die er postet.',
  },
  program: {
    title: 'Anwendung',
    text: '„Anwendung“ zeigt Version, Umgebung, Startzeit und Serverzeit des Servers.',
  },
  testPush: {
    title: 'Mitteilungen prüfen',
    text: '„Testnachricht senden“ schickt dir selbst eine Mitteilung – an jedes deiner Geräte, auf dem Benachrichtigungen eingeschaltet sind.',
  },
} as const;

export const SYSTEM_HELP_LEVELS = {
  ok: 'In Ordnung',
  attention: 'Hinweis',
} as const;

export interface SystemAreaHelpHint {
  key: string;
  title: string;
  texts: readonly string[];
  showsSpot?: true;
}

const AREA_STATE_HINT: SystemAreaHelpHint = {
  key: 'state',
  title: 'Zustand des Bereichs',
  texts: [
    'Oben steht, wie es dem Bereich geht: In Ordnung, Hinweis oder Störung. Daneben steht in einem Satz, was genau auffällt.',
    'Die Werte laden alle zehn Sekunden neu, solange die Seite offen ist.',
  ],
};

export const SYSTEM_AREA_HELP: Record<SystemArea, readonly SystemAreaHelpHint[]> = {
  media: [
    AREA_STATE_HINT,
    {
      showsSpot: true,
      key: 'queue',
      title: 'Warteschlange',
      texts: [
        'Die Leiste zeigt, wie viele hochgeladene Fotos, Videos und Musikstücke gerade verarbeitet werden, erneut versucht werden oder noch warten.',
      ],
    },
    {
      key: 'workers',
      title: 'Verarbeitungsdienste',
      texts: [
        'Jeder Verarbeitungsdienst meldet sich regelmäßig: aktiv, verzögert oder getrennt. Dazu stehen Host, Version und woran er gerade arbeitet.',
        'Läuft kein Dienst, bleiben neue Bilder und Videos liegen.',
      ],
    },
    {
      key: 'grid',
      title: 'Stand nach Art',
      texts: [
        'Die Tabelle zählt Fotos, Videos und Musik nach Bereit, In Arbeit und Fehlgeschlagen. Darunter stehen die zuletzt fehlgeschlagenen Verarbeitungen mit Grund.',
      ],
    },
  ],
  storage: [
    AREA_STATE_HINT,
    {
      showsSpot: true,
      key: 'gauge',
      title: 'Belegung',
      texts: [
        'Der Balken teilt den Medienspeicher auf: Originale, Bild-, Video- & Musikfassungen, laufende Uploads, Sonstiges und Frei.',
        'Die Belegung misst eine Hintergrundaufgabe regelmäßig. Oben rechts steht, wann zuletzt gemessen wurde.',
      ],
    },
  ],
  services: [
    AREA_STATE_HINT,
    {
      showsSpot: true,
      key: 'tasks',
      title: 'Hintergrundaufgaben',
      texts: [
        'Hier stehen die Aufgaben, die der Server selbst erledigt – etwa E‑Mails versenden, das Protokoll bereinigen oder an offene Bierkisten erinnern.',
        'Überfällige und fehlgeschlagene Aufgaben stehen oben, mit letztem Lauf und Fehler. Alles, was planmäßig läuft, ist darunter zugeklappt.',
      ],
    },
  ],
  database: [
    AREA_STATE_HINT,
    {
      showsSpot: true,
      key: 'facts',
      title: 'Kennzahlen',
      texts: [
        'Du siehst, ob die Datenbank erreichbar ist, wie schnell sie antwortet, ihre Größe, die Verbindungen und die PostgreSQL-Version.',
        'Steht bei „Ausstehende Schema-Migrationen“ mehr als null, muss der Server neu gestartet werden.',
      ],
    },
    {
      key: 'tables',
      title: 'Größte Tabellen',
      texts: ['„Größte Tabellen“ zeigt, welche Tabellen am meisten Platz belegen.'],
    },
  ],
  mail: [
    AREA_STATE_HINT,
    {
      showsSpot: true,
      key: 'queue',
      title: 'Warteschlange',
      texts: [
        '„In Warteschlange“ zählt E‑Mails, die noch rausgehen. „Erneuter Versuch“ zählt E‑Mails, deren Zustellung fehlschlug – sie werden automatisch noch einmal versucht.',
      ],
    },
  ],
  whatsApp: [
    AREA_STATE_HINT,
    {
      showsSpot: true,
      key: 'queue',
      title: 'Warteschlange',
      texts: [
        'Der Bot sendet Nachrichten einzeln und mit Abstand in die Gruppe. „In Warteschlange“ zählt, was noch wartet, „Erneuter Versuch“, was gerade wiederholt wird.',
        '„Nicht gesendet“ zählt Nachrichten, die auch nach allen Versuchen nicht rausgingen.',
      ],
    },
  ],
  log: [
    {
      showsSpot: true,
      key: 'filter',
      title: 'Filtern und suchen',
      texts: [
        'Wähle bei „Quelle“ Server oder Verarbeitungsdienst und beim „Schweregrad“ ab Info, ab Warnung oder nur Fehler. Das Suchfeld sucht im Text der Einträge.',
      ],
    },
    {
      key: 'lines',
      title: 'Einträge lesen',
      texts: [
        'Die neuesten Einträge stehen oben, nach Tagen getrennt. Gleiche Einträge direkt hintereinander sind zu einer Zeile mit Anzahl zusammengefasst.',
        'Kommen neue Einträge hinzu, holst du sie mit „neue“ oben herein. „Ältere laden“ blättert zurück.',
        'Bei Fehlern klappt „Fehlerdetails“ die genaue Fehlermeldung auf.',
      ],
    },
    {
      key: 'keep',
      title: 'Wie lange es Einträge gibt',
      texts: [
        'Infos bleiben drei Tage, Warnungen und Fehler 30 Tage. Oben rechts steht, seit wann es Einträge gibt.',
      ],
    },
  ],
};
