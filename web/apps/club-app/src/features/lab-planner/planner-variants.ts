import type { SeasonEvening } from '@/features/season/schemas';

export type PlannerVariantSlug = 'a' | 'b' | 'c';

export interface PlannerVariant {
  slug: PlannerVariantSlug;
  title: string;
  lead: string;
}

export interface LabPlannerEntry {
  key: string;
  label: string;
  meta: string;
  path: string;
}

export const LAB_SEASON_TITLE = 'Saison planen';
export const LAB_HEUTE_TITLE = 'Heute am Abend';

export const SEASON_VARIANTS: readonly PlannerVariant[] = [
  { slug: 'a', title: 'Saison A', lead: 'Auftritte × Abende als Raster' },
  { slug: 'b', title: 'Saison B', lead: 'Jeder Abend als eigene Spalte' },
  { slug: 'c', title: 'Saison C', lead: 'Nach Stand sortiert, Abende als Punkte' },
];

export const HEUTE_VARIANTS: readonly PlannerVariant[] = [
  { slug: 'a', title: 'Heute A', lead: 'Jetzt groß, darunter Weiter' },
  { slug: 'b', title: 'Heute B', lead: 'Ablauf als Leiste, Rufen rechts' },
  { slug: 'c', title: 'Heute C', lead: 'Ganzer Ablauf links, Bühne mittig' },
];

export const seasonPathOf = (variant: PlannerVariant): string => `/lab/season-${variant.slug}`;

export const heutePathOf = (variant: PlannerVariant, eventId: number): string =>
  `/lab/heute-${variant.slug}/${eventId}`;

export const labSeasonEntriesOf = (): LabPlannerEntry[] =>
  SEASON_VARIANTS.map((variant) => ({
    key: `season-${variant.slug}`,
    label: variant.title,
    meta: variant.lead,
    path: seasonPathOf(variant),
  }));

export const labHeuteEntriesOf = (evenings: readonly SeasonEvening[]): LabPlannerEntry[] =>
  evenings
    .filter((evening) => evening.hasRunningOrder)
    .flatMap((evening) =>
      HEUTE_VARIANTS.map((variant) => ({
        key: `heute-${evening.eventId}-${variant.slug}`,
        label: `${variant.title} · ${evening.title}`,
        meta: variant.lead,
        path: heutePathOf(variant, evening.eventId),
      })),
    );
