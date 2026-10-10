import type { ReactNode } from 'react';
import type { KkNewsCategory } from '../../../internal/news-surface/news-category';
import { KkCoverPicture } from '../../../KkCoverPicture';
import type { KkNewsProofFacts, KkNewsProofLabels } from '../../news-proof-types';

export interface KkNewsProofSurface {
  title: string | null;
  teaser: string | null;
  category: KkNewsCategory | null;
  photo: ReactNode;
  posterWord: string;
}

const PICTURE_FIT = { borderRadius: 'inherit' };

export const proofSurfaceOf = (
  facts: KkNewsProofFacts,
  labels: Pick<KkNewsProofLabels, 'posterFallback' | 'untitled'>,
): KkNewsProofSurface => ({
  title: facts.title,
  teaser: facts.teaser,
  category:
    facts.categoryLabel === null || facts.categoryTone === null
      ? null
      : { label: facts.categoryLabel, tone: facts.categoryTone },
  photo:
    facts.pictureSource === null ? null : (
      <KkCoverPicture
        source={facts.pictureSource}
        alt={facts.title ?? labels.untitled}
        sx={PICTURE_FIT}
      />
    ),
  posterWord: facts.categoryLabel ?? labels.posterFallback,
});
