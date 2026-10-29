import type { MyAct } from '@/features/acts/schemas';

export interface LabStudioVariant {
  slug: 'studio-d' | 'studio-e' | 'studio-f';
  title: string;
  lead: string;
}

export const LAB_STUDIO_TITLE = 'Auftritt üben';

export const LAB_STUDIO_VARIANTS: readonly LabStudioVariant[] = [
  { slug: 'studio-d', title: 'Variante D', lead: 'Das Trainervideo füllt den Bildschirm' },
  { slug: 'studio-e', title: 'Variante E', lead: 'Dein Platz und dein Weg auf der Bühne' },
  { slug: 'studio-f', title: 'Variante F', lead: 'Ein Schritt nach dem anderen' },
];

export const labStudioPathOf = (variant: LabStudioVariant, actId: number): string =>
  `/lab/${variant.slug}/${actId}`;

export const studioActsOf = (acts: readonly MyAct[]): MyAct[] =>
  acts.filter((act) => act.kind === 'dance' || act.kind === 'show');

export interface LabStudioEntry {
  key: string;
  label: string;
  meta: string;
  path: string;
}

export const labStudioEntriesOf = (acts: readonly MyAct[]): LabStudioEntry[] =>
  studioActsOf(acts).flatMap((act) =>
    LAB_STUDIO_VARIANTS.map((variant) => ({
      key: `${act.actId}-${variant.slug}`,
      label: `${variant.title} · ${act.name}`,
      meta: variant.lead,
      path: labStudioPathOf(variant, act.actId),
    })),
  );
