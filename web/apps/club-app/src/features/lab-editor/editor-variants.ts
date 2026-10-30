import type { MyAct } from '@/features/acts/schemas';

export type EditorVariantSlug = 'a' | 'b' | 'c';

export interface EditorVariant {
  slug: EditorVariantSlug;
  title: string;
  lead: string;
}

export const LAB_EDITOR_TITLE = 'Auftritt bearbeiten';

export const EDITOR_VARIANTS: readonly EditorVariant[] = [
  {
    slug: 'a',
    title: 'Bearbeiten A',
    lead: 'Spuren unter der Bühne, Details rechts',
  },
  {
    slug: 'b',
    title: 'Bearbeiten B',
    lead: 'Achter untereinander, Bühne daneben',
  },
  {
    slug: 'c',
    title: 'Bearbeiten C',
    lead: 'Bühne zuerst, Übersicht und Ausschnitt',
  },
];

export const editorPathOf = (variant: EditorVariant, actId: number): string =>
  `/lab/editor-${variant.slug}/${actId}`;

export interface LabEditorEntry {
  key: string;
  label: string;
  meta: string;
  path: string;
}

export const labEditorEntriesOf = (acts: readonly MyAct[]): LabEditorEntry[] =>
  acts
    .filter((act) => act.kind === 'dance' || act.kind === 'show')
    .flatMap((act) =>
      EDITOR_VARIANTS.map((variant) => ({
        key: `${act.actId}-${variant.slug}`,
        label: `${variant.title} · ${act.name}`,
        meta: variant.lead,
        path: editorPathOf(variant, act.actId),
      })),
    );
