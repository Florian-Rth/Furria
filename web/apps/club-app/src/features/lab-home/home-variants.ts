import type { MyAct } from '@/features/acts/schemas';

export type HomeVariantSlug = 'a' | 'b' | 'c';

export interface HomeVariant {
  slug: HomeVariantSlug;
  title: string;
  lead: string;
}

export const LAB_HOME_TITLE = 'Zuhause üben';

export const HOME_VARIANTS: readonly HomeVariant[] = [
  {
    slug: 'a',
    title: 'Üben A',
    lead: 'Video und Bühne nebeneinander, der Schritt dazwischen',
  },
  {
    slug: 'b',
    title: 'Üben B',
    lead: 'Eine Karte pro Schritt, Video und Weg darin',
  },
  {
    slug: 'c',
    title: 'Üben C',
    lead: 'Dein Weg im Mittelpunkt, Zählzeiten als Band',
  },
];

export const homePathOf = (variant: HomeVariant, actId: number): string =>
  `/lab/home-${variant.slug}/${actId}`;

export interface LabHomeEntry {
  key: string;
  label: string;
  meta: string;
  path: string;
}

export const labHomeEntriesOf = (acts: readonly MyAct[]): LabHomeEntry[] =>
  acts
    .filter((act) => act.kind === 'dance' || act.kind === 'show')
    .flatMap((act) =>
      HOME_VARIANTS.map((variant) => ({
        key: `${act.actId}-${variant.slug}`,
        label: `${variant.title} · ${act.name}`,
        meta: variant.lead,
        path: homePathOf(variant, act.actId),
      })),
    );
