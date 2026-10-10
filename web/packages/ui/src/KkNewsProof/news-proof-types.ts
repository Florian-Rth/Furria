export type KkNewsTone = 'red' | 'gold' | 'ink';

export type KkNewsProofKind = 'lead' | 'row' | 'card' | 'whatsapp';

export const KK_NEWS_PROOF_KINDS: readonly KkNewsProofKind[] = ['lead', 'row', 'card', 'whatsapp'];

export interface KkNewsProofFacts {
  title: string | null;
  teaser: string | null;
  categoryLabel: string | null;
  categoryTone: KkNewsTone | null;
  pictureSource: string | null;
  longDate: string;
  readingTime?: string | null;
  shortDate: string;
  clock: string;
  host: string;
  changed: boolean;
}

export interface KkNewsProofLabels {
  panels: Record<KkNewsProofKind, string>;
  tiles: Record<KkNewsProofKind, string>;
  sheet: string;
  open: string;
  enlarge: string;
  cut: string;
  changed: string;
  live: string;
  untitled: string;
  teaserPlaceholder: string;
  readMore: string;
  posterFallback: string;
  readMark: string;
}
