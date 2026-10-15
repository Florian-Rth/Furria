import type { ReactNode } from 'react';
import type { KkNewsCategory } from '../../../internal/news-surface/news-category';
import { KkPhoto } from '../../../KkPhoto';
import type { KkNewsProofFacts, KkNewsProofLabels } from '../../news-proof-types';

export interface KkNewsProofSurface {
  title: string | null;
  teaser: string | null;
  category: KkNewsCategory | null;
  photo: ReactNode;
}

export const proofSurfaceOf = (
  facts: KkNewsProofFacts,
  labels: Pick<KkNewsProofLabels, 'untitled'>,
): KkNewsProofSurface => ({
  title: facts.title,
  teaser: facts.teaser,
  category:
    facts.categoryLabel === null || facts.categoryTone === null
      ? null
      : { label: facts.categoryLabel, tone: facts.categoryTone },
  photo:
    facts.pictureSource === null ? null : (
      <KkPhoto image={{ src: facts.pictureSource }} alt={facts.title ?? labels.untitled} fill />
    ),
});
