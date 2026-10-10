import type { FC } from 'react';
import { KkNewsCard } from '../../../KkNewsCard/KkNewsCard';
import type { KkNewsProofFacts, KkNewsProofLabels } from '../../news-proof-types';
import { proofSurfaceOf } from '../logic/proof-surface';

interface KkNewsCardProofProps {
  facts: KkNewsProofFacts;
  labels: KkNewsProofLabels;
}

export const KkNewsCardProof: FC<KkNewsCardProofProps> = ({ facts, labels }) => {
  const surface = proofSurfaceOf(facts, labels);

  return <KkNewsCard {...surface} date={facts.shortDate} fit="column" />;
};
