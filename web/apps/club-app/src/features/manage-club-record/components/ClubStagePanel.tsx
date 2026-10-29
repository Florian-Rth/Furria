import { KkFieldRow } from '@furria/ui/KkFieldRow';
import { kkTokens } from '@furria/ui/tokens';
import type { FC } from 'react';
import { MISSING_VALUE } from '../club-record-labels';
import type { ClubRecord } from '../schemas';
import { formatStageSize } from '../stage-metres';
import { ClubRecordSection } from './ClubRecordSection';
import { ClubStagePreview } from './ClubStagePreview';

const SIZE_LABEL = 'Breite × Tiefe';
const ARTWORK_LABEL = 'Bühnenzeichnung';
const ARTWORK_PRESENT = 'hinterlegt';
const PREVIEW_SX = { maxWidth: kkTokens.measure.stagePreview, my: 1.5 } as const;

interface ClubStagePanelProps {
  record: ClubRecord;
  highlightedKey: string | null;
}

export const ClubStagePanel: FC<ClubStagePanelProps> = ({ record, highlightedKey }) => {
  const stage = record.stage;
  const size = stage === null ? MISSING_VALUE : formatStageSize(stage);
  const artwork = stage === null || stage.artworkSvg === null ? MISSING_VALUE : ARTWORK_PRESENT;

  const preview =
    stage === null ? null : (
      <ClubStagePreview size={stage} artworkSvg={stage.artworkSvg} sx={PREVIEW_SX} />
    );

  return (
    <ClubRecordSection section="stage" highlightedKey={highlightedKey}>
      <KkFieldRow label={SIZE_LABEL} value={size} />
      <KkFieldRow label={ARTWORK_LABEL} value={artwork} />
      {preview}
    </ClubRecordSection>
  );
};
