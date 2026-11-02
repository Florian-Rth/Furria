import { KkSheet } from '@furria/ui/KkSheet';
import { KkTouchLab } from '@furria/ui/KkTouchLab';
import type { KkSheetAction } from '@furria/ui/sheet-actions';
import type { FC } from 'react';
import type { StageSelectionActions } from '../hooks/use-stage-playground';
import { SELECTION_SHEET_ID } from '../hooks/use-stage-playground';
import {
  CLEAR_SELECTION,
  LINE_UP_SELECTION,
  MIRROR_SELECTION,
  SELECTION_CLOSE,
  SELECTION_SHEET_TITLE,
  selectedCountOf,
} from '../studio-lab-copy';

interface StageSelectionSheetProps {
  selection: StageSelectionActions;
}

export const StageSelectionSheet: FC<StageSelectionSheetProps> = ({ selection }) => {
  const mirror: KkSheetAction = { label: MIRROR_SELECTION, onClick: selection.mirror };
  const lineUp: KkSheetAction = { label: LINE_UP_SELECTION, onClick: selection.lineUp };
  const clear: KkSheetAction = { label: CLEAR_SELECTION, onClick: selection.clear };

  return (
    <KkSheet id={SELECTION_SHEET_ID} title={SELECTION_SHEET_TITLE} closeLabel={SELECTION_CLOSE}>
      <KkSheet.Body>
        <KkTouchLab.Hint text={selectedCountOf(selection.count)} />
      </KkSheet.Body>
      <KkSheet.Actions primary={mirror} secondary={lineUp} tertiary={clear} />
    </KkSheet>
  );
};
