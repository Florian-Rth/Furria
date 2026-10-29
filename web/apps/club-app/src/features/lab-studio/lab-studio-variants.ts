import type { MyAct } from '@/features/acts/schemas';

export interface LabStudioVariant {
  slug: 'studio-a' | 'studio-b' | 'studio-c';
  title: string;
  lead: string;
}

export const LAB_STUDIO_TITLE = 'Auftritt üben';

export const LAB_STUDIO_VARIANTS: readonly LabStudioVariant[] = [
  { slug: 'studio-a', title: 'Variante A', lead: 'Video, Bühne und Musik übereinander' },
  { slug: 'studio-b', title: 'Variante B', lead: 'Die Schrittfolge ist der Bildschirm' },
  { slug: 'studio-c', title: 'Variante C', lead: 'Alle Spuren auf einer Zeitleiste' },
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
