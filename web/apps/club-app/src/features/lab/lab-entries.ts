import type { KkIconName } from '@furria/ui';

export interface LabEntry {
  id: string;
  title: string;
  summary: string;
  icon: KkIconName;
  to: string;
}

export const LAB_TITLE = 'Labor';
export const LAB_LEAD = 'Experimente, die noch keinen festen Platz haben.';
export const LAB_PATH = '/lab';
export const HANDOVER_LAB_BANK = 'Übergabe Kopf → Leiste';

export const HANDOVER_LABS: readonly LabEntry[] = [
  {
    id: 'fallblatt',
    title: 'Fallblatt',
    summary: 'Buchstaben klappen wie eine Fallblattanzeige um',
    icon: 'bolt',
    to: '/lab/fallblatt',
  },
  {
    id: 'konfetti',
    title: 'Konfetti-Dock',
    summary: 'Der Titel fliegt ein und landet mit Konfetti',
    icon: 'bolt',
    to: '/lab/konfetti',
  },
  {
    id: 'tusch',
    title: 'Tusch',
    summary: 'Der Titel landet wie ein Stempel, die Leiste pulsiert dreimal',
    icon: 'bolt',
    to: '/lab/tusch',
  },
  {
    id: 'schunkeln',
    title: 'Schunkeln',
    summary: 'Die Buchstaben schunkeln eingehakt in die Leiste',
    icon: 'bolt',
    to: '/lab/schunkeln',
  },
];

export const LAB_ENTRY_META = `${HANDOVER_LABS.length} Experimente`;
