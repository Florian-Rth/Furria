import type { KkIconName } from '@furria/ui/KkIcon';
import type { MyAct } from '@/features/acts/schemas';

export type StudioLabPlayground = 'timeline' | 'stage' | 'lists' | 'rail';

export interface StudioLabEntry {
  playground: StudioLabPlayground;
  title: string;
  meta: string;
  icon: KkIconName;
}

export const STUDIO_LAB_ENTRIES: readonly StudioLabEntry[] = [
  {
    playground: 'timeline',
    title: 'Zeitleiste',
    meta: 'Spulen, zoomen, Schnitt, Schrittgrenze',
    icon: 'timeline',
  },
  {
    playground: 'stage',
    title: 'Bühne',
    meta: 'Punkte, Auswahl, Bogen, Wegpunkte',
    icon: 'stage',
  },
  { playground: 'lists', title: 'Listen', meta: 'Liedfolge, Plätze besetzen', icon: 'list' },
  {
    playground: 'rail',
    title: 'Schrittleiste',
    meta: 'Üben: wischen, Schritt wiederholen',
    icon: 'music',
  },
];

export const studioLabEntryOf = (slug: string): StudioLabEntry | null =>
  STUDIO_LAB_ENTRIES.find((entry) => entry.playground === slug) ?? null;

export const studioLabPathOf = (playground: StudioLabPlayground): string =>
  `/lab/studio/${playground}`;

export const labActIdOf = (
  acts: readonly MyAct[],
  requested: number | undefined,
): number | null => {
  if (requested !== undefined) {
    return requested;
  }
  const playable = acts.filter((act) => act.playable);
  const led = playable.find((act) => act.viewerLeads);

  return (led ?? playable[0] ?? acts[0])?.actId ?? null;
};
