import { KkNewsProofStrip } from '@furria/ui';
import type { FC } from 'react';
import { PROOF_LABELS } from '../../proof-copy';
import type { NewsProofsProps } from './proofs-props';
import { useProofFacts } from './use-proof-facts';
import { useProofSheet } from './use-proof-sheet';

export const NewsProofPeek: FC<NewsProofsProps> = ({
  version,
  publishedAt,
  changedParts,
  liveKey,
  sx,
}) => {
  const facts = useProofFacts({ version, publishedAt, changedParts });
  const openSheet = useProofSheet();

  return (
    <KkNewsProofStrip
      facts={facts}
      labels={PROOF_LABELS}
      liveKey={liveKey}
      onOpen={openSheet}
      sx={sx}
    />
  );
};
