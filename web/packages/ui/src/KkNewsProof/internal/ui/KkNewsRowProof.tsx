import type { FC } from 'react';
import { KkNewsRow } from '../../../KkNewsRow/KkNewsRow';
import type { KkNewsProofFacts, KkNewsProofLabels } from '../../news-proof-types';
import { proofSurfaceOf } from '../logic/proof-surface';

interface KkNewsRowProofProps {
  facts: KkNewsProofFacts;
  labels: KkNewsProofLabels;
}

export const KkNewsRowProof: FC<KkNewsRowProofProps> = ({ facts, labels }) => {
  const surface = proofSurfaceOf(facts, labels);

  return (
    <KkNewsRow {...surface} shortDate={facts.shortDate} longDate={facts.longDate} fit="column" />
  );
};
