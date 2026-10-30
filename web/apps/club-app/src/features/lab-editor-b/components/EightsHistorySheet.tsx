import { KkSheet } from '@furria/ui/KkSheet';
import type { FC } from 'react';
import { StudioHistorySection } from '@/features/act-studio/components/StudioHistorySection';
import type { Studio } from '@/features/acts/schemas';
import { EIGHTS_HISTORY, EIGHTS_HISTORY_CLOSE } from '../eights-copy';
import { HISTORY_SHEET_ID } from '../eights-sheets';

interface EightsHistorySheetProps {
  actId: number;
  studio: Studio;
}

export const EightsHistorySheet: FC<EightsHistorySheetProps> = ({ actId, studio }) => (
  <KkSheet id={HISTORY_SHEET_ID} title={EIGHTS_HISTORY} closeLabel={EIGHTS_HISTORY_CLOSE}>
    <KkSheet.Body>
      <StudioHistorySection actId={actId} studio={studio} />
    </KkSheet.Body>
  </KkSheet>
);
