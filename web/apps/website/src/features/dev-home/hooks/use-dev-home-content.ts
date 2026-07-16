import type { DevHomeContent } from '../types';

const devHomeContent: DevHomeContent = {
  title: 'Interner Testbereich',
  badgeLabel: 'Work in Progress',
  intro:
    'Willkommen hinter den Kulissen! Hier siehst du immer den neuesten Entwicklungsstand der FURRIA-Plattform. Alles kann sich jederzeit ändern — genau dafür ist dieser Bereich da.',
  apps: [
    {
      name: 'Website',
      description:
        'Der öffentliche Auftritt: Programm, Tickets, Neuigkeiten und der Weg in den Verein.',
      statusLabel: 'In Arbeit',
      statusColor: 'warning',
    },
    {
      name: 'Club-App',
      description:
        'Die interne App für Mitglieder: Mitgliederverwaltung, Beiträge, Veranstaltungsplanung, Live-Regie und Getränkekasse.',
      statusLabel: 'Geplant',
      statusColor: 'default',
    },
    {
      name: 'Event-App',
      description:
        'Für Gäste bei Veranstaltungen: Fotos vom Tisch hochladen, Live-Fotowand und das digitale Programmheft.',
      statusLabel: 'Geplant',
      statusColor: 'default',
    },
  ],
};

export const useDevHomeContent = (): DevHomeContent => devHomeContent;
