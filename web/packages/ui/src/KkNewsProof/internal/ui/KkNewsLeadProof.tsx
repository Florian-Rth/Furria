import type { FC } from 'react';
import { KkNewsLead } from '../../../KkNewsLead/KkNewsLead';
import type { KkNewsProofFacts, KkNewsProofLabels } from '../../news-proof-types';
import { proofSurfaceOf } from '../logic/proof-surface';

interface KkNewsLeadProofProps {
  facts: KkNewsProofFacts;
  labels: KkNewsProofLabels;
}

export const KkNewsLeadProof: FC<KkNewsLeadProofProps> = ({ facts, labels }) => {
  const surface = proofSurfaceOf(facts, labels);
  const readingTime = facts.readingTime ?? null;

  return (
    <KkNewsLead
      {...surface}
      date={facts.longDate}
      readMoreLabel={labels.readMore}
      readingTime={readingTime}
      fit="column"
    />
  );
};
