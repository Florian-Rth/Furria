import type { KkIconName } from '@furria/ui/KkIcon';

export interface LabBeerDraft {
  key: string;
  label: string;
  meta: string;
  icon: KkIconName;
  to: string;
}

export const LAB_BEER_DRAFTS_TITLE = 'Bierliste — Entwürfe';

export const LAB_BEER_DRAFTS: readonly LabBeerDraft[] = [
  {
    key: 'list-a',
    label: 'A · Bierliste',
    meta: 'Der Deckel als Bild',
    icon: 'person',
    to: '/lab/beer-list-a',
  },
  {
    key: 'list-b',
    label: 'B · Bierliste',
    meta: 'Der Abend als Verlauf',
    icon: 'person',
    to: '/lab/beer-list-b',
  },
  {
    key: 'list-c',
    label: 'C · Bierliste',
    meta: 'Kontoauszug',
    icon: 'person',
    to: '/lab/beer-list-c',
  },
  {
    key: 'hub-a',
    label: 'A · Verwalten',
    meta: 'Arbeitsliste',
    icon: 'manage',
    to: '/lab/beer-hub-a',
  },
  {
    key: 'hub-b',
    label: 'B · Verwalten',
    meta: 'Journal + Schnelleingabe',
    icon: 'manage',
    to: '/lab/beer-hub-b',
  },
  {
    key: 'hub-c',
    label: 'C · Verwalten',
    meta: 'Kacheln + Tabelle',
    icon: 'manage',
    to: '/lab/beer-hub-c',
  },
];
