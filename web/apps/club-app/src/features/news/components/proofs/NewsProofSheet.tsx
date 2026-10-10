import { KkNewsProofPanels, KkSheet } from '@furria/ui';
import type { FC } from 'react';
import { PEEK_CLOSE_LABEL, PEEK_SHEET_ID, PEEK_SHEET_TITLE, PROOF_LABELS } from '../../proof-copy';
import type { NewsProofsProps } from './proofs-props';
import { useProofFacts } from './use-proof-facts';

export const NewsProofSheet: FC<NewsProofsProps> = ({
  version,
  publishedAt,
  changedParts,
  liveKey,
}) => {
  const facts = useProofFacts({ version, publishedAt, changedParts });

  return (
    <KkSheet id={PEEK_SHEET_ID} title={PEEK_SHEET_TITLE} closeLabel={PEEK_CLOSE_LABEL}>
      <KkSheet.Body>
        <KkNewsProofPanels facts={facts} labels={PROOF_LABELS} liveKey={liveKey} />
      </KkSheet.Body>
    </KkSheet>
  );
};
