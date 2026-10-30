import type { KkHallLayout } from '@furria/ui/KkHall';
import type { StageViewpoint } from '@/features/act-player/stage-view';
import type { MyAct } from '@/features/acts/schemas';

export type HallVariantSlug = 'a' | 'b' | 'c';

export interface HallVariant {
  slug: HallVariantSlug;
  layout: KkHallLayout;
  viewpoint: StageViewpoint;
  title: string;
  lead: string;
}

export const LAB_HALL_TITLE = 'Training in der Halle';

export const HALL_VARIANTS: readonly HallVariant[] = [
  {
    slug: 'a',
    layout: 'wall',
    viewpoint: 'dancers',
    title: 'Halle A',
    lead: 'Riesige Zahl links, Bühne rechts, Tasten unten',
  },
  {
    slug: 'b',
    layout: 'thumbs',
    viewpoint: 'audience',
    title: 'Halle B',
    lead: 'Zwei Daumen, Bühne aus Sicht der Trainerin',
  },
  {
    slug: 'c',
    layout: 'band',
    viewpoint: 'dancers',
    title: 'Halle C',
    lead: 'Acht Zählzeiten als Band, Schritt als Starttaste',
  },
];

export const hallVariantOf = (slug: string): HallVariant | null =>
  HALL_VARIANTS.find((variant) => variant.slug === slug) ?? null;

export const hallPathOf = (variant: HallVariant, actId: number): string =>
  `/lab/hall/${variant.slug}/${actId}`;

export interface LabHallEntry {
  key: string;
  label: string;
  meta: string;
  path: string;
}

export const labHallEntriesOf = (acts: readonly MyAct[]): LabHallEntry[] =>
  acts
    .filter((act) => act.kind === 'dance' || act.kind === 'show')
    .flatMap((act) =>
      HALL_VARIANTS.map((variant) => ({
        key: `${act.actId}-${variant.slug}`,
        label: `${variant.title} · ${act.name}`,
        meta: variant.lead,
        path: hallPathOf(variant, act.actId),
      })),
    );
