import type { FC } from 'react';
import type { KkSx } from '../kk-sx';
import { KkNewsProofSheet } from './internal/layout/KkNewsProofSheet';
import { KkNewsProofSheetTitle } from './internal/ui/KkNewsProofSheetTitle';
import { KkNewsProofPanels } from './KkNewsProofPanels';
import type { KkNewsProofFacts, KkNewsProofLabels } from './news-proof-types';

interface KkNewsImpositionProps {
  facts: KkNewsProofFacts;
  labels: KkNewsProofLabels;
  liveKey: number;
  onOpen: () => void;
  sx?: KkSx;
}

export const KkNewsImposition: FC<KkNewsImpositionProps> = ({
  facts,
  labels,
  liveKey,
  onOpen,
  sx,
}) => {
  const changedLabel = facts.changed ? labels.changed : null;

  return (
    <KkNewsProofSheet label={labels.sheet} sx={sx}>
      <KkNewsProofSheetTitle label={labels.sheet} changedLabel={changedLabel} />
      <KkNewsProofPanels
        facts={facts}
        labels={labels}
        liveKey={liveKey}
        arrangement="columns"
        onOpen={onOpen}
      />
    </KkNewsProofSheet>
  );
};
