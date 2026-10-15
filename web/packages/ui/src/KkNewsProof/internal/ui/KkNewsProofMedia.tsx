import type { FC } from 'react';
import { KkNewsMedia } from '../../../KkNewsMedia';
import type { KkSx } from '../../../kk-sx';
import type { KkNewsProofFacts, KkNewsProofLabels } from '../../news-proof-types';
import { proofSurfaceOf } from '../logic/proof-surface';

interface KkNewsProofMediaProps {
  facts: KkNewsProofFacts;
  labels: Pick<KkNewsProofLabels, 'untitled'>;
  sx?: KkSx;
}

export const KkNewsProofMedia: FC<KkNewsProofMediaProps> = ({ facts, labels, sx }) => {
  const surface = proofSurfaceOf(facts, labels);

  return <KkNewsMedia photo={surface.photo} sx={sx} />;
};
