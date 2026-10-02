import type { KkIconName } from '../../../KkIcon';

export interface KkDenseFacet {
  text: string;
  icon?: KkIconName;
}

export type KkDenseMeta = string | readonly KkDenseFacet[];

export interface FacetPiece {
  key: string;
  lead: string;
  text: string;
  icon: KkIconName | null;
}

const SEPARATOR = ' · ';
const NO_LEAD = '';

const facetsOf = (meta: KkDenseMeta): readonly KkDenseFacet[] =>
  typeof meta === 'string' ? [{ text: meta }] : meta;

export const facetPiecesOf = (meta: KkDenseMeta | undefined): FacetPiece[] => {
  if (meta === undefined) {
    return [];
  }

  return facetsOf(meta)
    .filter((facet) => facet.text.length > 0)
    .map((facet, index) => ({
      key: `${index}:${facet.text}`,
      lead: index === 0 ? NO_LEAD : SEPARATOR,
      text: facet.text,
      icon: facet.icon ?? null,
    }));
};
